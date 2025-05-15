import Header from '@/components/ui/layout/Header/index';
import MeetingEditor from '@/components/features/Meeting/MeetingEditor';
import { getMeetingDetail } from '@/lib/meetingsService';

function serializeTimestamps(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const result = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    const value = obj[key];
    if (value && typeof value === 'object' && value.seconds !== undefined && value.nanoseconds !== undefined) {
      // Firestore Timestamp 객체를 ISO 문자열로 변환
      result[key] = new Date(value.seconds * 1000).toISOString();
    } else if (typeof value === 'object') {
      result[key] = serializeTimestamps(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export default async function AiEditMeetingNote({ params }) {
  const { userId, projectId, meetingId } = await params;
  const meetingRaw = await getMeetingDetail(userId, projectId, meetingId);
  const meeting = serializeTimestamps(meetingRaw);

  if (!meeting) return <p style={{ padding: '20px' }}>회의 데이터를 찾을 수 없습니다.</p>;

  return (
    <>
      <Header title="회의록 수정" />
      <MeetingEditor meeting={meeting} meetingId={meetingId} />
    </>
  );
} 