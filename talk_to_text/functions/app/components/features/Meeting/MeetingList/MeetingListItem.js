'use client';

import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

export default function MeetingListItem({ meeting }) {
  const router = useRouter();

  const handleClick = () => {
    const encodedId = encodeURIComponent(meeting.id);
    router.push(`/meetings/${encodedId}`);
  };

  return (
    <div className={styles.meetingItem}>
      {/* 회의 내용 컨테이너 */}
      <div className={styles.meetingContent}>
        {/* 회의 제목 */}
        <h3>{meeting.title}</h3>
        
        {/* 참석자 이름 목록 */}
        <p>참석자: {meeting.participantName?.join(', ')}</p>
        
        {/* 참석자 수 */}
        <p>참석자 수: {meeting.participants}명</p>
        
        {/* 회의 내용 요약 (첫 3개 세그먼트만 표시) */}
        {meeting.textinfo && (
          <p className={styles.summary}>
            {meeting.textinfo.slice(0, 3).map(segment => segment.text).join(' ')}...
          </p>
        )}
      </div>
      
      {/* 상세 페이지로 이동하는 버튼 */}
      <button 
        className={styles.viewButton}
        onClick={handleClick}
      >
        보기
      </button>
    </div>
  );
} 