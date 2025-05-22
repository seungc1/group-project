from google_auth_oauthlib.flow import InstalledAppFlow
import pickle

# 1. credentials.json 파일 경로 설정
CLIENT_SECRET_FILE = 'credentials.json'

# 2. Google Tasks API scope
SCOPES = ['https://www.googleapis.com/auth/tasks']

# 3. 인증 플로우 시작
flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, SCOPES)

# 4. 브라우저 자동 열기 → 사용자 인증
creds = flow.run_local_server(port=0)

# 5. 인증 완료 후 token.json 파일로 저장
with open('token.json', 'w') as token:
    token.write(creds.to_json())

print("새 token.json 파일이 생성되었습니다.")