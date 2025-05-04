/**
 * 회의 요약 정보를 표시하는 컴포넌트
 * @param {Object} meeting - 회의 데이터 객체
 * @param {string|Object} meeting.summary - 회의 요약 내용
 * @param {string} meeting.summaryDownloadUrl - 요약 다운로드 URL
 */

// 컴포넌트 스타일 임포트
import styles from './styles.module.css';
import DownloadButton from './DownloadButton';
import ShareButton from './ShareButton';
import EditSummaryButton from './EditSummaryButton';

export default function MeetingSummary({ meeting }) {
  // 요약 섹션 UI 렌더링
  return (
    <div className={styles.summarySection}>
      {/* 섹션 제목 */}
      <h3>회의 요약</h3>
      
      {/* 요약 내용 컨테이너 */}
      <div className={styles.summaryContent}>
        {/* 요약 데이터가 있는 경우 */}
        {meeting.summary ? (
          // 문자열인 경우 그대로 표시, 객체인 경우 JSON 문자열로 변환
          typeof meeting.summary === 'string'
            ? meeting.summary
            : JSON.stringify(meeting.summary)
        ) : (
          // 요약 데이터가 없는 경우 기본 메시지 표시
          '요약 데이터가 없습니다.'
        )}
      </div>

      {/* 다운로드 URL이 있는 경우 다운로드 섹션 표시 */}
      {meeting.summaryDownloadUrl && (
        <div className={styles.downloadSection}>
          <DownloadButton url={meeting.summaryDownloadUrl} />
          <EditSummaryButton meetingId={meeting.id} />
          <ShareButton url={meeting.summaryDownloadUrl} />
        </div>
      )}
    </div>
  );
} 
