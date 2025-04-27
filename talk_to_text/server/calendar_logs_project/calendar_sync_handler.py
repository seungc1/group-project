# calendar_sync_handler.py
'''이거는 안쓰는 코드입니당 <- 일단은 잠시 나둠'''

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/Users/jujihwan/Documents/talktotext_jihwan_v2/group-project/talk_to_text/server/firebase/firebase_key.json"

import uuid
from datetime import datetime, timedelta
from google.cloud import firestore
from googleapiclient.discovery import build
from google.oauth2 import service_account

# Firestore 연결
db = firestore.Client()

# Google Calendar API 연결
def get_calendar_service():
    SCOPES = ['https://www.googleapis.com/auth/calendar']
    SERVICE_ACCOUNT_FILE = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")

    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)

    service = build('calendar', 'v3', credentials=credentials)
    return service

# pending 상태 일정 가져오기
def fetch_pending_calendar_logs():
    calendar_logs_ref = db.collection("calendar_logs")
    pending_docs = calendar_logs_ref.where("status", "==", "pending").stream()

    pending_list = []
    for doc in pending_docs:
        log_data = doc.to_dict()
        log_data["doc_id"] = doc.id   # 문서 ID도 같이 저장 (업데이트용)
        pending_list.append(log_data)

    return pending_list

# 일정 등록
def create_calendar_event(expression, datetime_str):
    service = get_calendar_service()

    event = {
        'summary': expression,
        'start': {
            'dateTime': datetime_str,
            'timeZone': 'Asia/Seoul',
        },
        'end': {
            'dateTime': (datetime.fromisoformat(datetime_str) + timedelta(hours=1)).isoformat(),
            'timeZone': 'Asia/Seoul',
        },
        'description': '회의록 자동 등록 일정입니다.',
    }

    event_result = service.events().insert(calendarId='primary', body=event).execute()
    return event_result.get('htmlLink')  # 등록된 일정 URL 반환

# Firestore 업데이트
def update_calendar_log(doc_id, status, calendar_url=None, error_message=None):
    update_data = {
        "status": status,
        "calendarEventUrl": calendar_url or None,
        "errorMessage": error_message or "",
    }
    db.collection("calendar_logs").document(doc_id).update(update_data)

# 전체 처리 함수
def process_calendar_logs():
    pending_logs = fetch_pending_calendar_logs()
    print(f"[총 {len(pending_logs)}건 처리 시작]")

    for log in pending_logs:
        try:
            doc_id = log["doc_id"]
            expression = log["expression"]
            datetime_str = log["parsedDatetime"]

            calendar_url = create_calendar_event(expression, datetime_str)
            update_calendar_log(doc_id, "success", calendar_url)

            print(f"일정 등록 성공: {expression} -> {calendar_url}")

        except Exception as e:
            print(f"일정 등록 실패: {log.get('expression')} - {e}")
            update_calendar_log(log["doc_id"], "failed", None, str(e))

if __name__ == "__main__":
    process_calendar_logs()