import os
import ssl
import urllib3
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from concurrent.futures import ThreadPoolExecutor

from utils.logger import configure_logger
from audio.audio import download_audio, process_whisper_from_path
from diarization.diarization import apply_diarization, merge_segments_with_speakers
from nlp.text_processing import extract_keywords, extract_keywords_tfidf, summarize_text
from firebase.storage_handler import upload_summary_text
from firebase.firestore_handler import save_transcript, get_all_transcripts
from dotenv import load_dotenv
from cal_module.calendar_sync import create_calendar_event
from cal_module.datetime_extractor import extract_datetimes_from_text

# .env.local 파일 경로 설정
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env.server"))
load_dotenv(dotenv_path)

firebase_key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")


# SSL 검증 완전 비활성화
ssl._create_default_https_context = ssl._create_unverified_context
urllib3.disable_warnings()
requests.packages.urllib3.disable_warnings()

# 환경 변수 설정
os.environ['HF_HUB_DISABLE_SSL_VERIFY'] = '1'
os.environ['CURL_CA_BUNDLE'] = ''
os.environ['REQUESTS_CA_BUNDLE'] = ''
os.environ['SSL_CERT_FILE'] = ''

# Flask 앱 초기화
app = Flask(__name__)
CORS(app)

# 로거 설정
logger = configure_logger()

# 오디오 처리 엔드포인트
@app.route('/process-audio', methods=['POST'])
def process_audio_endpoint():
    try:
        audio_url = request.json.get('audioUrl')
        if not audio_url:
            return jsonify({"success": False, "error": "audioUrl 파라미터가 필요합니다."}), 400

        # 1. 오디오 파일 다운로드 (공통 입력 기반)
        audio_path = download_audio(audio_url)

        # 2. Whisper STT & 화자분리 병렬 처리
        with ThreadPoolExecutor() as executor:
            whisper_future = executor.submit(process_whisper_from_path, audio_path)
            diarization_future = executor.submit(apply_diarization, audio_path)

            segments, full_text = whisper_future.result()
            diarization = diarization_future.result()

        # 3. 세그먼트와 화자 정보 결합
        transcript = merge_segments_with_speakers(segments, diarization)

        # 4. NLP 처리
        keywords = extract_keywords_tfidf(full_text, top_n=5)   # 키워드 추출 (TF-IDF 기반)
        # keywords = extract_keywords(full_text)
        summary = summarize_text(full_text) 
        
        # 4-1. 요약 또는 원문에서 회의 일정 날짜 추출
        # 여러 날짜 추출
        meeting_datetimes = extract_datetimes_from_text(summary)
        calendar_links = []  # 생성된 일정 링크 저장용
        event_links = []
        datetimes = extract_datetimes_from_text(summary)

        if datetimes:
            for dt in datetimes:
                logger.info(f"회의 일정으로 인식된 날짜: {dt}")
                event_link = create_calendar_event("회의 있음", dt)
                if event_link:
                    event_links.append(event_link)
                    logger.info(f"Google Calendar 일정 등록 성공: {event_link}")
                else:
                    logger.warning("Google Calendar 일정 등록 실패")
        else:
            logger.info("요약에서 일정 관련 날짜를 찾지 못했음.")
        
        
        # 5. 요약 파일 저장 및 Firebase 업로드
        summary_url = upload_summary_text(summary, audio_path, keywords)

        # 6. Firestore에 저장
        save_transcript({
            "transcript": transcript,
            "keywords": keywords,
            "summary": summary,
            "summaryDownloadUrl": summary_url,
            "text": full_text,
            "calendarEventUrls": event_links if event_links else None  # 여러 일정 링크 저장
        })

        return jsonify({
            "success": True,
            "transcript": transcript,
            "keywords": keywords,
            "summary": summary,
            "summaryDownloadUrl": summary_url
        })
    except Exception as e:
        logger.exception("/process-audio 처리 중 오류 발생")
        return jsonify({"success": False, "error": str(e)}), 500

# 회의록 전체 조회 API
@app.route('/transcripts', methods=['GET'])
def get_all_transcripts_endpoint():
    try:
        data = get_all_transcripts()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        logger.exception("/transcripts 조회 중 오류 발생")
        return jsonify({"success": False, "error": str(e)}), 500

# 앱 실행
if __name__ == '__main__':
    app.run(port=5000, debug=True)
