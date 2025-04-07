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
from firebase_admin import credentials, firestore, storage
from konlpy.tag import Okt  # 한국어 키워드 추출용 추가

'''
- Flask 기반의 백엔드 API 서버
- 음성 파일을 받아서 Whisper로 텍스트로 변환
- Pyannote로 화자 분리
- 키워드 추출과 회의록 요약까지 수행
- 결과를 Firestore에 저장
- 회의록 요약은 .txt파일로 만들어 Firebase Storage에 저장한 뒤 URL로 반환해주는 구조
- (+) 회의록 요약한거 한글 깨짐 수정완료 + 1분 단위로 청킹한 wav 파일들 삭제하는 코드 추가.
'''

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
# HUGGINGFACE_TOKEN =os.getenv("HUGGINGFACE_TOKEN")
HUGGINGFACE_TOKEN = "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"

# Upstage API Key 설정 (회의록 요약)
# UPSTAGE_API_KEY =os.getenv("UPSTAGE_API_KEY")
UPSTAGE_API_KEY = "up_sH6XQ36Gg4Sgu1iso3fin3jWYtBFL"

# Firebase 인증 및 Firestore 클라이언트 초기화
cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred, {
    "storageBucket": "talktotext-37f54.firebasestorage.app"
    # "your-project-id.appspot.com"
})
db = firestore.client()

# Whisper 모델 로드
logger.info("Whisper 모델 로딩 중...")
model = whisper.load_model("base") # medium, large 사용하자
logger.info("Whisper 모델 로드 완료")

# 화자 분리 모델 로드
logger.info("화자 분리 모델 로딩 중...")
pipeline = SpeakerDiarization.from_pretrained("pyannote/speaker-diarization", use_auth_token=HUGGINGFACE_TOKEN)
logger.info("화자 분리 모델 로드 완료")

# 청크 파일 정리 함수
def cleanup_chunks():
    import glob
    try:
        chunk_files = glob.glob("chunks/*.wav")
        for file_path in chunk_files:
            os.remove(file_path)
        logger.info(f"청크 파일 {len(chunk_files)}개 삭제 완료")
    except Exception as e:
        logger.warning(f"청크 파일 삭제 중 오류 발생: {e}")

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
                    {"role": "system", "content": 
                        "기업에서 사용하는 회의록 작성 진행 중. 다음 텍스트롤 회의록 양식으로 작성해줘."},
                    {"role": "user", "content": text}
                ]
            }
        )
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"요약 실패: {e}")
        return "요약 실패"

# Firestore에 데이터 저장
def save_to_firestore(data, doc_id=None):
    try:
        if doc_id:
            doc_ref = db.collection("meetings").document(doc_id)
            doc_ref.update(data)
        else:
            doc_ref = db.collection("transcripts").add(data)
        logger.info("Firestore 저장 완료")
        return doc_ref.id if doc_id else doc_ref[1].id
    except Exception as e:
        logger.error(f"Firestore 저장 실패: {e}")
        raise  # 에러를 상위로 전파

# 오디오 처리 전체 파이프라인 함수
def process_audio(audio_path, doc_id):
    summary_filename = None
    try:
        # 1. 초기화
        segments_all = []
        full_text = ""
        
        # 2. 오디오 파일을 청크로 분할
        chunk_paths = chunk_audio(audio_path)
        logger.info(f"총 {len(chunk_paths)}개의 청크 생성됨")

        # 3. 각 청크별 음성 인식 처리
        for chunk_path in chunk_paths:
            logger.info(f"Whisper 처리 중: {chunk_path}")
            # Whisper 모델로 음성을 텍스트로 변환
            result = model.transcribe(chunk_path)
            # 세그먼트와 텍스트 저장
            segments_all.extend(result["segments"])
            full_text += result["text"].strip() + "\n"

        # 4. 화자 분리 처리
        diarization = pipeline(audio_path)

        # 5. 음성 인식 결과와 화자 분리 결과 통합
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
                "speaker": speaker_label,        # 화자
                "text": segment["text"].strip(), # 발화 내용
                "start": float(segment["start"]), # 시작 시간
                "end": float(segment["end"])      # 종료 시간
            })

        keywords = extract_keywords(full_text)
        summary = summarize_text(full_text)
        
        # 요약 결과를 텍스트 파일로 저장 및 Firebase Storage에 업로드
        summary_filename = f"{doc_id}.txt"
        with open(summary_filename, "w", encoding="utf-8-sig") as sf:
            sf.write(summary)

        # Firebase Storage에 업로드
        bucket = storage.bucket()
        blob = bucket.blob(f"summaries/{doc_id}.txt")
        blob.upload_from_filename(summary_filename)
        blob.make_public()
        summary_url = blob.public_url

        # Firestore에 저장
        data = {
            "transcript": transcript,
            "keywords": keywords,
            "summary": summary,
            "summaryDownloadUrl": summary_url,
            "text": full_text
        }
        save_to_firestore(data, doc_id)  # doc_id 전달

        return transcript, keywords, summary, summary_url

    except Exception as e:
        logger.error(f"오디오 처리 실패: {e}", exc_info=True)
        raise

    finally:
        # 청크 파일 삭제
        cleanup_chunks()
        # 임시 요약 파일 삭제
        if summary_filename and os.path.exists(summary_filename):
            try:
                os.remove(summary_filename)
                logger.info(f"임시 파일 삭제 완료: {summary_filename}")
            except Exception as e:
                logger.warning(f"임시 파일 삭제 실패: {e}")

# 오디오 처리 API 엔드포인트
@app.route('/process-audio', methods=['POST'])
def process_audio_endpoint():
    try:
        data = request.get_json()
        logger.info(f"Received request data: {data}")  # 요청 데이터 로깅
        
        audio_url = data.get('audioUrl')
        doc_id = data.get('docId')
        
        if not audio_url:
            logger.error("Audio URL is missing")
            return jsonify({"success": False, "error": "오디오 URL이 제공되지 않았습니다."}), 400
        if not doc_id:
            logger.error("Document ID is missing")
            return jsonify({"success": False, "error": "문서 ID가 제공되지 않았습니다."}), 400

        logger.info(f"Downloading audio from URL: {audio_url}")
        audio_path = download_audio(audio_url)
        if not audio_path:
            logger.error("Failed to download audio")
            return jsonify({"success": False, "error": "오디오 다운로드 실패"}), 400

        logger.info(f"Processing audio with doc_id: {doc_id}")
        transcript, keywords, summary, summary_url = process_audio(audio_path, doc_id)

        os.unlink(audio_path)
        logger.info("Audio processing completed successfully")

        response_data = {
            "success": True,
            "transcript": transcript,
            "keywords": keywords,
            "summary": summary,
            "summaryDownloadUrl": summary_url
        }
        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Processing error: {str(e)}", exc_info=True)  # 상세한 에러 로깅
        return jsonify({
            "success": False,
            "error": str(e),
            "details": "서버에서 오류가 발생했습니다. 관리자에게 문의하세요."
        }), 500

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

        
