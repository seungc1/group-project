/**
 * 회의 목록을 표시하는 컴포넌트
 * - 회의 데이터를 가져와서 목록으로 표시
 * - 각 회의 항목 클릭 시 상세 페이지로 이동
 * - 로딩, 에러, 빈 목록 상태 처리
 */
import { getRecentMeetings } from '@/app/services/meetingService';
import MeetingListItem from './MeetingListItem';
import styles from './styles.module.css';

export default async function MeetingList() {
  // 서버에서 회의 데이터 가져오기
  const meetings = await getRecentMeetings();

  // 회의 목록이 비어있을 때 표시
  if (meetings.length === 0) {
    return <div className={styles.empty}>등록된 회의가 없습니다.</div>;
  }

  // 회의 목록 UI 렌더링
  return (
    <div className={styles.meetingsList}>
      {/* 각 회의 항목을 순회하며 렌더링 */}
      {meetings.map((meeting) => (
        <MeetingListItem key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
} 