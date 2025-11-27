const functions = require('firebase-functions');
const next = require('next');

// 개발 환경인지 아닌지 확인
const isDev = process.env.NODE_ENV !== 'production';
// Next.js 앱 초기화
const app = next({
  dev: isDev,
  conf: {
    distDir: '.next' 
  }
});
const handle = app.getRequestHandler();

// Firebase Function을 통해 HTTP 요청을 처리하는 함수 내보내기
exports.nextApp = functions.https.onRequest(async (req, res) => {
  await app.prepare(); // 빌드 준비
  return handle(req, res); // 요청 라우팅 처리
});
