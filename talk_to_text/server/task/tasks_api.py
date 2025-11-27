# talk_to_text/server/task/tasks_api.py

import requests

GOOGLE_TASKS_API_URL = "https://tasks.googleapis.com/tasks/v1/lists/@default/tasks"

def register_tasks_with_token(commands: list[str], access_token: str):
    """
    명령형 문장 리스트(commands)를 로그인한 사용자의 Google Tasks에 등록
    """
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    for command in commands:
        task_data = {
            "title": command,
            "notes": "나만의 회의록 TalkToText.",
            # "due": "2025-06-02T23:59:00.000Z"  # <- 필요 시 ISO 포맷 마감일 설정
        }
        try:
            response = requests.post(GOOGLE_TASKS_API_URL, headers=headers, json=task_data)
            response.raise_for_status()
            print(f"등록 성공: {command}")
        except Exception as e:
            print(f"등록 실패: {command} / {e}")