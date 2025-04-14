/**
 * 음성 텍스트 변환 결과를 표시하는 컴포넌트
 * @param {string} text - 변환된 텍스트
 * @param {boolean} isLoading - 변환 중인지 여부
 */
import styles from './styles.module.css'; // 컴포넌트 스타일 임포트

export const Transcription = ({ text, isLoading }) => {
  return (
    // 변환 결과를 표시하는 컨테이너
    <div className={styles.transcription}>
      {isLoading ? (
        // 로딩 중일 때 표시되는 컴포넌트
        <div className={styles.loading}>변환 중...</div>
      ) : (
        // 변환이 완료되었을 때 텍스트를 표시하는 컴포넌트
        <div className={styles.text}>{text}</div>
      )}
    </div>
  );
}; 