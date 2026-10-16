/**
 * 회의 목록에서 개별 회의를 표시하는 컴포넌트
 * @param {Object} meeting - 회의 데이터 객체
 * @param {string} meeting.title - 회의 제목
 * @param {string} meeting.description - 회의 설명
 */
import styles from './styles.module.css';
import MeetingItemActions from './MeetingItemActions';

export default function MeetingItem({ meeting }) {
  return (
    <div className={styles['meeting-item']}>
      {/* 썸네일 영역 */}
      <div className={styles.thumbnail}></div>
      
      {/* 회의 내용 영역 */}
      <div className={styles.content}>
        {/* 회의 제목 */}
        <h3 className={styles['meeting-title']}>{meeting.title}</h3>
        {/* 회의 설명 */}
        <p className={styles['meeting-description']}>{meeting.description}</p>
        <div className={styles['meeting-meta']}>
          <span className={styles['meeting-date']}>
            {new Date(meeting.createdAt).toLocaleDateString()}
          </span>
          <span className={styles['meeting-participants']}>
            {meeting.participants?.length || 0}명 참석
          </span>
        </div>
      </div>
      
      {/* 클라이언트 컴포넌트로 분리된 액션 버튼들 */}
      <MeetingItemActions meetingId={meeting.id} />
    </div>
  );
} 