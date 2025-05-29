import requests
from datetime import datetime, timedelta

import requests

def create_calendar_event_with_token(access_token, summary, start_datetime, duration_minutes=60):
    event = {
        "summary": summary,
        "start": {
            "dateTime": start_datetime.isoformat(),
            "timeZone": "Asia/Seoul"
        },
        "end": {
            "dateTime": (start_datetime + timedelta(minutes=duration_minutes)).isoformat(),
            "timeZone": "Asia/Seoul"
        }
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        headers=headers,
        json=event
    )

    if response.status_code in (200, 201):
        return response.json().get("htmlLink")
    else:
        raise Exception(f"Google Calendar 등록 실패: {response.status_code} - {response.text}")