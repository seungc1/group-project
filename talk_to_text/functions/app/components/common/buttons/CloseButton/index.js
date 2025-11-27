'use client';

import { useRouter } from 'next/navigation';

/**
 * 재사용 가능한 닫기 버튼 컴포넌트
 * - 클릭 시 이전 페이지로 이동
 * - ✖️ 이모지 버튼
 */
export default function CloseButton({ size = 24 }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      style={{
        fontSize: size,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#333',
        lineHeight: 1,
        padding: 0,
      }}
      aria-label="닫기"
    >
      ✖️
    </button>
  );
}
