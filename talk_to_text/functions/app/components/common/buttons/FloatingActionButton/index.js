/**
 * FloatingActionButton 컴포넌트
 * 
 * @description
 * 회의록 생성 페이지로 이동하는 플로팅 액션 버튼입니다.
 * 화면 하단에 고정되어 표시되며, 클릭 시 회의록 생성 페이지로 이동합니다.
 * 
 * @example
 * <FloatingActionButton />
 * 
 * @returns {JSX.Element} 플로팅 액션 버튼 컴포넌트
 */

'use client';

import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

export default function FloatingActionButton() {
  const router = useRouter();

  // 회의록 생성 페이지로 이동하는 핸들러 함수
  const handleClick = () => {
    router.push('/create');
  };

  return (
    <button className={styles.fab} onClick={handleClick}>
      +
    </button>
  );
}