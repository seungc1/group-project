'use client';

import { initGapiAuth } from './auth'; // OAuth 인증 함수
import { sendPDFViaGmail } from './SendPDFViaGmail'; // ✨ 초안 생성 함수로 변경
import styles from './styles.module.css';

function EmailSendButton({ textUrl }) {
  const handleSend = async () => {
    try {
      // 1. OAuth 인증 및 로그인
      const accessToken = await initGapiAuth();

      // 2. 텍스트 불러오기
      const response = await fetch(textUrl);
      const text = await response.text();

      // 3. Gmail 초안 생성 (to는 비워두고 PDF는 자동 첨부)
      await sendPDFViaGmail(text, accessToken);

      // 4. Gmail 초안함 창 열기
      window.open('https://mail.google.com/mail/u/0/#drafts', '_blank');
    } catch (error) {
      console.error('❌ 인증 또는 이메일 초안 생성 오류:', error);
      alert('이메일 초안 생성에 실패했습니다.');
    }
  };

  return (
    <button
      onClick={handleSend}
      className={styles.downloadLink}
      style={{ cursor: 'pointer', marginLeft: '12px' }}
    >
      Gmail로 공유
    </button>
  );
}

export default EmailSendButton;
