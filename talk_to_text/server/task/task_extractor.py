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

# 개선된 명령형 문장 정규식 기반 필터
COMMAND_PATTERNS = [
    # 기본 명령 표현
    r".+해주세요$", r".+하세요$", r".+하십시오$", r".+해주십시오$",
    r".+해주시기 바랍니다$", r".+해주면 좋겠습니다$",

    # 요청·지시 어미
    r".+바랍니다$", r".+바람$", r".+부탁드립니다$", r".+해주세요$",

    # 정리·작성·업로드 요청
    r".+정리해주기 바랍니다$", r".+정리 부탁드립니다$", r".+정리 바랍니다$",
    r".+작성해주세요$", r".+작성 바랍니다$", r".+작성해$",
    r".+업로드 바랍니다$", r".+올려주세요$",

    # 공유·검토 요청
    r".+공유 바랍니다$", r".+공유 부탁드립니다$", r".+검토 바랍니다$", r".+확인 바랍니다$",

    # 기타 행위 지시
    r".+처리해$", r".+진행해$", r".+조치 바랍니다$",

    # 완곡한 지시
    r".+필요합니다$"
]

# 정밀도 개선된 명령형 문장 필터 함수
def is_valid_command(text: str) -> bool:
    text = text.strip()
    
    # 너무 짧은 문장은 명령문으로 보기 어려우므로 제외
    if len(text) < 6:
        return False

    invalid_starts = ["물론입니다"]
    invalid_ends = ["같습니다:", "기대됩니다."]

    # 특정 시작 문구는 명령문이 아닌 일반 응답일 가능성이 높음
    if any(text.startswith(s) for s in invalid_starts):
        return False
    # 특정 종료 문구는 명령문의 일부가 아니라 설명형일 가능성이 있음
    if any(text.endswith(s) for s in invalid_ends):
        return False
    # 명령형 문장 패턴이 포함되어 있는지 확인
    for pattern in COMMAND_PATTERNS:
        if re.search(pattern, text):
            return True
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

# Solar-pro-2 모델로 명령형 문장 추출
def extract_task_commands_with_solar(text: str) -> list[str]:
    url = "https://api.upstage.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {UPSTAGE_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "solar-pro2-preview",
        "messages": [{"role": "user", "content": make_prompt(text)}],
        "reasoning_effort": "high"
    }

    try:
        # Upstage Solar-Pro2-priview 모델에 POST 요청을 보내 명령형 문장 생성 요청
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()

        # 응답에서 요약 텍스트 추출
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        print("\n[Upstage 응답 원문]")
        print(content)

        # 각 줄을 리스트로 분리하고 앞쪽 불릿 기호(-, •, ● 등) 제거 숫자 포함
        raw_lines = [re.sub(r"^[-•●\d\)\.\s]+", "", line.strip()) for line in content.splitlines() if line.strip()]
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
