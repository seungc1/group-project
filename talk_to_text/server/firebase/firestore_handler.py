import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
from utils.logger import configure_logger

dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env.server"))
load_dotenv(dotenv_path)

# 디버깅용 경로 확인
firebase_key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# DNS 및 gRPC 관련 설정 (필요시)
os.environ['GRPC_DNS_RESOLVER'] = 'native'
os.environ['GRPC_ENABLE_FORK_SUPPORT'] = '1'
os.environ['GRPC_VERBOSITY'] = 'DEBUG'
os.environ['GRPC_TRACE'] = 'all'
os.environ['GRPC_ENABLE_CHANNEL_Z'] = '0'

# 로거 설정
logger = configure_logger()

# Firebase Storage 및 Project ID 환경변수
# 환경 변수에서 값 불러오기
firebase_key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
firebase_storage = os.getenv("FIREBASE_STORAGE_BUCKET")
firebase_project = os.getenv("FIREBASE_PROJECT_ID")
# firebase_key_path ="/Users/jujihwan/Documents/talktotext_jihwan/group-project/talk_to_text/server/firebase/firebase_key.json"

# Firebase 앱 초기화 (이미 초기화된 경우 중복 방지)
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_key_path)
    firebase_admin.initialize_app(cred, {
        "storageBucket": firebase_storage,
        "projectId": firebase_project
    })

# Firestore 클라이언트
db = firestore.client()

# Firestore에 회의록 저장
def save_transcript(data):
    try:
        doc_ref = db.collection("transcripts").add(data)
        logger.info("Firestore에 회의록 저장 완료")
        return doc_ref[1].id
    except Exception as e:
        logger.error(f"Firestore 저장 실패: {e}")
        raise

# Firestore에서 회의록 전체 조회
def get_all_transcripts():
    try:
        docs = db.collection("transcripts").stream()
        return [dict(doc.to_dict(), id=doc.id) for doc in docs]
    except Exception as e:
        logger.error(f"Firestore 조회 실패: {e}")
        raise
