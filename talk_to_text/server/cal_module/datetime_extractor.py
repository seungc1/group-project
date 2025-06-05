# pip install kss -> 한글 문장 분리기 필요

import re
import uuid
import kss
from datetime import datetime, timedelta
from typing import Optional
from utils.logger import configure_logger

logger = configure_logger()

# 요일 문자열을 요일 인덱스로 매핑
DAYS = {
    "월요일": 0, "화요일": 1, "수요일": 2,
    "목요일": 3, "금요일": 4, "토요일": 5, "일요일": 6
}

# 시간 키워드 매핑 -> 기본 시각 매핑
TIME_KEYWORDS = {
    "아침": (9, 0), "점심": (12, 0), "정오": (12, 0),
    "낮": (12, 0), "오후": (15, 0), "저녁": (18, 0),
    "밤": (21, 0), "새벽": (5, 0)
}

# 기본 시각 설정 (시간 추출 실패 시 사용)
DEFAULT_HOUR, DEFAULT_MINUTE = 10, 0

# 규칙 기반 날짜 추출 (내일, 모레, 다음주 요일)
def rule_based_datetime(text: str, base: datetime) -> list[tuple[str, datetime]]:
    results = []
    if "내일" in text:
        results.append(("내일", base + timedelta(days=1)))
    if "모레" in text:
        results.append(("모레", base + timedelta(days=2)))
    if "다음 주" in text or "다음주" in text:
        for label, weekday in DAYS.items():
            if label in text:
                offset = (weekday - base.weekday() + 7) % 7 + 7
                results.append((f"다음주 {label}", base + timedelta(days=offset)))
    return results

# 시각 추출 함수
def extract_time(text: str) -> Optional[tuple[int, int]]:
    match = re.search(r"(오전|오후)?\s*(\d{1,2})시(\s*(\d{1,2})분)?", text)
    if match:
        meridiem, hour, _, minute = match.groups()
        hour = int(hour)
        minute = int(minute) if minute else 0

        if meridiem == "오후" and hour < 12:
            hour += 12
        if meridiem == "오전" and hour == 12:
            hour = 0

        return hour, minute
    
    # 시간 키워드로부터 시간 추출
    for keyword, (h, m) in TIME_KEYWORDS.items():
        if keyword in text:
            return h, m

    return None

# 시간 추출 실패 시 기본값 보정
def safe_extract_time(text: str) -> tuple[int, int]:
    time = extract_time(text)
    return time if time else (DEFAULT_HOUR, DEFAULT_MINUTE)

# 최종 일정 추출 함수
def extract_datetimes_from_text(text: str) -> list[dict]:
    base = datetime.now()
    seen = set()
    final = []
    # 문장 단위로 분리
    # kss.split_sentences는 한글 문장 분리기 라이브러리
    expressions = kss.split_sentences(text)

    for expr in expressions:
        expr = expr.strip()
        if not expr:
            continue

        # 날짜 추출
        dates = rule_based_datetime(expr, base)
        if not dates:
            continue

        # 각 날짜마다 시간 추출 적용
        for phrase, dt in dates:
            hour, minute = safe_extract_time(phrase)
            
            # phrase에 시간 없으면 문장(expr) 전체에서 시도
            if hour == DEFAULT_HOUR and minute == DEFAULT_MINUTE:
                hour, minute = safe_extract_time(expr)
            
            dt = dt.replace(hour=hour, minute=minute, second=0, microsecond=0)

            key = (phrase, dt.date(), dt.hour, dt.minute)
            if key in seen:
                continue
            seen.add(key)

            final.append({
                "expression": phrase,
                "datetime": dt.isoformat(),
                "logId": str(uuid.uuid4())
            })

    return final
