import os
import ssl
import urllib3
import requests
import tempfile
import subprocess
import whisper
from utils.logger import configure_logger
from utils.cleaner import cleanup_chunks

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
model = whisper.load_model("medium")
logger.info("Whisper 모델 로드 완료")

# 오디오 URL에서 오디오 파일 다운로드
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

# 오디오 파일 16kHz mono 변환 (ffmpeg 사용)
def convert_to_16k_mono(input_path: str, output_path: str = "/tmp/converted.wav") -> str:
    try:
        if not output_path.lower().endswith(".wav"):
            output_path = os.path.splitext(output_path)[0] + ".wav"

        command = [
            "ffmpeg",
            "-y",
            "-i", input_path,
            "-ac", "1",
            "-ar", "16000",
            output_path
        ]
        subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        logger.info(f"[전처리 완료] {output_path} (16kHz mono)")
        return output_path

    except subprocess.CalledProcessError as e:
        logger.error(f"[전처리 실패] ffmpeg 오류: {e.stderr.decode(errors='ignore')}")
        raise
    except Exception as e:
        logger.exception(f"[전처리 실패] 알 수 없는 오류: {e}")
        raise

# Whisper 전체 오디오 처리 (chunk 없이 전체 transcribe)
def process_whisper_from_path(audio_path):
    try:
        # 자동 전처리 수행 (16kHz mono 변환)
        converted_path = "/tmp/converted_whisper.wav"
        convert_to_16k_mono(audio_path, converted_path)

        logger.info(f"Whisper 전체 오디오 처리 시작: {converted_path}")

        # 전체 오디오 파일 Whisper 처리
        result = model.transcribe(converted_path)

        segments = result.get("segments", [])
        text = result.get("text", "").strip()

        logger.info(f"Whisper 전체 오디오 처리 완료: 총 {len(segments)}개 segments, 전체 텍스트 길이 {len(text)}자")

        return segments, text

    except Exception as e:
        logger.error(f"Whisper 전체 오디오 처리 실패: {e}")
        raise

    finally:
        cleanup_chunks()

# import os
# import ssl
# import urllib3
# import requests
# import tempfile
# import subprocess
# from pydub import AudioSegment
# import whisper
# from utils.logger import configure_logger
# from utils.cleaner import cleanup_chunks
# from concurrent.futures import ThreadPoolExecutor, as_completed
# import librosa
# import numpy as np
# from pydub.effects import strip_silence

# # SSL 검증 완전 비활성화
# ssl._create_default_https_context = ssl._create_unverified_context
# urllib3.disable_warnings()
# requests.packages.urllib3.disable_warnings()

# # 환경 변수 설정
# os.environ['HF_HUB_DISABLE_SSL_VERIFY'] = '1'
# os.environ['CURL_CA_BUNDLE'] = ''
# os.environ['REQUESTS_CA_BUNDLE'] = ''
# os.environ['SSL_CERT_FILE'] = ''

# logger = configure_logger()

# # Whisper 모델 로드 (small 모델)
# logger.info("Whisper 모델 로딩 중...")
# model = whisper.load_model("small")
# logger.info("Whisper 모델 로드 완료")

# # 오디오 URL에서 다운로드
# def download_audio(url):
#     try:
#         response = requests.get(url, timeout=30, verify=False)
#         response.raise_for_status()

#         with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
#             temp_file.write(response.content)
#             return temp_file.name
#     except Exception as e:
#         logger.error(f"오디오 다운로드 실패: {e}")
#         raise

# # 오디오 16kHz mono 변환 (ffmpeg 사용)
# def convert_to_16k_mono(input_path: str, output_path: str = "/tmp/converted.wav") -> str:
#     try:
#         if not output_path.lower().endswith(".wav"):
#             output_path = os.path.splitext(output_path)[0] + ".wav"

#         command = [
#             "ffmpeg",
#             "-y",
#             "-i", input_path,
#             "-ac", "1",
#             "-ar", "16000",
#             output_path
#         ]
#         subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
#         logger.info(f"[전처리 완료] {output_path} (16kHz mono)")
#         return output_path

#     except subprocess.CalledProcessError as e:
#         logger.error(f"[전처리 실패] ffmpeg 오류: {e.stderr.decode(errors='ignore')}")
#         raise
#     except Exception as e:
#         logger.exception(f"[전처리 실패] 알 수 없는 오류: {e}")
#         raise

