/**
 * 회의 원본 음성을 재생하는 컴포넌트
 * @param {Object} meeting - 회의 데이터 객체
 * @param {string} meeting.audioUrl - 오디오 파일 URL
 */
'use client';

// 컴포넌트 스타일 임포트
import styles from './styles.module.css';

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
      <audio controls className={styles.audioPlayer}>
        {/* 오디오 소스 설정 */}
        <source src={meeting.audioUrl} type="audio/mpeg" />
        {/* 오디오 재생을 지원하지 않는 브라우저를 위한 대체 텍스트 */}
        브라우저가 오디오 재생을 지원하지 않습니다.
      </audio>
    </div>
  );
} 