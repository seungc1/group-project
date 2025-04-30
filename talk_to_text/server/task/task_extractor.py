import requests
import os
import ssl
import urllib3
from utils.logger import configure_logger

# SSL 인증 비활성화
ssl._create_default_https_context = ssl._create_unverified_context
urllib3.disable_warnings()
requests.packages.urllib3.disable_warnings()

# 환경 변수 설정
os.environ['HF_HUB_DISABLE_SSL_VERIFY'] = '1'
os.environ['CURL_CA_BUNDLE'] = ''
os.environ['REQUESTS_CA_BUNDLE'] = ''
os.environ['SSL_CERT_FILE'] = ''

logger = configure_logger()

# API 키 가져오기
UPSTAGE_API_KEY = os.getenv("UPSTAGE_API_KEY")

# 명령형 문장인지 판단하는 함수
def is_valid_command(text: str) -> bool:
    text = text.strip()
    result = (
        len(text) > 5 and
        not text.startswith("물론입니다") and
        not text.endswith("같습니다:") and
        any(text.endswith(suffix) for suffix in [
            "해주세요", "하세요", "하십시오", "해주십시오",
            "합니다", "진행합니다", "진행한다", "업로드합니다", "작성합니다", "정리합니다", "등록합니다",
            "업로드한다", "작성한다", "정리한다", "등록한다",
            "하기로 함", "결정함", "예정임", "예정이다"
        ])
    )
    if not result:
        print(f"[❌ 필터 제거됨] {text}")
    return result

# 명령형 문장 추출 함수
def extract_task_commands_with_solar(text: str) -> list[str]:
    url = "https://api.upstage.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {UPSTAGE_API_KEY}",
        "Content-Type": "application/json"
    }

    prompt = f"""다음 텍스트에서 '명령형 문장'만 추출해서 리스트 형태로 출력해줘. 반드시 아래 예시처럼 출력할 것:

예시 출력 형식:
- 보고서를 작성해주세요
- 코드를 수정해주세요

조건:
- 명령형 표현(예: ~해주세요, ~하십시오, ~합니다, ~진행한다 등)을 포함한 문장만 출력할 것
- 회의 요약이나 다른 형식 없이, 오직 명령형 문장 리스트만 출력할 것

텍스트:
\"\"\"{text}\"\"\"
"""

    data = {
        "model": "solar-pro",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]

        print("\n[🌞 Upstage 응답 원문]")
        print(content)

        raw_tasks = [line.strip("-•● ").strip() for line in content.split('\n') if line.strip()]
        filtered_tasks = [task for task in raw_tasks if is_valid_command(task)]
        unique_tasks = sorted(set(filtered_tasks))

        print("\n[✅ 필터링 후 최종 명령형 문장]")
        for task in unique_tasks:
            print(f"- {task}")

        return unique_tasks

    except Exception as e:
        logger.exception(f"[명령형 문장 추출 실패] {e}")
        return []