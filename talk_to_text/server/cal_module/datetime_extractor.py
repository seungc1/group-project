import re
import uuid
import dateparser
from datetime import datetime, timedelta
from dateparser.search import search_dates
from utils.logger import configure_logger

logger = configure_logger()

# 요일 인덱스
DAYS = {
    "월요일": 0, "화요일": 1, "수요일": 2,
    "목요일": 3, "금요일": 4, "토요일": 5, "일요일": 6
}

# 시간대 키워드 → 기본 시각 매핑
TIME_KEYWORDS = {
    "아침": (8, 0),
    "점심": (12, 0),
    "정오": (12, 0),
    "낮": (12, 0),
    "오후": (15, 0),
    "저녁": (18, 0),
    "밤": (21, 0),
    "새벽": (5, 0)
}

def rule_based_datetime(text: str, base: datetime) -> list[tuple[str, datetime]]:
    results = []
    if "내일" in text:
        results.append(("내일", base + timedelta(days=1)))
    if "모레" in text:
        results.append(("모레", base + timedelta(days=2)))
    if "다음 주" in text or "다음주" in text:
        for label, weekday in DAYS.items():
            if label in text:
                offset = ((7 - base.weekday() + weekday) % 7) + 7
                results.append((f"다음주 {label}", base + timedelta(days=offset)))
    return results

def extract_time(text: str) -> tuple[int, int] | None:
    match = re.search(r"(오전|오후)?\s*(\d{1,2})(시|:)?\s*(\d{1,2})?분?", text)
    if match:
        meridiem, hour, _, minute = match.groups()
        hour = int(hour)
        minute = int(minute) if minute else 0
        if meridiem == "오후" and hour < 12:
            hour += 12
        if meridiem == "오전" and hour == 12:
            hour = 0
        return hour, minute

    for keyword, (h, m) in TIME_KEYWORDS.items():
        if keyword in text:
            return h, m

    return None

def extract_datetimes_from_text(text: str) -> list[dict]:
    base = datetime.now()
    seen = set()
    final = []

    expressions = re.split(r"[,\n]|그리고|또는", text)

    for expr in expressions:
        expr = expr.strip()
        if not expr:
            continue

        results = {}
        rule_dates = rule_based_datetime(expr, base)
        for label, dt in rule_dates:
            results[label] = dt

        parsed_dates = search_dates(
            expr,
            languages=["ko"],
            settings={
                "PREFER_DATES_FROM": "future",
                "RELATIVE_BASE": base,
                "RETURN_AS_TIMEZONE_AWARE": False
            }
        )

        if parsed_dates:
            for phrase, dt in parsed_dates:
                if dt.date() >= base.date():
                    already = any(abs((dt - existing).total_seconds()) < 60 for existing in results.values())
                    if not already:
                        results[phrase] = dt

        if not results:
            continue

        time_part = extract_time(expr)
        for phrase, dt in results.items():
            hour, minute = time_part if time_part else (10, 0)
            dt = dt.replace(hour=hour, minute=minute, second=0, microsecond=0)
            key = (dt.date(), dt.hour, dt.minute)
            if key in seen:
                continue
            seen.add(key)
            final.append({
                "expression": phrase,
                "datetime": dt.isoformat(),
                "logId": str(uuid.uuid4())
            })

    return final