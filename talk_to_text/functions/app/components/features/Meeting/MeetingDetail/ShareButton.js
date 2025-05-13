'use client';

import { initGapiAuth } from './auth';
import { sendPDFViaGmail } from './SendPDFViaGmail';
import { fetchTxtContent } from '@/lib/fetchTxtContent';
import styles from './styles.module.css';

export default function EmailSendButton({ url }) {
  const handleSend = async () => {
    try {
      const accessToken = await initGapiAuth();
      const text = await fetchTxtContent(url);
      await sendPDFViaGmail(text, accessToken);
      window.open('https://mail.google.com/mail/u/0/#drafts', '_blank');
    } catch {
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
