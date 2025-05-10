'use client';

import React from 'react';
import { createMeetingPDF } from './createMeetingPDF';
import styles from './styles.module.css';

export default function DownloadButton({ url }) {
  const handleDownload = async () => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('다운로드 실패: ' + response.status);
      }

      const decoder = new TextDecoder('utf-8');
      const arrayBuffer = await response.arrayBuffer();
      const textContent = decoder.decode(arrayBuffer);

      const contentType = response.headers.get('Content-Type') || '';
      if (!contentType.includes('text/plain')) {
        throw new Error('지원하지 않는 파일 형식입니다. 텍스트 파일만 변환 가능합니다.');
      }

      const pdfDoc = createMeetingPDF(textContent);
      pdfDoc.save('meeting-summary.pdf');

    } catch (error) {
      console.error('❌ PDF 변환 오류:', error.message);
      alert('파일을 PDF로 변환할 수 없습니다.');
    }
  };

  return (
    <button onClick={handleDownload}className={styles.downloadLink}>
      요약 다운로드
    </button>
  );
}
