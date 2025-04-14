/**
 * 회의 상세 정보를 표시하는 컴포넌트
 * @param {string} id - 회의록 ID
 */
import { getMeetingById } from '@/app/services/meetingService';
import MeetingHeader from './MeetingHeader';
import MeetingSummary from './MeetingSummary';
import MeetingKeywords from './MeetingKeywords';
import MeetingTranscript from './MeetingTranscript';
import MeetingAudio from './MeetingAudio';
import MeetingError from './MeetingError';
import styles from './styles.module.css';

export default async function MeetingDetail({ id }) {
  const meeting = await getMeetingById(id);

  if (!meeting) {
    return <MeetingError id={id} />;
  }

  return (
    <div className={styles.meetingDetail}>
      <MeetingHeader meeting={meeting} />
      <MeetingSummary meeting={meeting} />
      <MeetingKeywords meeting={meeting} />
      <MeetingTranscript meeting={meeting} />
      <MeetingAudio meeting={meeting} />
    </div>
  );
} 