/**
 * 페이지 헤더 컴포넌트
 * - 페이지 제목과 액션 버튼들을 포함
 * - 현재는 기본적인 UI만 구현되어 있으며, 버튼 기능은 추후 구현 예정
 * @param {string} title - 헤더에 표시될 제목
 */
'use client';

// 컴포넌트 스타일 임포트
import styles from './styles.module.css';

export default function Header({ title }) {
  // 헤더 UI 렌더링
  return (
    <header className={styles.header}>
      {/* 페이지 제목 */}
      <h1>{title}</h1>
      
      {/* 헤더 액션 버튼들 */}
      <div className={styles['header-actions']}>
        {/* 파일 첨부 버튼 */}
        <button className={styles['icon-button']}>📎</button>
        
        {/* 캘린더 버튼 */}
        <button className={styles['icon-button']}>📅</button>
        
        {/* 추가 메뉴 버튼 */}
        <button className={styles['icon-button']}>⋮</button>
      </div>
    </header>
  );
} 