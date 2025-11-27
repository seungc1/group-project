// components/Meeting/EditSummaryButton.js
"use client";

import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

/**
 * 회의 요약 수정 버튼 컴포넌트
 * @param {string} meetingId - 회의 문서 ID
 */
export default function EditSummaryButton({ meeting, userId }) {
  const router = useRouter();

  const handleClick = () => {
    console.log('meeting:', meeting);
    console.log('userId:', userId);
    const meetingId = meeting.meetingId || meeting.id;
    const projectId = meeting.projectId;
    console.log('meetingId:', meetingId);
    console.log('projectId:', projectId);
    if (!meeting || !meetingId || !projectId || !userId) {
      alert('값이 없습니다!');
      return;
    }
    router.push(`/aiChat/users/${userId}/projects/${projectId}/meetings/${meetingId}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={styles.downloadLink}
      style={{ cursor: 'pointer', marginLeft: '12px' }}
    >
      수정하기
    </button>
  );
}
