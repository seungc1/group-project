import os
import ssl
import urllib3
import requests
import tempfile
import subprocess
from pydub import AudioSegment
import whisper
from utils.logger import configure_logger
from utils.cleaner import cleanup_chunks
from concurrent.futures import ThreadPoolExecutor, as_completed

# SSL 검증 완전 비활성화
ssl._create_default_https_context = ssl._create_unverified_context
urllib3.disable_warnings()
requests.packages.urllib3.disable_warnings()

# 환경 변수 설정
os.environ['HF_HUB_DISABLE_SSL_VERIFY'] = '1'
os.environ['CURL_CA_BUNDLE'] = ''
os.environ['REQUESTS_CA_BUNDLE'] = ''
os.environ['SSL_CERT_FILE'] = ''

logger = configure_logger()

# Whisper 모델 로드 (medium 모델)
logger.info("Whisper 모델 로딩 중...")
model = whisper.load_model("medium") # 모델 로드
logger.info("Whisper 모델 로드 완료")

# 오디오 URL에서 오디오 파일을 다운로드하여 로컬 임시 파일로 저장하는 함수
def download_audio(url):
    try:
        # 지정된 URL로부터 오디오 파일 요청 (타임아웃: 30초, SSL 인증 무시)
        response = requests.get(url, timeout=30, verify=False)  # SSL 검증 비활성화
        # 응답 코드가 성공(200번대)이 아닌 경우 예외 발생
        response.raise_for_status()
        
        # 임시 WAV 파일 생성 (delete=False: 파일 자동 삭제되지 않음)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            # 응답 받은 오디오 바이너리 데이터를 임시 파일에 저장
            temp_file.write(response.content)
            # 생성된 임시 파일 경로 반환
            return temp_file.name
    except Exception as e:
        logger.error(f"오디오 다운로드 실패: {e}")
        raise

# 오디오 파일을 16kHz mono WAV 파일로 변환하는 전처리 함수 (ffmpeg 사용)
"""
    ffmpeg를 사용하여 입력 오디오 파일을 16kHz, mono 채널의 WAV 형식으로 변환합니다.
    지원 형식: mp3, m4a, mp4, wav 등 대부분의 ffmpeg 지원 오디오 파일

    Args:
        input_path (str): 원본 오디오 파일 경로
        output_path (str): 변환된 출력 경로 (.wav)

    Returns:
        str: 변환된 파일의 경로
    """
def convert_to_16k_mono(input_path: str, output_path: str = "/tmp/converted.wav") -> str:
    try:
        # output_path가 .wav 확장자가 아니면 강제로 변경
        if not output_path.lower().endswith(".wav"):
            output_path = os.path.splitext(output_path)[0] + ".wav"

        command = [
            "ffmpeg",
            "-y",  # 덮어쓰기 허용
            "-i", input_path,
            "-ac", "1",          # mono
            "-ar", "16000",      # 16kHz
            output_path
        ]
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)

        logger.info(f"[전처리 완료] {output_path} (16kHz mono)")
        return output_path

    except subprocess.CalledProcessError as e:
        logger.error(f"[전처리 실패] ffmpeg 오류: {e.stderr.decode(errors='ignore')}")
        raise
    except Exception as e:
        logger.exception(f"[전처리 실패] 알 수 없는 오류: {e}")
        raise

# 오디오 파일을 1분 단위로 청크 분할
def chunk_audio(audio_path, chunk_length_ms=60000):
    # 1. AudioSegment를 사용하여 오디오 파일 로드
    audio = AudioSegment.from_file(audio_path)
    # 2. chunks 디렉토리 생성 (없으면 생성, 있으면 무시)
    os.makedirs("chunks", exist_ok=True)
    # 3. 청크 파일들의 경로를 저장할 리스트
    chunk_paths = []
    # 4. 오디오를 chunk_length_ms(기본값 60000ms = 1분) 단위로 분할
    for i in range(0, len(audio), chunk_length_ms):
        # 현재 위치부터 chunk_length_ms만큼의 오디오 추출
        chunk = audio[i:i + chunk_length_ms]
        # 청크 파일 경로 생성 (예: chunks/chunk_1.wav, chunks/chunk_2.wav, ...)
        chunk_path = f"chunks/chunk_{i//chunk_length_ms + 1}.wav"
        # 청크를 WAV 형식으로 저장
        chunk.export(chunk_path, format="wav")
        # 저장된 청크 파일의 경로를 리스트에 추가
        chunk_paths.append(chunk_path)
    # 5. 모든 청크 파일의 경로 반환            
    return chunk_paths

# Whisper 전용 처리 함수 (audio_path 기반, 병렬 처리용)
def process_whisper_from_path(audio_path):
    try:
        # 자동 전처리 수행 (16kHz mono 변환)
        converted_path = "/tmp/converted_whisper.wav"
        convert_to_16k_mono(audio_path, converted_path)
        
        # 청크 분할 수행
        chunk_paths = chunk_audio(converted_path)
        logger.info(f"총 {len(chunk_paths)}개의 청크 생성됨")

        segments_all = []   # 모든 청크의 세그먼트 결과 저장용 리스트  
        full_text_parts = []    # 청크별 텍스트를 순차적으로 누적

        # 각 청크에 대해 Whisper STT 수행 함수 정의
        def transcribe_chunk(chunk_path):
            logger.info(f"Whisper 처리 진행 중: {chunk_path}")
            result = model.transcribe(chunk_path)
            return result["segments"], result["text"].strip()

        # ThreadPoolExecutor를 활용한 병렬 처리 수행
        with ThreadPoolExecutor() as executor:
            # 각 청크에 대해 STT 작업 제출
            futures = {executor.submit(transcribe_chunk, path): path for path in chunk_paths}

            # 완료된 작업 순서대로 결과 수집
            for future in as_completed(futures):
                try:
                    segments, text = future.result()
                    segments_all.extend(segments)   # 세그먼트 누적
                    full_text_parts.append(text)    # 텍스트 누적
                except Exception as e:
                    logger.error(f"Whisper 청크 처리 중 오류 발생: {e}")

        # 모든 청크 텍스트를 줄바꿈으로 연결하여 전체 텍스트 구성
        full_text = "\n".join(full_text_parts)
        return segments_all, full_text

    except Exception as e:
        logger.error(f"Whisper 병렬 처리 실패: {e}")
        raise

    finally:
        cleanup_chunks()
