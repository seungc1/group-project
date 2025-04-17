import os
from firebase_admin import storage
from utils.logger import configure_logger

logger = configure_logger()

# 요약 결과를 텍스트 파일로 저장 및 Firebase Storage에 업로드
def upload_summary_text(summary_text, audio_filename, keywords, remote_folder="summaries"):
    try:
        # 파일명 생성 (예: sample_summary.txt)
        summary_filename = f"{os.path.splitext(os.path.basename(audio_filename))[0]}_summary.txt"
        local_path = os.path.join("/tmp", summary_filename)  # 임시 디렉토리 사용

        # 키워드를 문자열로 변환하여 텍스트에 추가
        keyword_str = "\n- " + "\n- ".join(keywords) if keywords else "없음"
        full_content = f"{summary_text.strip()}\n\n[키워드]{keyword_str}"

        # 텍스트 파일 저장
        with open(local_path, "w", encoding="utf-8-sig") as f:
            f.write(full_content)

        # Storage 업로드
        return upload_summary_file(local_path, remote_folder)

    except Exception as e:
        logger.error(f"요약 텍스트 저장 및 업로드 실패: {e}")
        raise

# Firebase Storage에 파일 업로드
def upload_summary_file(local_path, remote_folder="summaries"):
    try:
        filename = os.path.basename(local_path)
        blob_path = f"{remote_folder}/{filename}"

        bucket = storage.bucket()
        blob = bucket.blob(blob_path)
        blob.upload_from_filename(local_path)
        blob.make_public()

        logger.info(f"Storage 업로드 완료: {blob.public_url}")
        return blob.public_url
    except Exception as e:
        logger.error(f"Storage 업로드 실패: {e}")
        raise
