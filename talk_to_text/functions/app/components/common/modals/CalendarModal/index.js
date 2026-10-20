/**
 * 캘린더 일정 추가를 위한 모달 컴포넌트
 * @param {boolean} visible - 모달 표시 여부
 * @param {string} url - 캘린더 일정 추가 URL
 * @param {Function} onClose - 모달 닫기 핸들러
 */
'use client';

import { useState } from 'react';
import styles from './styles.module.css';

export default function CalendarModal({ visible, url, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!visible) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>캘린더 일정 추가</h2>
        <p>아래 링크를 클릭하여 캘린더에 일정을 추가하세요.</p>
        
        <div className={styles.urlContainer}>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.calendarLink}
          >
            캘린더에서 열기
          </a>
          
          <button 
            onClick={handleCopy}
            className={styles.copyButton}
          >
            {copied ? '복사됨!' : '링크 복사'}
          </button>
        </div>

        <button 
          onClick={onClose}
          className={styles.closeButton}
        >
          닫기
        </button>
      </div>
    </div>
  );
} 