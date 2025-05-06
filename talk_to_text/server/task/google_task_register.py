from __future__ import print_function
import datetime
import os.path
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from utils.logger import configure_logger

logger = configure_logger()

# Google Tasks API 접근 권한
SCOPES = ['https://www.googleapis.com/auth/tasks']

# 인증 및 서비스 객체 반환
def get_tasks_service():
    creds = None
    base_dir = os.path.dirname(__file__)
    token_path = os.path.join(base_dir, 'token.json')
    credentials_path = os.path.join(base_dir, 'credentials.json')

    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    else:
        flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
        creds = flow.run_local_server(port=0)
        with open(token_path, 'w') as token:
            token.write(creds.to_json())

    service = build('tasks', 'v1', credentials=creds)
    return service

# 태스크 등록 함수
def register_tasks(task_list: list[str]):
    try:
        logger.info(f"[등록할 Task 수] {len(task_list)}개")

        service = get_tasks_service()

        # Task 목록 ID 확인
        tasklists = service.tasklists().list(maxResults=1).execute()
        logger.info(f"[사용 중 Task 목록] {tasklists}")
        tasklist_id = tasklists['items'][0]['id']

        for task_content in task_list:
            logger.info(f"[등록 시도 중] {task_content}")
            task = {
                'title': task_content,
                'due': (datetime.datetime.utcnow() + datetime.timedelta(days=1)).isoformat() + 'Z'
            }
            result = service.tasks().insert(tasklist=tasklist_id, body=task).execute()
            logger.info(f"[등록 성공] {result['title']}")

    except Exception as e:
        logger.exception(f"[Google Task 등록 실패] {e}")

