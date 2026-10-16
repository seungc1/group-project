import logging
import sys

# 로깅 설정 함수 (공통 로거 인스턴스 반환)
def configure_logger():
    logger = logging.getLogger("TalkToText")
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger
