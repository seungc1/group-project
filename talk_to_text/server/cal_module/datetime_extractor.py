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
        # 이번주 월요일 (현재 날짜에서 이번주 주 시작일로 이동)
        this_monday = base - timedelta(days=base.weekday())
        # 다음주 월요일 (이번주 월요일에서 +1주 이동 → 다음주 주 시작일 확보)
        next_monday = this_monday + timedelta(weeks=1)

        # 다음주 화요일이면, 이번주 월요일로 갔다가, 여기서 7일 더해서 다음주로 월요일로 가서, 거기서 원하는 요일 계산
        for label, weekday in DAYS.items():
            pattern = rf"다음\s*주\s*{label}"
            if re.search(pattern, text):
                # 다음주 월요일에서 원하는 요일까지 offset 계산
                days_to_target = (weekday - 0 + 7) % 7
                target_date = next_monday + timedelta(days=days_to_target)
                
                # (표현, datetime) 결과로 저장
                results.append((f"다음주 {label}", target_date))
    
    # 숫자 기반 일정 패턴 처리 (예: "6월 10일" → 날짜 인식)
    date_pattern = re.search(r"(\d{1,2})월\s*(\d{1,2})일", text)
    if date_pattern:
        # 정규식으로 월(month), 일(day) 추출
        month, day = map(int, date_pattern.groups())
        try:
            year = base.year # 기준 년도는 현재 년도 사용
            candidate_date = datetime(year, month, day)
            
            # 만약 추출된 날짜가 오늘 기준(base)보다 이전이면 → 다음 해로 보정 처리
            if candidate_date < base:
                candidate_date = datetime(year + 1, month, day)
                
            # (표현 텍스트, datetime 객체)를 결과 리스트에 추가
            results.append((f"{month}월 {day}일", candidate_date))
        except ValueError:
            # 유효하지 않은 날짜(예: 2월 30일 등)는 무시
            pass

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
