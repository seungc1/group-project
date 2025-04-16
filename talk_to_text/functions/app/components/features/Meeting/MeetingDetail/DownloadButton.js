'use client';

import styles from './styles.module.css';

export default function DownloadButton({ url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.downloadLink}
    >
      요약 다운로드
    </a>
  );
} 