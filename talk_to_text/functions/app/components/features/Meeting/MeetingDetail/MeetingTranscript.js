/**
 * 회의 내용(대화 기록)을 표시하는 컴포넌트
 * @param {Object} meeting - 회의 데이터 객체
 * @param {Array} meeting.textinfo - 회의 대화 내용 배열
 * @param {string} meeting.textinfo[].speaker - 발화자 이름
 * @param {string} meeting.textinfo[].text - 발화 내용
 */

import styles from './styles.module.css';

export default function MeetingTranscript({ meeting }) {
  // 대화 내용이 없거나 빈 배열인 경우 컴포넌트를 렌더링하지 않음
  if (!meeting.textinfo || meeting.textinfo.length === 0) {
    return null;
  }

  // 회의 내용 섹션 UI 렌더링
  return (
    <div className={styles.transcriptSection}>
      {/* 섹션 제목 */}
      <h3>회의 내용</h3>
      
      {/* 대화 내용 컨테이너 */}
      <div className={styles.transcriptContent}>
        {/* 각 대화 세그먼트를 순회하며 렌더링 */}
        {meeting.textinfo.map((segment, index) => (
          <div key={index} className={styles.transcriptSegment}>
            {/* 발화자 이름 표시 */}
            <div className={styles.speaker}>{segment.speaker}</div>
            {/* 발화 내용 표시 */}
            <div className={styles.text}>{segment.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 