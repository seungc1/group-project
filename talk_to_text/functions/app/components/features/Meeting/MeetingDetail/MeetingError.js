/**
 * 회의록을 찾을 수 없을 때 표시되는 에러 컴포넌트
 * @param {string} id - 찾을 수 없는 회의록 ID
 */
'use client';

// Next.js 라우터와 스타일 임포트
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

export default function MeetingError({ id }) {
  // 라우터 인스턴스 생성
  const router = useRouter();

  // 에러 메시지와 액션 버튼을 포함한 UI 렌더링
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
      <div className={styles.errorActions}>
        {/* 회의록 목록으로 돌아가는 버튼 */}
        <button
          className={styles.navigationButton}
          onClick={() => router.push('/meetings')}
        >
          회의록 목록으로 돌아가기
        </button>
        
        {/* 새 회의록 생성 페이지로 이동하는 버튼 */}
        <button
          className={styles.createButton}
          onClick={() => router.push('/create')}
        >
          새 회의록 만들기
        </button>
      </div>
    </div>
  );
} 