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
os.environ["HUGGINGFACE_TOKEN"] = "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"
HUGGINGFACE_TOKEN = os.environ["HUGGINGFACE_TOKEN"]

# 오디오 파일을 16kHz mono로 변환하는 전처리 함수
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

# 화자 분리 파이프라인 로딩 (프로세스 시작 시 1회)
try:
    logger.info("화자 분리 모델 로딩 중...")
    # Hugging Face에서 사전학습된 화자 분리 모델(pyannote/speaker-diarization) 로드
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
        try:
            convert_to_16k_mono(audio_path, preprocessed_path)
            logger.info("ffmpeg 전처리 성공")
        except Exception as e:
            logger.error(f"[전처리 실패] ffmpeg 오류: {e}")
            raise RuntimeError("ffmpeg 전처리 단계에서 실패")
        
        # 2. 화자 분리 수행 : 사전 로딩된 pyannote SpeakerDiarization 파이프라인에 전달
        try:
            diarization = pipeline(preprocessed_path)
            logger.info("화자 분리 처리 완료")
            return diarization
        except Exception as e:
            logger.error(f"[화자 분리 실패] pyannote 오류: {e}")
            raise RuntimeError("화자 분리 단계에서 실패")   
    except Exception as e:
        logger.error(f"화자 분리 전체 오류: {e}")
        raise

# 화자 정보와 Whisper 세그먼트 통합 함수 (음성 인식 결과와 화자 분리 결과 통합)
def merge_segments_with_speakers(segments_all, diarization):
    transcript = []
    
    # diarization 결과를 (시작~끝 구간, _, 화자라벨) 형태의 리스트로 변환
    tracks = list(diarization.itertracks(yield_label=True))
    
    for segment in segments_all:
        # 각 세그먼트의 중간 시점 계산
        mid = (segment["start"] + segment["end"]) / 2
        speaker_label = "Unknown"
        
        # 해당 시점의 화자 찾기 (중심 시간이 포함되는 화자 구간을 찾아 해당 화자 라벨 지정)
        for turn, _, speaker in tracks:
            if turn.start <= mid <= turn.end:
                speaker_label = speaker
                break
        # 통합된 결과(화자, 텍스트, 시작/종료 시간)를 transcript 리스트에 추가
        transcript.append({
            "speaker": speaker_label,
            "text": segment["text"].strip(),
            "start": float(segment["start"]),
            "end": float(segment["end"])
        })
    
    # 화자 정보가 포함된 전체 전사(transcript) 반환    
    return transcript
