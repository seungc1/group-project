/**
 * 클라이언트 사이드 레이아웃 컴포넌트
 * - 메인 콘텐츠 영역을 감싸는 컨테이너
 * - 사이드바 상태에 따라 메인 콘텐츠의 너비를 동적으로 조정
 */

'use client';

// 스타일시트 임포트
import styles from '../../page.module.css';

/**
 * 클라이언트 레이아웃 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 컴포넌트들
 * @param {boolean} props.isCollapsed - 사이드바의 접힘/펼침 상태
 * @returns {JSX.Element} 메인 콘텐츠를 감싸는 레이아웃 컨테이너
 */
export default function ClientLayout({ children, isCollapsed }) {
  return (
    // 메인 컨테이너
    <div className={styles.container}>
      {/* 
        메인 콘텐츠 영역
        - 사이드바 상태에 따라 동적으로 클래스 변경
        - isCollapsed가 true일 때 sidebarCollapsed 클래스 적용
      */}
      <div className={`${styles.mainContent} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
        {children}
      </div>
    </div>
  );
} 