# # 오디오 청크 분할 (strip_silence 적용)
# def chunk_audio(audio_path, chunk_length_ms=60000):
#     audio = AudioSegment.from_file(audio_path)
#     os.makedirs("chunks", exist_ok=True)
#     chunk_paths = []

#     for i in range(0, len(audio), chunk_length_ms):
#         chunk = audio[i:i + chunk_length_ms]

#         # Silence trim 적용
#         chunk = strip_silence(chunk, silence_len=300, silence_thresh=-40)
        
#         rms = chunk.rms
#         duration_sec = len(chunk) / 1000.0

#         if duration_sec < 0.8:
#             logger.warning(f"너무 짧은 청크 건너뜀 (chunk_{i//chunk_length_ms + 1}, {duration_sec:.2f} sec)")
#             continue

#         if rms < 200:  # threshold 200 ~ 500 추천
#             logger.warning(f"무음 청크 건너뜀 (chunk_{i//chunk_length_ms + 1}, RMS={rms})")
#             continue

#         chunk_path = f"chunks/chunk_{i//chunk_length_ms + 1}.wav"
#         chunk.export(chunk_path, format="wav")
#         chunk_paths.append(chunk_path)

#     return chunk_paths

# # Whisper 전용 처리 함수 (audio_path 기반, 병렬 처리용)
# def process_whisper_from_path(audio_path):
#     try:
#         # 자동 전처리 수행
#         converted_path = "/tmp/converted_whisper.wav"
#         convert_to_16k_mono(audio_path, converted_path)

#         # 청크 분할 수행
#         chunk_paths = chunk_audio(converted_path)
#         logger.info(f"총 {len(chunk_paths)}개의 청크 생성됨")

#         segments_all = []
#         full_text_parts = []

#         def transcribe_chunk(chunk_path):
#             logger.info(f"Whisper 처리 진행 중: {chunk_path}")

#             if os.path.getsize(chunk_path) == 0:
#                 logger.warning(f"빈 청크 파일 건너뜀 (0바이트): {chunk_path}")
#                 return [], ""

#             try:
#                 y, sr = librosa.load(chunk_path, sr=None)
#                 duration = librosa.get_duration(y=y, sr=sr)
#             except Exception as e:
#                 logger.warning(f"librosa 로드 실패, 청크 건너뜀: {chunk_path}, 오류: {e}")
#                 return [], ""

#             if duration < 1.5:
#                 logger.warning(f"너무 짧은 청크 건너뜀: {chunk_path} ({duration:.2f} sec)")
#                 return [], ""

#             rms = np.sqrt(np.mean(y ** 2))
#             if rms < 1e-3:
#                 logger.warning(f"무음 청크 건너뜀 (RMS={rms:.6f}): {chunk_path}")
#                 return [], ""

#             if len(y) < sr * 0.3:
#                 logger.warning(f"너무 짧은 오디오 frame 건너뜀 (len(y)={len(y)}): {chunk_path}")
#                 return [], ""

#             # 가장 중요한 단계: model.transcribe 자체 try-except 처리
#             try:
#                 result = model.transcribe(chunk_path, verbose=False)
#             except Exception as e:
#                 logger.error(f"Whisper transcribe 단계에서 에러 발생, Skip: {e}")
#                 return [], ""

#             segments = result.get("segments", [])
#             text = result.get("text", "").strip()

#             if not text:
#                 logger.warning(f"Whisper 텍스트 비어 있음, Skip: {chunk_path}")
#                 return [], ""

#             if len(text.split()) < 2:
#                 logger.warning(f"텍스트 단어 수 부족으로 Skip: {chunk_path}, text: '{text}'")
#                 return [], ""

#             if not segments or len(segments) == 0:
#                 logger.warning(f"Whisper 처리 결과가 비어 있음, Skip: {chunk_path}")
#                 return [], ""

#             return segments, text

#         # ThreadPoolExecutor 병렬 처리
#         with ThreadPoolExecutor() as executor:
#             futures = {executor.submit(transcribe_chunk, path): path for path in chunk_paths}

#             for future in as_completed(futures, timeout=300):
#                 try:
#                     segments, text = future.result(timeout=15)
#                     segments_all.extend(segments)
#                     full_text_parts.append(text)
#                 except Exception as e:
#                     logger.error(f"Whisper 청크 처리 중 오류 발생 또는 timeout: {e}")

#         full_text = "\n".join(full_text_parts)
#         return segments_all, full_text

#     except Exception as e:
#         logger.error(f"Whisper 병렬 처리 실패: {e}")
#         raise

#     finally:
#         cleanup_chunks()
