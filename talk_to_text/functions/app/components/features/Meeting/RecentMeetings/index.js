/**
 * 최근 회의 및 전체 노트를 표시하는 컴포넌트
 * - 최근 회의 목록을 그리드 형태로 표시
 * - 각 회의 항목은 MeetingItem 컴포넌트를 사용하여 렌더링
 */
import { getRecentMeetings } from '@/app/services/meetingService';
import MeetingItem from '../MeetingItem';

export default async function RecentMeetings() {
  const meetings = await getRecentMeetings();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">최근 회의</h2>
      {meetings.length === 0 ? (
        <p className="text-gray-500">아직 회의가 없습니다.</p>
      ) : (
        <div className="grid gap-4">
          {meetings.map((meeting) => (
            <MeetingItem key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}
    </div>
  );
} 