import re
import dateparser
from datetime import datetime, timedelta
from utils.logger import configure_logger
from dateparser.search import search_dates

logger = configure_logger()

# 자연어 표현으로 날짜 계산 (예: 내일, 모레, 다음주 요일 등)
def rule_based_datetime(text: str, base: datetime) -> list[datetime]:
    results = []

    if "내일" in text:
        results.append(base + timedelta(days=1))
    if "모레" in text:
        results.append(base + timedelta(days=2))
    if "글피" in text:
        results.append(base + timedelta(days=3))

    # 요일 기반 다음 주 날짜 계산
    days = {
        "월요일": 0, "화요일": 1, "수요일": 2,
        "목요일": 3, "금요일": 4, "토요일": 5, "일요일": 6
    }

    if "다음 주" in text:
        for label, weekday in days.items():
            if label in text:
                offset = ((7 - base.weekday() + weekday) % 7) + 7
                results.append(base + timedelta(days=offset))

    return results

# 시간 정보 추출 (예: 오후 3시 → (15, 0))
def extract_time(text: str) -> list[tuple[int, int]]:
    time_patterns = re.findall(r"(오전|오후)?\s*(\d{1,2})(?:시|:)?(?:\s*(\d{1,2})분)?", text)
    times = []

    for meridiem, hour, minute in time_patterns:
        hour = int(hour)
        minute = int(minute) if minute else 0
        if meridiem == "오후" and hour < 12:
            hour += 12
        if meridiem == "오전" and hour == 12:
            hour = 0
        times.append((hour, minute))
    return times

# 자연어 기반 날짜 및 시간 인식 후 datetime 리스트로 반환
def extract_datetimes_from_text(text: str) -> list[datetime]:
    try:
        base = datetime.now()
        datetimes = []
        seen = set()
        final = []

        # 규칙 기반 날짜 추출
        rule_based = rule_based_datetime(text, base)
        datetimes.extend(rule_based)

        # dateparser를 사용한 추가 날짜 인식
        parsed = search_dates(
            text,
            languages=["ko"],
            settings={
                "PREFER_DATES_FROM": "future",
                "RELATIVE_BASE": base,
                "RETURN_AS_TIMEZONE_AWARE": False
            }
        )
        if parsed:
            for _, dt in parsed:
                if dt.date() >= base.date():
                    datetimes.append(dt)

        # 시간 표현 추출
        time_parts = extract_time(text)

        # 날짜와 시간 결합
        for date in sorted(datetimes):
            if time_parts:
                hour, minute = time_parts.pop(0)
            else:
                hour, minute = 10, 0  # 기본 시간 설정
            dt = date.replace(hour=hour, minute=minute, second=0, microsecond=0)

            # 동일한 시간 중복 방지를 위한 자동 보정
            while (dt.date(), dt.hour) in seen:
                dt += timedelta(hours=1)
            seen.add((dt.date(), dt.hour))
            final.append(dt)

        logger.info(f"[Datetime 추출 결과]: {final}")
        return final

    except Exception as e:
        logger.exception(f"[Datetime 추출 실패]: {e}")
        return []
