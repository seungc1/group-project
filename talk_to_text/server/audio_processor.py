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
from flask_cors import CORS
from collections import Counter
import re
import firebase_admin
from firebase_admin import credentials, firestore, storage
from konlpy.tag import Okt  # 한국어 키워드 추출용

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
app = Flask(__name__)
CORS(app)

# Hugging Face Token (화자분리용)
HUGGINGFACE_TOKEN = "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"

# Upstage API Key 설정
UPSTAGE_API_KEY = "up_sH6XQ36Gg4Sgu1iso3fin3jWYtBFL"

# Firebase 인증 및 Firestore 클라이언트 초기화
try:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred, {
        "storageBucket": "talktotext-37f54.firebasestorage.app"
    })
    db = firestore.client()
    logger.info("Firebase 초기화 완료")
except Exception as e:
    logger.error(f"Firebase 초기화 실패: {str(e)}")
    logger.error(traceback.format_exc())
    raise

# 모델 로드
try:
    logger.info("Whisper 모델 로딩 시작...")
    model = whisper.load_model("base")
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

# 한국어 키워드 추출 함수
def extract_keywords(text, top_n=5):
    try:
        okt = Okt()
        nouns = okt.nouns(text)
        filtered = [n for n in nouns if len(n) > 1]
        count = Counter(filtered).most_common(top_n)
        return [word for word, _ in count]
    except Exception as e:
        logger.error(f"키워드 추출 실패: {str(e)}")
        return []

# 업스테이지 요약 함수
def summarize_text(text):
    try:
        response = requests.post(
            "https://api.upstage.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {UPSTAGE_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "solar-pro",
                "messages": [
                    {"role": "system", "content": "다음 텍스트를 회의 요약 형식으로 정리해줘."},
                    {"role": "user", "content": text}
                ]
            }
        )
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"요약 실패: {str(e)}")
        return "요약 실패"

# Firestore에 데이터 저장
def save_to_firestore(data):
    try:
        doc_ref = db.collection("transcripts").add(data)
        logger.info("Firestore 저장 완료")
        return doc_ref[1].id
    except Exception as e:
        logger.error(f"Firestore 저장 실패: {str(e)}")
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
        full_text = ""
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
            full_text += segment["text"].strip() + "\n"
        
        # 4. 키워드 추출 및 요약
        keywords = extract_keywords(full_text)
        summary = summarize_text(full_text)
        
        # 5. 요약 결과를 텍스트 파일로 저장 및 Firebase Storage에 업로드
        summary_filename = f"{os.path.splitext(os.path.basename(audio_path))[0]}_summary.txt"
        with open(summary_filename, "w", encoding="utf-8") as sf:
            sf.write(summary)

        # Firebase Storage에 업로드
        bucket = storage.bucket()
        blob = bucket.blob(f"summaries/{summary_filename}")
        blob.upload_from_filename(summary_filename)
        blob.make_public()
        summary_url = blob.public_url
        
        # 6. Firestore에 저장
        save_to_firestore({
            "transcript": transcript,
            "keywords": keywords,
            "summary": summary,
            "summaryDownloadUrl": summary_url,
            "text": full_text
        })
        
        logger.info(f"처리 완료: {len(transcript)}개 발화 세그먼트")
        return transcript, keywords, summary, summary_url
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
            transcript, keywords, summary, summary_url = process_audio(audio_path)
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
            "transcript": transcript,
            "keywords": keywords,
            "summary": summary,
            "summaryDownloadUrl": summary_url
        })
        
    except Exception as e:
        logger.error(f"처리 중 오류 발생: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# 저장된 회의록 전체 조회 API
@app.route('/transcripts', methods=['GET'])
def get_all_transcripts():
    try:
        logger.info("회의록 조회 요청 수신")
        docs = db.collection("transcripts").stream()
        results = []
        for doc in docs:
            entry = doc.to_dict()
            entry["id"] = doc.id
            results.append(entry)
        logger.info(f"회의록 조회 완료: {len(results)}개 문서")
        return jsonify({"success": True, "data": results})
    except Exception as e:
        logger.error(f"Firestore 조회 실패: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True) 