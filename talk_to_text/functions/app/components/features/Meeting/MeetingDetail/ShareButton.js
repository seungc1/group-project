// 파일 위치: app/components/features/Meeting/MeetingDetail/ShareButton.js
'use client'; 

import { initGapiAuth } from '@/lib/auth';
import { sendPDFViaGmail } from './SendPDFViaGmail';
import { fetchTxtContent } from '@/lib/fetchTxtContent';
import styles from './styles.module.css';

export default function EmailSendButton({ url }) {
  const handleSend = async () => {
    try {
      console.log('📩 [1] 버튼 클릭됨');
      const accessToken = await initGapiAuth();
      console.log('✅ [2] AccessToken 발급 성공:', accessToken);

      const text = await fetchTxtContent(url);
      console.log('📄 [3] 텍스트 파일 로드 성공:', text.slice(0, 100) + '...');

      await sendPDFViaGmail(text, accessToken);
      console.log('✉️ [4] 초안 생성 요청 완료');

      window.open('https://mail.google.com/mail/u/0/#drafts', '_blank');
    } catch (err) {
      console.error('❌ [X] 초안 생성 실패:', err);
      alert('이메일 초안 생성에 실패했습니다. 다시 시도해주세요.');
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
