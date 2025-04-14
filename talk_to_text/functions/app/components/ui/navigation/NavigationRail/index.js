/**
 * 사이드바 네비게이션 컴포넌트
 * - 접기/펼치기 기능과 주요 페이지 이동 메뉴 제공
 * - 반응형 디자인 지원
 */

'use client';

// React 훅과 라우터 임포트
import { useRouter } from 'next/navigation';
// 컴포넌트 스타일 임포트
import styles from './styles.module.css';

export const NavigationRail = ({ isCollapsed, setIsCollapsed }) => {
  // 라우터 인스턴스 생성
  const router = useRouter();

  // 사이드바 접기/펼치기 토글 함수
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // 네비게이션 레일 UI 렌더링
  return (
    <nav className={`${styles['navigation-rail']} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* 사이드바 토글 버튼 */}
      <button 
        className={styles['toggle-button']} 
        onClick={toggleCollapse}
        aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
      >
        {isCollapsed ? '→' : '←'}
      </button>

      {/* 네비게이션 메뉴 아이템들 */}
      <div className={styles['nav-items']}>
        {/* 홈 메뉴 아이템 */}
        <div 
          className={styles['nav-item']} 
          onClick={() => router.push('/')}
        >
          <div className={styles.icon}>🏠</div>
          <span>홈</span>
        </div>

        {/* 회의 생성 메뉴 아이템 */}
        <div 
          className={styles['nav-item']} 
          onClick={() => router.push('/create')}
        >
          <div className={styles.icon}>🎙️</div>
          <span>회의 생성</span>
        </div>

        {/* 전체 회의록 메뉴 아이템 */}
        <div 
          className={styles['nav-item']}
          onClick={() => router.push('/meetings')}
        >
          <div className={styles.icon}>📋</div>
          <span>전체 회의록</span>
        </div>

        {/* 음성 녹음 메뉴 아이템 */}
        <div className={styles['nav-item']}>
          <div className={styles.icon}>🎤</div>
          <span>음성 녹음</span>
        </div>

        {/* 설정 메뉴 아이템 */}
        <div className={styles['nav-item']}>
          <div className={styles.icon}>⚙️</div>
          <span>설정</span>
        </div>
      </div>
    </nav>
  );
}; 