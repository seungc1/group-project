import os
import firebase_admin
from firebase_admin import credentials, firestore
from utils.logger import configure_logger
import google.api_core.client_options

# DNS 관련 환경 변수 설정
os.environ['GRPC_DNS_RESOLVER'] = 'native'
os.environ['GRPC_ENABLE_FORK_SUPPORT'] = '1'
os.environ['GRPC_VERBOSITY'] = 'DEBUG'
os.environ['GRPC_TRACE'] = 'all'
os.environ['GRPC_ENABLE_CHANNEL_Z'] = '0'

logger = configure_logger()

# 환경 변수에서 값 불러오기
firebase_key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
firebase_storage = os.getenv("FIREBASE_STORAGE_BUCKET")
firebase_project = os.getenv("FIREBASE_PROJECT_ID")

# Firebase 초기화 (최초 1회만 수행)
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred, {
        "storageBucket": firebase_storage,
        "projectId": firebase_project
    })

# Firestore 클라이언트 초기화
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
