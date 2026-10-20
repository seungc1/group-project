/**
 * 회의록을 찾을 수 없을 때 표시되는 에러 컴포넌트
 * @param {string} id - 찾을 수 없는 회의록 ID
 */

import styles from './styles.module.css';
import ErrorActions from './ErrorActions';

export default function MeetingError({ id }) {
  return (
    <div className={styles.error}>
      {/* 에러 메시지 제목 */}
      <h2>회의록을 찾을 수 없습니다</h2>
      
      {/* 요청된 회의록 ID 표시 */}
      <p>요청하신 회의록 ID: {decodeURIComponent(id)}</p>
      
      {/* 문제 해결을 위한 확인 사항 목록 */}
      <p>다음 사항을 확인해주세요:</p>
      <ul>
        <li>회의록 ID가 올바른지 확인</li>
        <li>Firebase 데이터베이스에 해당 회의록이 존재하는지 확인</li>
        <li>인터넷 연결 상태 확인</li>
        <li>브라우저 콘솔에서 오류 메시지 확인</li>
      </ul>

      {/* 사용자 액션 버튼 컨테이너 */}
      <ErrorActions />
    </div>
  );
}