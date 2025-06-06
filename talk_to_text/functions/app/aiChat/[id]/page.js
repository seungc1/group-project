import Header from '@/components/ui/layout/Header/index';
import MeetingEditor from '@/components/features/Meeting/MeetingEditor';
import { getMeetingById } from '@/services/meetingService';

export default async function aiEditMeetingNote({ params }) {
  const { id } = await params;
  const meeting = await getMeetingById(id);

  if (!meeting) return <p style={{ padding: '20px' }}>회의 데이터를 찾을 수 없습니다.</p>;

  return (
    <>
      <Header title="회의록 수정" />
      <MeetingEditor meeting={meeting} meetingId={id} />
    </>
  );
}

