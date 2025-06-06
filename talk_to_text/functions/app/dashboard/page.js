'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user]);

  if (!user) return <div>로그인 확인 중...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <img src="/images/dashboard_img.png" alt="TalkToText Character" className={styles.characterImage} />
      </div>
      <div className={styles.rightSection}>
        <h1 className={styles.greeting}>
          안녕하세요, <span className={styles.username}>{user?.displayName || 'OOO'}</span> 님
        </h1>
        <p className={styles.message}>
          모든 회의, 하나의 회의록으로. <span className={styles.brand}>TalkToText</span>에서 시작하세요.
        </p>
        <div className={styles.buttonGroup}>
          <button onClick={() => router.push('/record')} className={styles.recordButton}>
            회의 녹음하러 가기
          </button>
          <button onClick={() => router.push('/projects/new')} className={styles.createButton}>
            회의록 생성하러 가기
          </button>
        </div>
      </div>
    </div>
  );
}
