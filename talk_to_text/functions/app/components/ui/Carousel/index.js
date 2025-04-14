/**
 * 캐러셀 UI 컴포넌트
 * - 여러 항목을 슬라이드 형태로 표시
 * - 현재는 기본 구조만 구현되어 있으며, 실제 슬라이드 기능은 추후 구현 예정
 */
'use client';

// 컴포넌트 스타일 임포트
import styles from './styles.module.css';

export default function Carousel() {
  // 캐러셀 UI 렌더링
  return (
    <section className={styles.carousel}>
      {/* 캐러셀 아이템 1 */}
      <div className={styles['carousel-item']}></div>
      
      {/* 캐러셀 아이템 2 */}
      <div className={styles['carousel-item']}></div>
      
      {/* 캐러셀 아이템 3 */}
      <div className={styles['carousel-item']}></div>
      
      {/* 캐러셀 아이템 4 */}
      <div className={styles['carousel-item']}></div>
    </section>
  );
} 