import os
import glob
from utils.logger import configure_logger

logger = configure_logger()

# 청크 파일 정리 함수
def cleanup_chunks(directory="chunks", extension="wav"):
    try:
        files = glob.glob(f"{directory}/*.{extension}")
        for file_path in files:
            os.remove(file_path)
        logger.info(f"청크 파일 {len(files)}개 삭제 완료")
    except Exception as e:
        logger.warning(f"청크 파일 삭제 중 오류 발생: {e}")
