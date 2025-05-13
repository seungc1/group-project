# firestore_handler.py

from google.cloud import firestore
from datetime import datetime
from cal_module.calendar_sync import create_calendar_event  # 추가

# Firestore 연결
db = firestore.Client()

def store_calendar_logs(meeting_id: str, parsed_results: list):
    for item in parsed_results:
        # Firestore에서 자동으로 ID 생성
        doc_ref = db.collection("calendar_logs").document()  # 문서 ID 자동 생성
        log_id = doc_ref.id  # 자동 생성된 ID 사용
        
        log_data = {
            "logId": doc_ref.id,
            "meetingId": meeting_id,
            "expression": item["expression"],
            "parsedDatetime": item["datetime"],
            "calendarEventUrl": None,  # 초기 값은 None
            "status": "pending",  # 초기 상태는 'pending'
            "errorMessage": "",
            "createdAt": firestore.SERVER_TIMESTAMP  # Firestore 서버 시간 자동 생성
        }
        
        # Firestore에 일정 저장
        doc_ref.set(log_data)
        # db.collection("calendar_logs").document(log_id).set(log_data)
        print(f"저장 완료: {doc_ref.id}")

        # 일정 등록 후 calendarEventUrl을 업데이트
        event_link = create_calendar_event("회의 있음", item["datetime"])
        if event_link:
            # calendarEventUrl 업데이트
            update_calendar_log(log_id, event_link)
            print(f"Google Calendar 일정 등록 성공: {event_link}")
        else:
            print("Google Calendar 일정 등록 실패")

# calendar_logs 문서 업데이트 함수
def update_calendar_log(log_id, event_url):
    log_ref = db.collection('calendar_logs').document(log_id)
    log_ref.update({
        "calendarEventUrl": event_url,
        "status": "success"  # 일정 등록 성공 시 상태 'success'로 변경
    })
    print(f"calendar_logs 문서 업데이트 성공: {log_id}")
