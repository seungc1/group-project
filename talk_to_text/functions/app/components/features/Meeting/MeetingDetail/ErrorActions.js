'use client';

import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

export default function ErrorActions() {
  const router = useRouter();

  return (
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
  );
} 