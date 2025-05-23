import os
import ssl
import urllib3
import requests
import re
from collections import Counter
from utils.logger import configure_logger
from openai import OpenAI
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from konlpy.tag import Okt

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env.server'))
load_dotenv(dotenv_path=env_path)

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
UPSTAGE_API_KEY = os.getenv("UPSTAGE_API_KEY")

# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))  # OpenAI API 키 설정

# TF-IDF 기반 키워드 추출 함수
def extract_keywords_tfidf(text, top_n=5):
    try:
        # 입력된 전체 텍스트를 문장 단위로 분리
        sentences = re.split(r'[.!?]\s+', text)

        okt = Okt()
        processed = []

        for sentence in sentences:
            # 각 문장에서 명사 추출
            nouns = okt.nouns(sentence)
            # 길이가 1 이하인 단어는 제외
            nouns = [word for word in nouns if len(word) > 1]
            # 명사들을 공백으로 구분된 문자열로 변환
            processed.append(" ".join(nouns))

        # TF-IDF 벡터 생성기 초기화 및 벡터화 수행
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(processed)

        # 단어 리스트 및 각 단어의 TF-IDF 점수 합산
        feature_names = vectorizer.get_feature_names_out()
        scores = tfidf_matrix.sum(axis=0).A1  # 전체 문서에서의 점수 합계

        # 단어와 점수를 묶고 점수 기준으로 정렬
        tfidf_scores = list(zip(feature_names, scores))
        tfidf_scores.sort(key=lambda x: x[1], reverse=True)

        # 상위 top_n개의 단어만 추출하여 반환
        return [word for word, _ in tfidf_scores[:top_n]]

    except Exception as e:
        logger.error(f"TF-IDF 키워드 추출 실패: {e}")
        return []

# 키워드 추출 함수 (상위 N개 명사) <-- 너무 단순해서 실제 사용에 적합하지 않음
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
def summarize_text(text, meeting_date=None, title=None, participants=None, participant_count=None):
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
                            "다음 텍스트를 아래 양식에 맞춰 회의록 형태로 요약해줘. 항목명 그대로 유지해.:\n"
                            f"[회의 제목]: {title if title else ''} (지정된 제목을 그대로 반영할 것)\n"
                            f"[참여인원]: {', '.join(participants) if participants else ''}\n"
                            f"[참여인원 수]: {participant_count if participant_count is not None else ''}명\n"
                            f"[회의일시]: {meeting_date if meeting_date else ''} (본문에 중복 기재하지 말 것)\n"
                            "[주요안건]:\n- 항목\n- 항목\n"
                            "[의결사항]:\n1. 항목\n2. 항목\n"
                            "[참고사항]:\n- 항목\n"
                            "[추후일정]:\n- 항목\n"
                            "형식을 반드시 지켜서 출력하고, 항목명은 변경하지 말고 그대로 유지할 것, 불필요한 설명 없이 이 형식 그대로 출력해!."
                        )
                    },
                    {"role": "user", "content": text}
                ]
            },
            verify=False  # SSL 검증 비활성화
        )
        print("[DEBUG] Upstage API response:", response.json())  # 디버그용 응답 전체 출력
        
        # Upstage 응답에서 요약 텍스트 추출
        summary_raw = response.json()["choices"][0]["message"]["content"]
        # 줄바꿈('\n') 기준으로 분할한 뒤 줄 사이에 빈 줄('\n\n')을 추가하여 줄 간격 확장
        summary_formatted = '\n\n'.join(summary_raw.strip().split('\n'))
        # 포맷팅된 요약 텍스트 반환
        return summary_formatted
    
    except Exception as e:
        logger.error(f"요약 실패: {e}")
        return "요약 실패"


# # OpenAI API를 활용한 요약 함수
# def summarize_text(text):
#     try:
#         response = client.chat.completions.create(
#             model="gpt-3.5-turbo",
#             messages=[
#                 {
#                     "role": "system",
#                     "content": (
#                         "다음 텍스트를 아래 양식에 맞춰 회의록 형태로 요약해줘. 반드시 아래 형식을 지켜야 해:\n"
#                         "[회의 제목]:\n"
#                         "[참여인원]:\n"
#                         "[참여인원 수]:\n"
#                         "[회의일시]:\n"
#                         "[업무 회의록]:\n- 항목\n- 항목\n"
#                         "[주요안건]:\n- 항목\n- 항목\n"
#                         "[의결사항]:\n1. 항목\n2. 항목\n"
#                         "[참고사항]:\n- 항목\n"
#                         "[추후일정]:\n- 항목\n"
#                         "형식을 반드시 지켜서 출력하고, 불필요한 설명 없이 이 형식 그대로 출력해."
#                     )
#                 },
#                 {
#                     "role": "user",
#                     "content": text
#                 }
#             ],
#             temperature=0.6,
#         )

#         return response.choices[0].message.content.strip()

#     except Exception as e:
#         logger.error(f"요약 실패: {e}")
#         return "요약 실패"
