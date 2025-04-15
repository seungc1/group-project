/**
 * 회의 목록을 표시하는 컴포넌트
 * - 회의 데이터를 가져와서 목록으로 표시
 * - 각 회의 항목 클릭 시 상세 페이지로 이동
 * - 로딩, 에러, 빈 목록 상태 처리
 */
import { useRouter } from 'next/navigation';
import { useMeetings } from '../../hooks/useMeetings';
import styles from './styles.module.css';

export const MeetingsList = () => {
  // 라우터 인스턴스 생성
  const router = useRouter();
  
  // 커스텀 훅을 사용하여 회의 데이터와 상태 관리
  const { meetings, loading, error } = useMeetings();

  // 로딩 중일 때 표시
  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  // 에러 발생 시 표시
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  // 회의 목록이 비어있을 때 표시
  if (meetings.length === 0) {
    return <div className={styles.empty}>등록된 회의가 없습니다.</div>;
  }

  // 회의 목록 UI 렌더링
  return (
    <div className={styles.meetingsList}>
      {/* 각 회의 항목을 순회하며 렌더링 */}
      {meetings.map((meeting) => (
        <div key={meeting.id} className={styles.meetingItem}>
          {/* 회의 내용 컨테이너 */}
          <div className={styles.meetingContent}>
            {/* 회의 제목 */}
            <h3>{meeting.title}</h3>
            
            {/* 참석자 이름 목록 */}
            <p>참석자: {meeting.participantName.join(', ')}</p>
            
            {/* 참석자 수 */}
            <p>참석자 수: {meeting.participants}명</p>
            
            {/* 회의 내용 요약 (첫 3개 세그먼트만 표시) */}
            {meeting.textinfo && (
              <p className={styles.summary}>
                {meeting.textinfo.slice(0, 3).map(segment => segment.text).join(' ')}...
              </p>
            )}
          </div>
          
          {/* 상세 페이지로 이동하는 버튼 */}
          <button 
            className={styles.viewButton}
            onClick={() => {
              console.log('회의록 ID로 이동:', meeting.id);
              // URL에 안전하게 포함될 수 있도록 ID 인코딩
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