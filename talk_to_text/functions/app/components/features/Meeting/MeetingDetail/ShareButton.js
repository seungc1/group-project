'use client';

import styles from './styles.module.css';

export default function ShareButton({ url }) {
  const bodyText = `회의 요약을 확인해주세요:\n${url}`;
  const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=회의 요약 공유&body=${encodeURIComponent(bodyText)}&tf=1`;

  return (
    <a
      href={gmailLink}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.downloadLink}
      style={{ cursor: 'pointer', marginLeft: '12px' }}
    >
      Gmail로 공유
    </a>
  );
}
