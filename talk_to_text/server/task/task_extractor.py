import requests
import os
import ssl
import urllib3
import re
from utils.logger import configure_logger
from collections import OrderedDict

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

UPSTAGE_API_KEY = os.getenv("UPSTAGE_API_KEY")

# 명령형 문장 필터 함수
def is_valid_command(text: str) -> bool:
    text = text.strip() # 앞뒤 공백 제거
    
    # 너무 짧은 문장은 명령문으로 보기 어려우므로 제외
    if len(text) < 6:
        return False
    
    # 특정 시작 문구는 명령문이 아닌 일반 응답일 가능성이 높음 (예외 처리)
    invalid_starts = ["물론입니다"]
    # 특정 종료 문구는 명령문의 일부가 아니라 설명형일 가능성 있음
    invalid_ends = ["같습니다:"]

    # 명령형 또는 업무 지시 스타일 어미 목록
    imperative_suffixes = [
        "해주세요", "하세요", "하십시오", "해주십시오",
        "합니다", "진행합니다", "진행한다", "업로드합니다", "작성합니다", "정리합니다", "등록합니다",
        "업로드한다", "작성한다", "정리한다", "등록한다",
        "하기로 함", "결정함", "예정임", "예정이다"
    ]
    
    # 제외 조건: 특정 시작 문구
    if any(text.startswith(s) for s in invalid_starts):
        return False
    # 제외 조건: 특정 종료 문구
    if any(text.endswith(s) for s in invalid_ends):
        return False
    # 포함 조건: 명령형 어미로 끝나는 문장
    if any(text.endswith(suffix) for suffix in imperative_suffixes):
        return True
    # 그 외에는 명령문이 아니라고 간주
    return False

# 명령형 문장 추출용 프롬프트 생성
def make_prompt(text: str) -> str:
    return f"""다음 텍스트에서 '명령형 문장'만 추출해서 리스트 형태로 출력해줘. 반드시 아래 예시처럼 출력할 것:

예시 출력 형식:
- 보고서를 작성해주세요
- 코드를 수정해주세요

조건:
- 명령형 표현(예: ~해주세요, ~하십시오, ~합니다 등)을 포함한 문장만 출력할 것
- 회의 요약이나 다른 형식 없이, 오직 명령형 문장 리스트만 출력할 것

텍스트:
\"\"\"{text}\"\"\"
"""

# Solar 모델로 명령형 문장 추출
def extract_task_commands_with_solar(text: str) -> list[str]:
    url = "https://api.upstage.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {UPSTAGE_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "solar-pro",
        "messages": [{"role": "user", "content": make_prompt(text)}]
    }

    try:
        # Upstage Solar-Pro 모델에 POST 요청을 보내 명령형 문장 생성 요청
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()

        # 응답에서 요약 텍스트 추출
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        print("\n[Upstage 응답 원문]")
        print(content)

        # 각 줄을 리스트로 분리하고 앞쪽 불릿 기호(-, •, ● 등) 제거
        raw_lines = [line.strip("-•● ").strip() for line in content.splitlines() if line.strip()]
        # 유효한 명령문인지 확인 후 필터링 (예: "해주세요", "하시기 바랍니다" 등)
        filtered = [line for line in raw_lines if is_valid_command(line)]

        # 순서를 유지하면서 중복 제거
        unique_tasks = list(OrderedDict.fromkeys(filtered))

        # 결과 출력
        print("\n[최종 명령형 문장]")
        for task in unique_tasks:
            print(f"- {task}")

        return unique_tasks

    except Exception as e:
        logger.exception(f"[명령형 문장 추출 실패] {e}")
        return []
