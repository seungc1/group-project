/**
 * 최근 회의 및 전체 노트를 표시하는 컴포넌트
 * - 최근 회의 목록을 그리드 형태로 표시
 * - 각 회의 항목은 MeetingItem 컴포넌트를 사용하여 렌더링
 */
'use client';

// 하위 컴포넌트와 스타일 임포트
import MeetingItem from '../MeetingItem';
import styles from './styles.module.css';

export default function RecentMeetings() {
  // 임시 회의 데이터 (실제로는 API나 상태 관리에서 가져와야 함)
  const meetings = [
    {
      id: 1,
      title: '회의 이름',
      description: '회의 간단 설명 ex) 노트 이름, 회의 날짜, 간단 요약?, 참석자',
    },
    {
      id: 2,
      title: '회의 이름',
      description: '회의 간단 설명 ex) 노트 이름, 회의 날짜, 간단 요약?, 참석자',
    },
  ];

  // 최근 회의 섹션 UI 렌더링
  return (
    <section className={styles['recent-meetings']}>
      {/* 섹션 제목 */}
      <h2>최근 회의 및 전체 노트</h2>
      
      {/* 회의 목록 컨테이너 */}
      <div className={styles['meeting-list']}>
        {/* 각 회의 항목을 순회하며 MeetingItem 컴포넌트로 렌더링 */}
        {meetings.map((meeting) => (
          <MeetingItem key={meeting.id} meeting={meeting} />
        ))}
      </div>
    </section>
  );
} 