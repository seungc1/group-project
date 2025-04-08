import os
import ssl
import urllib3
import requests
import re
from collections import Counter
from utils.logger import configure_logger

# SSL 검증 완전 비활성화
ssl._create_default_https_context = ssl._create_unverified_context
urllib3.disable_warnings()
requests.packages.urllib3.disable_warnings()

# 환경 변수 설정
os.environ['HF_HUB_DISABLE_SSL_VERIFY'] = '1'
os.environ['CURL_CA_BUNDLE'] = ''
os.environ['REQUESTS_CA_BUNDLE'] = ''
os.environ['SSL_CERT_FILE'] = ''

logger = configure_logger()

# Upstage API 키는 환경 변수에서 불러옴
# UPSTAGE_API_KEY = os.getenv("UPSTAGE_API_KEY")
UPSTAGE_API_KEY = "up_sH6XQ36Gg4Sgu1iso3fin3jWYtBFL"

# 키워드 추출 함수 (상위 N개 명사)
def extract_keywords(text, top_n=5):
    try:
        # 간단한 정규식으로 단어 추출 (한글, 영문, 숫자)
        words = re.findall(r'[\w가-힣]+', text)
        # 길이가 1인 단어는 제외
        filtered = [w for w in words if len(w) > 1]
        # Counter를 사용하여 빈도수 계산
        # most_common을 사용하여 상위 N개 단어 추출 
        count = Counter(filtered).most_common(top_n)
        return [word for word, _ in count]
    
    except Exception as e:
        logger.error(f"키워드 추출 실패: {e}")
        return []

# Upstage API를 활용한 요약 함수
def summarize_text(text):
    try:
        response = requests.post(
            "https://api.upstage.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {UPSTAGE_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "solar-pro",
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "다음 텍스트를 회의록 형식으로 요약해줘. 아래 형식을 반드시 지켜줘:\n"
                            "[회의 제목]:\n[일시]:\n[참석자]:\n\n[요약]:\n- 항목\n- 항목\n\n[결정 사항]:\n1. 항목\n2. 항목\n"
                            "불필요한 설명 없이 이 형식 그대로 출력해."
                        )
                    },
                    {"role": "user", "content": text}
                ]
            },
            verify=False  # SSL 검증 비활성화
        )
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"요약 실패: {e}")
        return "요약 실패"
