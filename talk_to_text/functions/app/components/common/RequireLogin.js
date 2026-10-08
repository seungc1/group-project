import styles from './RequireLogin.module.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function RequireLogin({ message = "로그인이 필요합니다", subMessage = "서비스 이용을 위해 로그인이 필요합니다." }) {
  const { loginWithGoogle } = useAuth();
  return (
    <div className={styles.container}>
      <img src="/images/TalkToText_logo.png" alt="로고" className={styles.logo} />
      <h2 className={styles.title}>{message}</h2>
      <p className={styles.desc}>{subMessage}</p>
      <button className={styles.loginBtn} onClick={loginWithGoogle}>
        로그인
      </button>
    </div>
  );
} 