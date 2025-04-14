/**
 * 회의 상세 정보의 헤더 컴포넌트
 * @param {Object} meeting - 회의 데이터 객체
 * @param {string} meeting.title - 회의 제목
 * @param {Date} meeting.createAt - 회의 생성일
 * @param {Array} meeting.participantName - 참석자 이름 배열
 * @param {number} meeting.participants - 참석자 수
 */

// 컴포넌트 스타일 임포트
import styles from './styles.module.css';

export default function MeetingHeader({ meeting }) {
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
        <span>생성일: {meeting.formattedDate}</span>
        
        {/* 참석자 이름 목록 표시 */}
        <span>참석자: {meeting.participantName ? meeting.participantName.join(', ') : '정보 없음'}</span>
        
        {/* 참석자 수 표시 */}
        <span>참석자 수: {meeting.participants || 0}명</span>
      </div>
    </div>
  );
} 