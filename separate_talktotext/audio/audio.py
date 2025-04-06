import os
import tempfile
import requests
from pydub import AudioSegment
import whisper
from utils.logger import configure_logger
from utils.cleaner import cleanup_chunks

logger = configure_logger()

# Whisper 모델 로드 (기본 base 모델)
logger.info("Whisper 모델 로딩 중...")
model = whisper.load_model("medium") # medium, large 사용하자
logger.info("Whisper 모델 로드 완료")

# 오디오 URL에서 다운로드 함수
def download_audio(url):
    try:
        response = requests.get(url, timeout=30, verify=False)
        response.raise_for_status()
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(response.content)
            return temp_file.name
    except Exception as e:
        logger.error(f"오디오 다운로드 실패: {e}")
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

# 전체 오디오 처리 파이프라인 함수 (다운로드 + 청크 + Whisper + 반환)
def process_audio(audio_url):
    try:
        # 사용자가 보내준 오디오 URL에서 실제 파일을 다운로드
        audio_path = download_audio(audio_url)
        # 다운로드 받은 오디오 파일을 1분(60,000ms) 단위로 분할
        chunk_paths = chunk_audio(audio_path)
        logger.info(f"총 {len(chunk_paths)}개의 청크 생성됨")

        # 1. 초기화
        segments_all = []   # 모든 음성 세그먼트를 저장할 리스트
        full_text = ""      # 전체 텍스트를 저장할 변수

        # 3. 각 청크별 처리
        for chunk_path in chunk_paths:
            logger.info(f"Whisper 처리 진행 중: {chunk_path}")
            # Whisper 모델로 음성을 텍스트로 변환
            result = model.transcribe(chunk_path)
            # 세그먼트와 텍스트 저장
            segments_all.extend(result["segments"])
            full_text += result["text"].strip() + "\n"
            
        return segments_all, full_text
    
    # 2. 예외 처리
    except Exception as e:
        logger.error(f"오디오 처리 실패: {e}")
        raise
    finally:
        cleanup_chunks()
        if os.path.exists(audio_path):
            os.remove(audio_path)
