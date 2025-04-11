/**
 * 회의 상세 정보의 헤더 컴포넌트
 * @param {Object} meeting - 회의 데이터 객체
 * @param {string} meeting.title - 회의 제목
 * @param {Date} meeting.createAt - 회의 생성일
 * @param {Array} meeting.participantName - 참석자 이름 배열
 * @param {number} meeting.participants - 참석자 수
 */
'use client';

// 컴포넌트 스타일 임포트
import styles from './styles.module.css';

export default function MeetingHeader({ meeting }) {
  /**
   * Firestore 타임스탬프를 YYYY-MM-DD 형식의 문자열로 변환
   * @param {Object} timestamp - Firestore 타임스탬프
   * @returns {string} 포맷된 날짜 문자열
   */
  const formatDate = (timestamp) => {
    // 타임스탬프가 없는 경우 기본 메시지 반환
    if (!timestamp) return '날짜 정보 없음';
    
    // Firestore 타임스탬프를 JavaScript Date 객체로 변환
    const date = timestamp.toDate();
    
    // YYYY-MM-DD 형식으로 날짜 포맷팅
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 회의 헤더 UI 렌더링
  return (
    <div className={styles.meetingHeader}>
      {/* 회의 제목 섹션 */}
      <div className={styles.headerTop}>
        <h2>{meeting.title}</h2>
      </div>
      
      {/* 회의 메타 정보 섹션 */}
      <div className={styles.meetingMeta}>
        {/* 생성일 표시 */}
        <span>생성일: {formatDate(meeting.createAt)}</span>
        
        {/* 참석자 이름 목록 표시 */}
        <span>참석자: {meeting.participantName ? meeting.participantName.join(', ') : '정보 없음'}</span>
        
        {/* 참석자 수 표시 */}
        <span>참석자 수: {meeting.participants || 0}명</span>
      </div>
    </div>
  );
} 