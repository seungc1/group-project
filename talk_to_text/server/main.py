import os
os.environ["GRPC_VERBOSITY"] = "ERROR"
os.environ["GRPC_TRACE"] = ""
import ssl
import urllib3
import requests
from firebase_admin import firestore
from datetime import datetime
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from concurrent.futures import ThreadPoolExecutor
import json

from utils.logger import configure_logger
from audio.audio import download_audio, process_whisper_from_path
from diarization.diarization import apply_diarization, merge_segments_with_speakers
from nlp.text_processing import extract_keywords, extract_keywords_tfidf, summarize_text
from firebase.storage_handler import upload_summary_text
from firebase.firestore_handler import save_meeting_data, save_textinfo, save_tags, save_calendar_logs, get_meeting_data, get_all_transcripts
from cal_module.calendar_sync import create_calendar_event
from cal_module.datetime_extractor import extract_datetimes_from_text

from task.task_extractor import extract_task_commands_with_solar
from task.google_task_register import register_tasks

from calendar_logs_project.main import extract_and_store_schedule_logs

# .env 파일 강제 로드
from dotenv import load_dotenv

# 루트 경로 기준으로 .env.server 위치 지정
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env.server'))
load_dotenv(dotenv_path=env_path)

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

# CORS 설정 업데이트
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept", "Origin"],
        "supports_credentials": True
    }
})

# 로거 설정
logger = configure_logger()

@app.before_request
def before_request():
    print("="*50)
    print(f"새로운 요청 받음: {request.method} {request.path}")
    print(f"요청 헤더: {dict(request.headers)}")
    if request.method == 'OPTIONS':
        print("OPTIONS 요청 처리 중...")
    print("="*50)

# 오디오 처리 엔드포인트
@app.route('/process-audio', methods=['POST', 'OPTIONS'])
def process_audio_endpoint():
    if request.method == 'OPTIONS':
        print("OPTIONS 요청에 대한 응답 전송")
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    print("POST 요청 처리 시작")
    try:
        # 프론트엔드에서 전달받은 데이터
        data = request.json
        audio_url = data.get('audioUrl')
        userId = data.get('userId')
        projectId = data.get('projectId')
        meetingId = data.get('meetingId')
        meetingMinutesList = data.get('meetingMinutesList', '')

        if not all([audio_url, userId, projectId, meetingId]):
            print("필수 파라미터 누락")
            return jsonify({
                "success": False, 
                "error": "audioUrl, userId, projectId, meetingId 파라미터가 모두 필요합니다."
            }), 400

        print(f"처리할 오디오 URL: {audio_url}")
        print(f"사용자 ID: {userId}")
        print(f"프로젝트 ID: {projectId}")
        print(f"회의 ID: {meetingId}")

        # 1. 오디오 파일 다운로드
        audio_path = download_audio(audio_url)

        # 2. Whisper STT & 화자분리 병렬 처리
        with ThreadPoolExecutor() as executor:
            whisper_future = executor.submit(process_whisper_from_path, audio_path)
            diarization_future = executor.submit(apply_diarization, audio_path)

            segments, full_text = whisper_future.result()
            diarization = diarization_future.result()

        # 3. 세그먼트와 화자 정보 결합
        transcript = merge_segments_with_speakers(segments, diarization)

        # textinfo 생성
        textinfo = [
            {
                "speaker": seg.get("speaker", ""),
                "text": seg.get("text", ""),
                "startTime": seg.get("start", 0),
                "endTime": seg.get("end", 0)
            }
            for seg in transcript
        ]

        # 4. NLP 처리
        keywords = extract_keywords_tfidf(full_text, top_n=5)
        summary = summarize_text(full_text)
        summary_text = summary

        # calendar_logs 문서 업데이트 함수
        def update_calendar_log(log_id, event_url):
            db = firestore.client()
            log_ref = db.collection('calendar_logs').document(log_id)
            log_ref.update({
                "calendarEventUrl": event_url,
                "status": "success"
            })

        # 4-1. 회의 일정 추출 및 저장
        meeting_id = os.path.splitext(os.path.basename(audio_path))[0]
        datetimes = extract_and_store_schedule_logs(summary_text, meeting_id)
        event_links = []

        for dt_info in datetimes:
            logger.info(f"회의 일정으로 인식된 날짜: {dt_info}")
            start_datetime = dt_info["datetime"]
            if isinstance(start_datetime, str):
                start_datetime = datetime.fromisoformat(start_datetime)
            event_link = create_calendar_event("회의 있음", start_datetime)
            if event_link:
                event_links.append(event_link)
                update_calendar_log(dt_info["logId"], event_link)

        # 4-3. 명령형 문장 추출 및 Google Tasks 등록    
        # 1. 명령형 문장 추출
        commands = extract_task_commands_with_solar(summary_text)
        commands = [cmd for cmd in commands if cmd.strip()]  # 불필요한 공백 제거

        # 2. Google Tasks 등록
        if commands:
            register_tasks(commands)
        

        # 5. 요약 파일 저장 및 Firebase 업로드
        summary_url = upload_summary_text(summary, audio_path, keywords)

        # 6. Firestore 저장
        participant_names = data.get('participantNames', [])
        if isinstance(participant_names, str):
            try:
                participant_names = json.loads(participant_names)
            except Exception:
                participant_names = [participant_names]
        participant_names = [n for n in participant_names if n and str(n).strip()]

        save_meeting_data(userId, projectId, meetingId, {
            'audioFileName': data.get('audioFileName', ''),
            'audioUrl': audio_url,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'createdBy': userId,
            'meetingDate': data.get('meetingDate', ''),
            'meetingMinutesList': meetingMinutesList,
            'participantNames': participant_names,
            'participants': data.get('participants', 0),
            'projectId': projectId,
            'status': 'completed',
            'title': data.get('title', ''),
            'summary': summary,
            'keywords': keywords,
            'summaryFileUrl': summary_url,
            'calendarEventUrls': event_links or None,
            'calendarDateTimes': datetimes,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })

        if textinfo:
            save_textinfo(userId, projectId, meetingId, textinfo)

        tags = [{"label": kw, "createdAt": datetime.now().isoformat()} for kw in keywords]
        if tags:
            save_tags(userId, projectId, meetingId, tags)

        calendar_logs = []
        if calendar_logs:
            save_calendar_logs(userId, projectId, meetingId, calendar_logs)

        logger.info("Firestore에 모든 데이터 저장 완료")

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

# 응답 후 처리 훅
@app.after_request
def after_request(response):
    return response

# 앱 실행
if __name__ == '__main__':
    app.run(
        host='0.0.0.0',  # 모든 IP에서 접근 가능
        port=5001,       # 포트 번호 변경
        debug=True
    )
