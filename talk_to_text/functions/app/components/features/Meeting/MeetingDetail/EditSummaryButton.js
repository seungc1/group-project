// components/Meeting/EditSummaryButton.js
"use client";

import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

/**
 * 회의 요약 수정 버튼 컴포넌트
 * @param {string} meetingId - 회의 문서 ID
 */
export default function EditSummaryButton({ meetingId }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/aiChat/${meetingId}`);
  };

  return (
    <a
      role="button"
      onClick={handleClick}
      className={styles.downloadLink}
      style={{ cursor: 'pointer', marginLeft: '12px' }}
    >
      수정하기
    </a>
  );
}
