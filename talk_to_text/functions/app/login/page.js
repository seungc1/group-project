'use client';

import styles from './login.module.css';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  // 이미 로그인된 상태라면 홈으로 리다이렉트
  useEffect(() => {
    if (user) {
      router.replace('/dashboard'); // 또는 '/'
    }
  }, [user, router]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();

      // Google Calendar 권한 추가
      provider.addScope('https://www.googleapis.com/auth/calendar.events');

      // 항상 계정 선택창을 띄우기
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (!accessToken) {
        alert('Google access token을 가져오지 못했습니다.');
        return;
      }

      console.log('✅ accessToken:', accessToken);

      // (테스트용) localStorage에 저장
      localStorage.setItem('googleAccessToken', accessToken);

      // Firestore users 정보 저장/업데이트 (항상 전체 정보 갱신)
      const user = result.user;
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: user.email,
        name: user.displayName || '',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        role: 'user',
        settings: { notifications: true, theme: 'light' },
        userId: user.uid
      }, { merge: true });

      router.push('/dashboard'); // 로그인 성공 시 이동
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
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