const functions = require('firebase-functions');
const next = require('next');

const isDev = process.env.NODE_ENV !== 'production';
const app = next({
  dev: isDev,
  conf: {
    distDir: '.next' // Next.js 빌드 결과 디렉토리
  }
});
const handle = app.getRequestHandler();

exports.nextApp = functions.https.onRequest(async (req, res) => {
  await app.prepare(); // 빌드 준비
  return handle(req, res); // 요청 라우팅 처리
});
