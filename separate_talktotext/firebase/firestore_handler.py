import os
import firebase_admin
from firebase_admin import credentials, firestore
from utils.logger import configure_logger

logger = configure_logger()

# Firebase 인증 및 Firestore 클라이언트 초기화
# Firebase 초기화 (최초 1회만 수행)
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred, {
        "storageBucket": "your-project-id.appspot.com"
        # "talktotext-37f54.firebasestorage.app"
    })

db = firestore.client()

# 회의록 저장 함수
def save_transcript(data):
    try:
        doc_ref = db.collection("transcripts").add(data)
        logger.info("Firestore에 회의록 저장 완료")
        return doc_ref[1].id
    except Exception as e:
        logger.error(f"Firestore 저장 실패: {e}")
        raise

# 회의록 전체 조회 함수
def get_all_transcripts():
    try:
        docs = db.collection("transcripts").stream()
        return [dict(doc.to_dict(), id=doc.id) for doc in docs]
    except Exception as e:
        logger.error(f"Firestore 조회 실패: {e}")
        raise
