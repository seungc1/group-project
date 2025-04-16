/**
 * 회의 원본 음성을 재생하는 컴포넌트
 * @param {Object} meeting - 회의 데이터 객체
 * @param {string} meeting.audioUrl - 오디오 파일 URL
 */

// 컴포넌트 스타일 임포트
import styles from './styles.module.css';
import AudioPlayer from './AudioPlayer';

export default function MeetingAudio({ meeting }) {
  // 오디오 URL이 없는 경우 컴포넌트를 렌더링하지 않음
  if (!meeting.audioUrl) {
    return null;
  }

  // 오디오 재생 섹션 렌더링
  return (
    <div className={styles.audioSection}>
      {/* 섹션 제목 */}
      <h3>원본 음성</h3>
      {/* 오디오 플레이어 */}
      <AudioPlayer url={meeting.audioUrl} />
    </div>
  );
} 