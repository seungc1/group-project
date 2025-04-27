import re
import dateparser
import uuid
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

    if "다음 주" in text or "다음주" in text:
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
def extract_datetimes_from_text(text: str) -> list[dict]:
    try:
        base = datetime.now()
        seen = set()
        final = []

        rule_based = rule_based_datetime(text, base)
        for dt in rule_based:
            final.append({
                "expression": "RULE_BASED_EXPRESSION",
                "datetime": dt.isoformat(),
                "logId": str(uuid.uuid4())  # 여기서 logId 생성해서 넣는다
            })

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
            time_parts = extract_time(text)
            for phrase, dt in parsed:
                if dt.date() >= base.date():
                    if time_parts:
                        hour, minute = time_parts.pop(0)
                    else:
                        hour, minute = 10, 0
                    dt = dt.replace(hour=hour, minute=minute, second=0, microsecond=0)

                    while (dt.date(), dt.hour) in seen:
                        dt += timedelta(hours=1)
                    seen.add((dt.date(), dt.hour))

                    final.append({
                        "expression": phrase,
                        "datetime": dt.isoformat(),
                        "logId": str(uuid.uuid4())  # 🔥 여기서도 logId 넣어준다
                    })

        logger.info(f"[Datetime 추출 결과]: {final}")
        return final

    except Exception as e:
        logger.exception(f"[Datetime 추출 실패]: {e}")
        return []