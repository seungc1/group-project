/**
 * MeetingListItem 컴포넌트
 * 
 * @description
 * 회의 목록에서 개별 회의 항목을 표시하는 컴포넌트입니다.
 * 회의 제목, 참석자 정보, 요약 내용을 보여주며, 클릭 시 상세 페이지로 이동합니다.
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.meeting - 회의 정보 객체
 * @param {string} props.meeting.id - 회의 고유 ID
 * @param {string} props.meeting.title - 회의 제목
 * @param {string[]} props.meeting.participantName - 참석자 이름 배열
 * @param {number} props.meeting.participants - 참석자 수
 * @param {Array} props.meeting.textinfo - 회의 내용 세그먼트 배열
 * 
 * @example
 * <MeetingListItem meeting={{
 *   id: "123",
 *   title: "주간 회의",
 *   participantName: ["홍길동", "김철수"],
 *   participants: 2,
 *   textinfo: [{text: "회의 내용..."}]
 * }} />
 * 
 * @returns {JSX.Element} 회의 목록 항목 컴포넌트
 */

'use client';

import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

export default function MeetingListItem({ meeting }) {
  const router = useRouter();

  // 회의 상세 페이지로 이동하는 핸들러 함수
  const handleClick = () => {
    const encodedId = encodeURIComponent(meeting.id);
    const encodedProjectId = encodeURIComponent(meeting.projectId);
    router.push(`/meetings/${encodedId}?projectId=${encodedProjectId}`);
  };

  return (
    <div className={styles.meetingItem}>
      {/* 회의 내용 컨테이너 */}
      <div className={styles.meetingContent}>
        {/* 회의 제목 */}
        <h3>{meeting.title}</h3>
        
        {/* 참석자 이름 및 회의 날짜 */}
        <p style={{ color: '#111' }}>
          회의날짜: {meeting.meetingDate
            ? (typeof meeting.meetingDate === 'string'
                ? meeting.meetingDate
                : meeting.meetingDate.toDate
                  ? meeting.meetingDate.toDate().toLocaleDateString()
                  : String(meeting.meetingDate))
            : '날짜 없음'}
        </p>
        <p style={{ color: '#111' }}>
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
        </p>
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