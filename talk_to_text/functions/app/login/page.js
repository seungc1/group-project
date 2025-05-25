'use client';

import styles from './login.module.css';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('Google 로그인 실패!');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>TalkToText</h1>
      <p className={styles.subtitle}>Google 계정으로 시작하세요.</p>
      <button className={styles.loginBtn} onClick={handleLogin}>
        Google로 계속하기
      </button>
    </div>
  );
}
