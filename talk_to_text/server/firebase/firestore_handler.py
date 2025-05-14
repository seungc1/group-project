import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
from utils.logger import configure_logger

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env.server'))
load_dotenv(dotenv_path=env_path)

# 디버깅 확인
print("[DEBUG] FIREBASE 키 경로:", os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))

firebase_key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
firebase_storage = os.getenv("FIREBASE_STORAGE_BUCKET")
firebase_project = os.getenv("FIREBASE_PROJECT_ID")

# 로거 설정
logger = configure_logger()

# 디버깅용 출력
logger.info(f"Firebase 키 파일 경로: {firebase_key_path}")
logger.info(f"현재 작업 디렉토리: {os.getcwd()}")

# 필수 환경변수 검증
if not firebase_key_path or not os.path.exists(firebase_key_path):
    raise FileNotFoundError(f"Firebase 키 파일을 찾을 수 없습니다. 경로: {firebase_key_path}")

# Firebase 앱 초기화 (중복 방지)
if not firebase_admin._apps:
    try:
        logger.info("Firebase 초기화 시작...")
        cred = credentials.Certificate(firebase_key_path)
        firebase_admin.initialize_app(cred, {
            "storageBucket": firebase_storage,
            "projectId": firebase_project
        })
        logger.info("Firebase 초기화 완료!")
    except Exception as e:
        logger.error(f"Firebase 초기화 실패: {str(e)}")
        raise

# Firestore 클라이언트
try:
    db = firestore.client()
    logger.info("Firestore 클라이언트 연결 성공!")
except Exception as e:
    logger.error(f"Firestore 클라이언트 연결 실패: {str(e)}")
    raise

# Firestore에 회의록 저장 (프론트엔드와 동일한 구조)
def save_meeting_data(userId, projectId, meetingId, data):
    try:
        # users/{userId}/projects/{projectId}/meetings/{meetingId} 구조로 저장
        doc_ref = db.collection("users").document(userId) \
                                     .collection("projects").document(projectId) \
                                     .collection("meetings").document(meetingId)
        
        doc_ref.set(data)
        logger.info(f"Firestore에 회의록 저장 완료: users/{userId}/projects/{projectId}/meetings/{meetingId}")
        return meetingId
    except Exception as e:
        logger.error(f"Firestore 저장 실패: {e}")
        raise

# 회의록의 textinfo 저장
def save_textinfo(userId, projectId, meetingId, textinfo_data):
    try:
        # users/{userId}/projects/{projectId}/meetings/{meetingId}/textinfo 구조로 저장
        batch = db.batch()
        for item in textinfo_data:
            doc_ref = db.collection("users").document(userId) \
                                         .collection("projects").document(projectId) \
                                         .collection("meetings").document(meetingId) \
                                         .collection("textinfo").document()
            batch.set(doc_ref, item)
        
        batch.commit()
        logger.info(f"Textinfo 저장 완료: users/{userId}/projects/{projectId}/meetings/{meetingId}/textinfo")
    except Exception as e:
        logger.error(f"Textinfo 저장 실패: {e}")
        raise

# 회의록의 tags 저장
def save_tags(userId, projectId, meetingId, tags_data):
    try:
        # users/{userId}/projects/{projectId}/meetings/{meetingId}/tags 구조로 저장
        batch = db.batch()
        for item in tags_data:
            doc_ref = db.collection("users").document(userId) \
                                         .collection("projects").document(projectId) \
                                         .collection("meetings").document(meetingId) \
                                         .collection("tags").document()
            batch.set(doc_ref, item)
        
        batch.commit()
        logger.info(f"Tags 저장 완료: users/{userId}/projects/{projectId}/meetings/{meetingId}/tags")
    except Exception as e:
        logger.error(f"Tags 저장 실패: {e}")
        raise

# 회의록의 calendar_logs 저장
def save_calendar_logs(userId, projectId, meetingId, calendar_logs_data):
    try:
        # users/{userId}/projects/{projectId}/meetings/{meetingId}/calendar_logs 구조로 저장
        batch = db.batch()
        for item in calendar_logs_data:
            doc_ref = db.collection("users").document(userId) \
                                         .collection("projects").document(projectId) \
                                         .collection("meetings").document(meetingId) \
                                         .collection("calendar_logs").document()
            batch.set(doc_ref, item)
        
        batch.commit()
        logger.info(f"Calendar logs 저장 완료: users/{userId}/projects/{projectId}/meetings/{meetingId}/calendar_logs")
    except Exception as e:
        logger.error(f"Calendar logs 저장 실패: {e}")
        raise

# 회의록 데이터 조회
def get_meeting_data(userId, projectId, meetingId):
    try:
        doc_ref = db.collection("users").document(userId) \
                                     .collection("projects").document(projectId) \
                                     .collection("meetings").document(meetingId)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict()
        return None
    except Exception as e:
        logger.error(f"회의록 조회 실패: {e}")
        raise

# 회의록 전체 조회
def get_all_transcripts():
    try:
        # 모든 사용자의 모든 프로젝트의 모든 회의록을 조회
        users_ref = db.collection("users")
        users = users_ref.stream()
        
        all_transcripts = []
        for user in users:
            userId = user.id
            projects_ref = users_ref.document(userId).collection("projects")
            projects = projects_ref.stream()
            
            for project in projects:
                projectId = project.id
                meetings_ref = projects_ref.document(projectId).collection("meetings")
                meetings = meetings_ref.stream()
                
                for meeting in meetings:
                    meeting_data = meeting.to_dict()
                    meeting_data['id'] = meeting.id
                    meeting_data['userId'] = userId
                    meeting_data['projectId'] = projectId
                    all_transcripts.append(meeting_data)
        
        logger.info(f"전체 회의록 조회 완료: {len(all_transcripts)}개")
        return all_transcripts
    except Exception as e:
        logger.error(f"회의록 전체 조회 실패: {e}")
        raise
