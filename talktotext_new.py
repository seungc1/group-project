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
import sys
from flask_cors import CORS
from collections import Counter
import re
import firebase_admin
from firebase_admin import credentials, firestore
from konlpy.tag import Okt  # 한국어 키워드 추출용 추가

# SSL 인증서 검증 비활성화
ssl._create_default_https_context = ssl._create_unverified_context
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Flask 앱 초기화
app = Flask(__name__)
CORS(app)

# Hugging Face Token (화자 분리용)
HUGGINGFACE_TOKEN =os.getenv("HUGGINGFACE_TOKEN")

# Upstage API Key 설정
UPSTAGE_API_KEY =os.getenv("UPSTAGE_API_KEY")

# Firebase 인증 및 Firestore 클라이언트 초기화
cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Whisper 모델 로드
logger.info("Whisper 모델 로딩 중...")
model = whisper.load_model("base")
logger.info("Whisper 모델 로드 완료")

# 화자 분리 모델 로드
logger.info("화자 분리 모델 로딩 중...")
pipeline = SpeakerDiarization.from_pretrained("pyannote/speaker-diarization", use_auth_token=HUGGINGFACE_TOKEN)
logger.info("화자 분리 모델 로드 완료")

# 오디오 URL에서 다운로드
def download_audio(url):
    try:
        response = requests.get(url, timeout=30, verify=False)
        response.raise_for_status()
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_file.write(response.content)
            return temp_file.name
    except Exception as e:
        logger.error(f"오디오 다운로드 실패: {e}")
        return None

# 오디오 파일을 일정 길이(1분)로 분할
def chunk_audio(audio_path, chunk_length_ms=60000):
    audio = AudioSegment.from_file(audio_path)
    os.makedirs("chunks", exist_ok=True)
    chunk_paths = []
    for i in range(0, len(audio), chunk_length_ms):
        chunk = audio[i:i + chunk_length_ms]
        chunk_path = f"chunks/chunk_{i//chunk_length_ms + 1}.wav"
        chunk.export(chunk_path, format="wav")
        chunk_paths.append(chunk_path)
    return chunk_paths

# 한국어 키워드 추출 함수
def extract_keywords(text, top_n=5):
    okt = Okt()
    nouns = okt.nouns(text)
    filtered = [n for n in nouns if len(n) > 1]
    count = Counter(filtered).most_common(top_n)
    return [word for word, _ in count]

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
        logger.error(f"요약 실패: {e}")
        return "요약 실패"

# Firestore에 데이터 저장
def save_to_firestore(data):
    try:
        doc_ref = db.collection("transcripts").add(data)
        logger.info("Firestore 저장 완료")
        return doc_ref[1].id
    except Exception as e:
        logger.error(f"Firestore 저장 실패: {e}")
        return None

# 오디오 처리 전체 파이프라인 함수
def process_audio(audio_path):
    try:
        segments_all = []
        full_text = ""
        chunk_paths = chunk_audio(audio_path)
        logger.info(f"총 {len(chunk_paths)}개의 청크 생성됨")

        for chunk_path in chunk_paths:
            logger.info(f"Whisper 처리 중: {chunk_path}")
            result = model.transcribe(chunk_path)
            segments_all.extend(result["segments"])
            full_text += result["text"].strip() + "\n"

        diarization = pipeline(audio_path)

        transcript = []
        for segment in segments_all:
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

        keywords = extract_keywords(full_text)
        summary = summarize_text(full_text)

        save_to_firestore({
            "transcript": transcript,
            "keywords": keywords,
            "summary": summary,
            "text": full_text
        })

        return transcript, keywords, summary
    except Exception as e:
        logger.error(f"오디오 처리 실패: {e}")
        raise

# 오디오 처리 API 엔드포인트
@app.route('/process-audio', methods=['POST'])
def process_audio_endpoint():
    try:
        data = request.get_json()
        audio_url = data.get('audioUrl')
        if not audio_url:
            return jsonify({"success": False, "error": "오디오 URL이 제공되지 않았습니다."}), 400

        audio_path = download_audio(audio_url)
        if not audio_path:
            return jsonify({"success": False, "error": "오디오 다운로드 실패"}), 400

        transcript, keywords, summary = process_audio(audio_path)

        os.unlink(audio_path)

        return jsonify({
            "success": True,
            "transcript": transcript,
            "keywords": keywords,
            "summary": summary
        })
    except Exception as e:
        logger.error(f"처리 오류: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# 저장된 회의록 전체 조회 API
@app.route('/transcripts', methods=['GET'])
def get_all_transcripts():
    try:
        docs = db.collection("transcripts").stream()
        results = []
        for doc in docs:
            entry = doc.to_dict()
            entry["id"] = doc.id
            results.append(entry)
        return jsonify({"success": True, "data": results})
    except Exception as e:
        logger.error(f"Firestore 조회 실패: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
