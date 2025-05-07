import os
import ssl
import urllib3
import requests
import subprocess
from pyannote.audio.pipelines import SpeakerDiarization
from utils.logger import configure_logger

# SSL 검증 완전 비활성화
ssl._create_default_https_context = ssl._create_unverified_context
urllib3.disable_warnings()
requests.packages.urllib3.disable_warnings()

# SSL 관련 환경 변수 설정
os.environ['HF_HUB_DISABLE_SSL_VERIFY'] = '1'
os.environ['CURL_CA_BUNDLE'] = ''
os.environ['REQUESTS_CA_BUNDLE'] = ''
os.environ['SSL_CERT_FILE'] = ''

logger = configure_logger()

# Hugging Face 토큰 환경 변수에서 가져오기
HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN")

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

# 화자 분리 파이프라인 로딩 (프로세스 시작 시 1회)
try:
    logger.info("화자 분리 모델 로딩 중...")
    pipeline = SpeakerDiarization.from_pretrained(
        "pyannote/speaker-diarization",
        use_auth_token=HUGGINGFACE_TOKEN
    )
    logger.info("화자 분리 모델 로드 완료!")
    
except Exception as e:
    logger.error(f"화자 분리 모델 로드 실패: {e}")
    raise

# 화자 분리 실행 함수
def apply_diarization(audio_path):
    try:
        # 1. 16kHz mono로 전처리 자동 수행
        preprocessed_path = "/tmp/converted.wav"
        convert_to_16k_mono(audio_path, preprocessed_path)
        # 2. 화자 분리 수행        
        diarization = pipeline(audio_path)
        logger.info("화자 분리 처리 완료")
        return diarization
    
    except Exception as e:
        logger.error(f"화자 분리 실패: {e}")
        raise

# 화자 정보와 Whisper 세그먼트 통합 함수 (음성 인식 결과와 화자 분리 결과 통합)
def merge_segments_with_speakers(segments_all, diarization):
    transcript = []
    for segment in segments_all:
        # 각 세그먼트의 중간 시점 계산
        mid = (segment["start"] + segment["end"]) / 2
        speaker_label = "Unknown"
        # 해당 시점의 화자 찾기
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            if turn.start <= mid <= turn.end:
                speaker_label = speaker
                break
        # 결과 저장    
        transcript.append({
            "speaker": speaker_label,
            "text": segment["text"].strip(),
            "start": float(segment["start"]),
            "end": float(segment["end"])
        })
    return transcript
