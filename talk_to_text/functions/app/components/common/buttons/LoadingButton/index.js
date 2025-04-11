/**
 * 로딩 상태를 표시할 수 있는 버튼 컴포넌트
 * @param {Function} onClick - 버튼 클릭 시 실행될 함수
 * @param {boolean} loading - 로딩 상태 여부
 * @param {string} text - 일반 상태일 때 표시될 텍스트
 * @param {string} loadingText - 로딩 상태일 때 표시될 텍스트
 */
'use client';

import styles from './styles.module.css';

export default function LoadingButton({ onClick, loading, text, loadingText }) {
  return (
    <button 
      className={styles.button}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? loadingText : text}
    </button>
  );
} 