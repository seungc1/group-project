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
# 병렬처리를 위해 ThreadPoolExecutor와 as_completed를 사용
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

# Whisper 모델 로드 (기본 base 모델)
logger.info("Whisper 모델 로딩 중...")
model = whisper.load_model("medium") # medium, large 사용하자
logger.info("Whisper 모델 로드 완료")

# 오디오 URL에서 다운로드 함수
def download_audio(url):
    try:
        response = requests.get(url, timeout=30, verify=False)  # SSL 검증 비활성화
        response.raise_for_status()
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(response.content)
            return temp_file.name
    except Exception as e:
        logger.error(f"오디오 다운로드 실패: {e}")
        raise

# 오디오 파일을 16kHz mono로 변환하는 전처리 함수
def convert_to_16k_mono(input_path: str, output_path: str) -> str:
    try:
        command = [
            'ffmpeg',
            '-y',
            '-i', input_path,
            '-ac', '1',
            '-ar', '16000',
            output_path
        ]
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        logger.info(f"[전처리 완료] {output_path} (16kHz mono)")
        return output_path
    except subprocess.CalledProcessError as e:
        logger.error(f"오디오 전처리 실패: {e}")
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
        
        chunk_paths = chunk_audio(audio_path)
        logger.info(f"총 {len(chunk_paths)}개의 청크 생성됨")

        segments_all = []
        full_text_parts = []

        def transcribe_chunk(chunk_path):
            logger.info(f"Whisper 처리 진행 중: {chunk_path}")
            result = model.transcribe(chunk_path)
            return result["segments"], result["text"].strip()

        # 병렬 처리
        with ThreadPoolExecutor() as executor:
            futures = {executor.submit(transcribe_chunk, path): path for path in chunk_paths}

            for future in as_completed(futures):
                try:
                    segments, text = future.result()
                    segments_all.extend(segments)
                    full_text_parts.append(text)
                except Exception as e:
                    logger.error(f"Whisper 청크 처리 중 오류 발생: {e}")

        full_text = "\n".join(full_text_parts)
        return segments_all, full_text

    except Exception as e:
        logger.error(f"Whisper 병렬 처리 실패: {e}")
        raise

    finally:
        cleanup_chunks()

