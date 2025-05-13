'use client';

import React from 'react';
import { createMeetingPDF } from '@/lib/createMeetingPDF';
import { fetchTxtContent } from '@/lib/fetchTxtContent';
import styles from './styles.module.css';

export default function DownloadButton({ url }) {
  const handleDownload = async () => {
    try {
      const textContent = await fetchTxtContent(url);
      const pdfDoc = createMeetingPDF(textContent);
      pdfDoc.save('meeting-summary.pdf');
    } catch (error) {
      alert('파일을 PDF로 변환할 수 없습니다.');
    }
  };

  return (
    <button onClick={handleDownload} className={styles.downloadLink}>
      요약 다운로드
    </button>
  );
}
