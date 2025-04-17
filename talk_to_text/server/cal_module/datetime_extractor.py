# cal_module/datetime_extractor.py

import re
import dateparser
from datetime import datetime, timedelta
from utils.logger import configure_logger
from dateparser.search import search_dates


logger = configure_logger()

# 규칙 기반 날짜 해석 (예: 내일, 다음 주 화요일 등)
def rule_based_datetime(text: str) -> list[datetime]:
    now = datetime.now()
    results = []

    if "내일" in text:
        results.append(now + timedelta(days=1))
    if "모레" in text:
        results.append(now + timedelta(days=2))
    if "글피" in text:
        results.append(now + timedelta(days=3))

    days = {
        "월요일": 0, "화요일": 1, "수요일": 2,
        "목요일": 3, "금요일": 4, "토요일": 5, "일요일": 6
    }

    if "다음 주" in text:
        for label, weekday in days.items():
            if label in text:
                offset = ((7 - now.weekday() + weekday) % 7) + 7
                results.append(now + timedelta(days=offset))

    return results

# 최종 날짜 추출 함수 (규칙 기반 + dateparser 혼합)
def extract_datetimes_from_text(text: str) -> list[datetime]:
    try:
        datetimes = []

        # 규칙 기반 우선
        rule_based = rule_based_datetime(text)
        datetimes.extend(rule_based)

        # 정규식 기반 추정 (구체적인 표현도 처리)
        dateparser_result = search_dates(
            text,
            languages=["ko"],
            settings={
                "PREFER_DATES_FROM": "future",
                "RELATIVE_BASE": datetime.now(),
                "RETURN_AS_TIMEZONE_AWARE": False
            }
        )

        if dateparser_result:
            for _, dt in dateparser_result:
                if dt not in datetimes:
                    datetimes.append(dt)

        if datetimes:
            logger.info(f"[Datetime 추출 성공]: {datetimes}")
        else:
            logger.warning(f"[Datetime 추출 실패] 텍스트: '{text}'")

        return datetimes

    except Exception as e:
        logger.exception(f"[Datetime 추출 예외] 텍스트: '{text}' / 에러: {e}")
        return []