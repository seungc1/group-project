/**
 * 페이지 헤더 컴포넌트
 * - 페이지 제목과 액션 버튼들을 포함
 * - actions props로 커스텀 액션(메뉴 등) 전달 가능
 * @param {string} title - 헤더에 표시될 제목
 * @param {ReactNode} actions - 헤더 우측에 표시될 커스텀 액션 JSX
 */
'use client';

// 컴포넌트 스타일 임포트
import styles from './styles.module.css';

export default function Header({ title, actions }) {
  // 헤더 UI 렌더링
  return (
    <header className={styles.header}>
      {/* 페이지 제목 */}
      <h1>{title}</h1>
      
      {/* 헤더 액션 버튼들 */}
      <div className={styles['header-actions']}>
        {actions}
        {/* 파일 첨부 버튼 }
        {/*<button className={styles['icon-button']}>📎</button>
        
        {/* 캘린더 버튼 }
        <button className={styles['icon-button']}>📅</button>
        
        {/* 추가 메뉴 버튼 }
        <button className={styles['icon-button']}>⋮</button>*/}
      </div>
    </header>
  );
}