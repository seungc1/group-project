import ssl
import urllib3

from flask import Flask, request, jsonify
from flask_cors import CORS

from separate_talktotext.diarization.diarization import apply_diarization, merge_segments_with_speakers
from separate_talktotext.firebase.storage_handler import upload_summary_text
from talktotext_jh.new_audioprocessor_V1 import extract_keywords, summarize_text
from utils.logger import configure_logger
from audio.audio import process_audio
from firebase.firestore_handler import get_all_transcripts, save_transcript

# SSL 인증서 검증 비활성화 (테스트 환경용)
ssl._create_default_https_context = ssl._create_unverified_context
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

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

        # 1. Whisper로 텍스트 변환
        segments, full_text, audio_path = process_audio(audio_url)

        # 2. 화자 분리
        diarization = apply_diarization(audio_path)
        transcript = merge_segments_with_speakers(segments, diarization)

        # 3. 키워드 & 요약
        keywords = extract_keywords(full_text)
        summary = summarize_text(full_text)

        # 4. 요약을 텍스트 파일로 저장하고 업로드
        summary_url = upload_summary_text(summary, audio_path)

        # 5. Firestore 저장
        save_transcript({
            "transcript": transcript,
            "keywords": keywords,
            "summary": summary,
            "summaryDownloadUrl": summary_url,
            "text": full_text
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
