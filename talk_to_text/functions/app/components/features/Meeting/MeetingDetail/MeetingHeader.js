/**
 * 회의 상세 정보의 헤더 컴포넌트
 * @param {Object} meeting - 회의 데이터 객체
 * @param {string} meeting.title - 회의 제목
 * @param {Date} meeting.createAt - 회의 생성일
 * @param {Array} meeting.participantName - 참석자 이름 배열
 * @param {number} meeting.participants - 참석자 수
 */

import CloseButton from '@/app/components/common/buttons/CloseButton';
// 컴포넌트 스타일 임포트
import styles from './styles.module.css';

export default function MeetingHeader({ meeting }) {
  // 날짜 포맷팅 (meetingDate가 timestamp 객체일 경우)
  let displayDate = '';
  if (meeting.meetingDate) {
    if (typeof meeting.meetingDate === 'string') {
      displayDate = meeting.meetingDate;
    } else if (meeting.meetingDate.toDate) {
      // Firestore Timestamp 객체일 경우
      const d = meeting.meetingDate.toDate();
      displayDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }
  }

  // 회의 헤더 UI 렌더링
  return (
    <div className={styles.meetingHeader}>
      {/* 회의 제목 섹션 */}
      <div className={styles.headerTop}>
        <h2>{meeting.title}</h2>
        <CloseButton />
      </div>
      
      {/* 회의 메타 정보 섹션 */}
      <div className={styles.meetingMeta}>
        {/* 생성일 표시 */}
        <span>회의날짜: {displayDate || '정보 없음'}</span>
        
        {/* 참석자 이름 목록 표시 */}
        <span>
          참석자: {
            Array.isArray(meeting.participantNames)
              ? meeting.participantNames.join(', ')
              : typeof meeting.participantNames === 'string' && meeting.participantNames
                ? (() => { try { return JSON.parse(meeting.participantNames).join(', '); } catch { return meeting.participantNames; } })()
                : Array.isArray(meeting.participantName)
                  ? meeting.participantName.join(', ')
                  : typeof meeting.participantName === 'string' && meeting.participantName
                    ? meeting.participantName
                    : '정보 없음'
          }
        </span>
        
        {/* 참석자 수 표시 */}
        <span>참석자 수: {meeting.participants || 0}명</span>
      </div>
    </div>
  );
}