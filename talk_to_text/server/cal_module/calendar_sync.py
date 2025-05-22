import os
import datetime
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from utils.logger import configure_logger

logger = configure_logger()

# 캘린더 ID (기본은 'primary', 공유 캘린더를 쓸 수도 있음)
CALENDAR_ID = os.getenv("GOOGLE_CALENDAR_ID", "primary")

# 서비스 계정 기반 캘린더 클라이언트 생성
def get_calendar_service():
    try:
        creds_path = os.getenv("GOOGLE_CALENDAR_CREDENTIALS")  # JSON 키 경로
        scopes = ["https://www.googleapis.com/auth/calendar"]
        credentials = service_account.Credentials.from_service_account_file(
            creds_path, scopes=scopes
        )
        service = build("calendar", "v3", credentials=credentials)
        return service
    except Exception as e:
        logger.exception("Google Calendar 인증 실패")
        raise

# 일정 등록 함수
def create_calendar_event(summary_text: str, start_datetime: datetime.datetime, duration_minutes: int = 60):
    try:
        service = get_calendar_service()

        event = {
            "summary": summary_text,
            "start": {
                "dateTime": start_datetime.isoformat(),
                "timeZone": "Asia/Seoul"
            },
            "end": {
                "dateTime": (start_datetime + datetime.timedelta(minutes=duration_minutes)).isoformat(),
                "timeZone": "Asia/Seoul"
            },
            "description": "회의록 자동 요약에 기반하여 생성된 일정입니다."
        }

        created_event = service.events().insert(calendarId=CALENDAR_ID, body=event).execute()
        logger.info(f"Google Calendar에 일정 등록 완료: {created_event.get('htmlLink')}")
        return created_event.get('htmlLink')

    except Exception as e:
        logger.exception("캘린더 일정 등록 중 오류 발생")
        return None
