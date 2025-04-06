import os
import requests
from konlpy.tag import Okt
from collections import Counter
from utils.logger import configure_logger

logger = configure_logger()

# Upstage API 키는 환경 변수에서 불러옴
UPSTAGE_API_KEY = os.getenv("UPSTAGE_API_KEY")
# UPSTAGE_API_KEY = "up_sH6XQ36Gg4Sgu1iso3fin3jWYtBFL"

# 키워드 추출 함수 (상위 N개 명사)
def extract_keywords(text, top_n=5):
    try:
        okt = Okt()
        nouns = okt.nouns(text)
        # 명사 중 길이가 1인 단어는 제외 (길이가 1인 단어는 의미가 없으므로 제거)
        filtered = [n for n in nouns if len(n) > 1]
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
            }
        )
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"요약 실패: {e}")
        return "요약 실패"
