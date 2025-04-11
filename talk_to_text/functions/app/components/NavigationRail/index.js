import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

export const NavigationRail = () => {
  const router = useRouter();

  return (
    <nav className={styles['navigation-rail']}>
      <div className={styles['nav-items']}>
        <div 
          className={styles['nav-item']} 
          onClick={() => router.push('/')}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.icon}>🏠</div>
          <span>홈</span>
        </div>
        <div 
          className={styles['nav-item']} 
          onClick={() => router.push('/create')}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.icon}>🎙️</div>
          <span>회의 생성</span>
        </div>
        <div className={styles['nav-item']}>
          <div className={styles.icon}>🎤</div>
          <span>음성 녹음</span>
        </div>
        <div 
          className={styles['nav-item']}
          onClick={() => router.push('/meetings')}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.icon}>📋</div>
          <span>전체 회의록</span>
        </div>
        <div className={styles['nav-item']}>
          <div className={styles.icon}>⚙️</div>
          <span>미정</span>
        </div>
      </div>
    </nav>
  );
}; 