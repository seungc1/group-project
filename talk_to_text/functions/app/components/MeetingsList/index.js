import { useRouter } from 'next/navigation';
import { useMeetings } from '../../hooks/useMeetings';
import styles from './styles.module.css';

export const MeetingsList = () => {
  const router = useRouter();
  const { meetings, loading, error } = useMeetings();

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (meetings.length === 0) {
    return <div className={styles.empty}>등록된 회의가 없습니다.</div>;
  }

  return (
    <div className={styles.meetingsList}>
      {meetings.map((meeting) => (
        <div key={meeting.id} className={styles.meetingItem}>
          <div className={styles.meetingContent}>
            <h3>{meeting.title}</h3>
            <p>참석자: {meeting.participantName.join(', ')}</p>
            <p>참석자 수: {meeting.participants}명</p>
            {meeting.textinfo && (
              <p className={styles.summary}>
                {meeting.textinfo.slice(0, 3).map(segment => segment.text).join(' ')}...
              </p>
            )}
          </div>
          <button 
            className={styles.viewButton}
            onClick={() => {
              console.log('회의록 ID로 이동:', meeting.id);
              const encodedId = encodeURIComponent(meeting.id);
              router.push(`/meetings/${encodedId}`);
            }}
          >
            보기
          </button>
        </div>
      ))}
    </div>
  );
}; 