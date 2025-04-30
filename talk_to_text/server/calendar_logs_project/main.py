# main.py
import sys
import os

from firebase_admin import firestore
from cal_module.datetime_extractor import extract_datetimes_from_text
from calendar_logs_project.firestore_handler import store_calendar_logs

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Firebase 인증 키 설정
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/Users/jujihwan/Documents/talktotext_jihwan_v2/group-project/talk_to_text/server/firebase/firebase_key.json"

# Firestore 연결
db = firestore.client()

def extract_and_store_schedule_logs(summary_text: str, meeting_id: str) -> list[dict]:
    from cal_module.datetime_extractor import extract_datetimes_from_text

    parsed_results = extract_datetimes_from_text(summary_text)
    stored_results = []  # 저장된 logId를 담을 리스트

    if parsed_results:
        for parsed in parsed_results:
            # Firestore에 저장
            doc_ref = db.collection('calendar_logs').document()  # 문서 ID 자동 생성
            doc_ref.set({
                "logId": doc_ref.id,  # 자동 생성된 logId 저장
                "meetingId": meeting_id,
                "expression": parsed["expression"],
                "parsedDatetime": parsed["datetime"],
                "status": "pending",
                "calendarEventUrl": None,  # 초기값 None
                "errorMessage": "",  # 초기값 빈 문자열
                "createdAt": firestore.SERVER_TIMESTAMP  # 서버 시간으로 자동 생성
            })

            stored_results.append({
                "logId": doc_ref.id,  # 생성된 문서 ID
                "expression": parsed["expression"],
                "datetime": parsed["datetime"]
            })

            print(f"저장 완료: {doc_ref.id}")

        print(f"총 {len(parsed_results)}개의 일정 저장 완료.")

    else:
        print("추출된 일정이 없습니다.")

    return stored_results  # 저장된 logId 포함된 리스트 반환
