from flask import Flask, request, jsonify
import whisper
from pyannote.audio.pipelines import SpeakerDiarization
import os
from pydub import AudioSegment
import tempfile
import requests
import logging
import ssl
import urllib3
import traceback
import sys

# SSL 인증서 검증 비활성화
ssl._create_default_https_context = ssl._create_unverified_context
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 로깅 설정 개선
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# CORS 설정 추가
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

# Hugging Face Token (화자분리용)
HUGGINGFACE_TOKEN = "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"

# 모델 로드
try:
    logger.info("Whisper 모델 로딩 시작...")
    model = whisper.load_model("base")  # medium 대신 base 모델 사용
    logger.info("Whisper 모델 로드 완료")
    
    logger.info("Speaker Diarization 모델 로딩 시작...")
    pipeline = SpeakerDiarization.from_pretrained(
        "pyannote/speaker-diarization",
        use_auth_token=HUGGINGFACE_TOKEN
    )
    logger.info("Speaker Diarization 모델 로드 완료")
except Exception as e:
    logger.error(f"모델 로드 실패: {str(e)}")
    logger.error(traceback.format_exc())
    raise

def download_audio(url):
    try:
        logger.info(f"음성 파일 다운로드 시작: {url}")
        response = requests.get(url, timeout=30, verify=False)
        response.raise_for_status()
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(response.content)
            logger.info(f"음성 파일 다운로드 완료: {temp_file.name}")
            return temp_file.name
    except requests.exceptions.RequestException as e:
        logger.error(f"음성 파일 다운로드 실패 (네트워크 오류): {str(e)}")
        logger.error(traceback.format_exc())
        return None
    except Exception as e:
        logger.error(f"음성 파일 다운로드 실패: {str(e)}")
        logger.error(traceback.format_exc())
        return None

def process_audio(audio_path):
    try:
        # 1. Whisper로 음성 인식
        logger.info(f"음성 인식 시작 (파일: {audio_path})")
        result = model.transcribe(audio_path)
        segments = result["segments"]
        logger.info(f"음성 인식 완료: {len(segments)}개 세그먼트")
        
        # 2. 화자 분리
        logger.info("화자 분리 시작")
        diarization = pipeline(audio_path)
        logger.info("화자 분리 완료")
        
        # 3. 결과 처리
        transcript = []
        for segment in segments:
            mid = (segment["start"] + segment["end"]) / 2
            speaker_label = "Unknown"
            for turn, _, speaker in diarization.itertracks(yield_label=True):
                if turn.start <= mid <= turn.end:
                    speaker_label = speaker
                    break
            transcript.append({
                "speaker": speaker_label,
                "text": segment["text"].strip(),
                "start": float(segment["start"]),
                "end": float(segment["end"])
            })
        
        logger.info(f"처리 완료: {len(transcript)}개 발화 세그먼트")
        return transcript
    except Exception as e:
        logger.error(f"음성 처리 실패: {str(e)}")
        logger.error(traceback.format_exc())
        raise

@app.route('/process-audio', methods=['POST'])
def process_audio_endpoint():
    try:
        logger.info("음성 처리 요청 수신")
        logger.info(f"요청 헤더: {request.headers}")
        
        data = request.get_json()
        logger.info(f"요청 데이터: {data}")
        
        if not data:
            logger.error("요청 데이터 없음")
            return jsonify({"success": False, "error": "요청 데이터가 없습니다"}), 400
            
        audio_url = data.get('audioUrl')
        if not audio_url:
            logger.error("음성 URL 없음")
            return jsonify({"success": False, "error": "음성 파일 URL이 제공되지 않았습니다"}), 400
            
        # 1. 음성 파일 다운로드
        audio_path = download_audio(audio_url)
        if not audio_path:
            return jsonify({"success": False, "error": "음성 파일 다운로드 실패"}), 400
            
        # 2. 음성 처리
        try:
            transcript = process_audio(audio_path)
        except Exception as e:
            logger.error(f"음성 처리 중 오류: {str(e)}")
            return jsonify({"success": False, "error": f"음성 처리 중 오류가 발생했습니다: {str(e)}"}), 500
        
        # 3. 임시 파일 삭제
        try:
            os.unlink(audio_path)
            logger.info("임시 파일 삭제 완료")
        except Exception as e:
            logger.warning(f"임시 파일 삭제 실패: {str(e)}")
        
        return jsonify({
            "success": True,
            "transcript": transcript
        })
        
    except Exception as e:
        logger.error(f"처리 중 오류 발생: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True) 