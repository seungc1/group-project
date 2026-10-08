/**
 * 레이아웃 래퍼 컴포넌트
 * - 사이드바와 메인 콘텐츠를 함께 관리하는 컨테이너
 * - 사이드바 상태를 관리하고 하위 컴포넌트에 전달
 * - NavigationRail과 ClientLayout을 조합하여 전체 레이아웃 구성
 */

'use client';

// React 훅 임포트
import { useState } from 'react';
// 필요한 컴포넌트들 임포트
import { NavigationRail } from '../ui/navigation/NavigationRail';
import ClientLayout from './ClientLayout';

/**
 * 레이아웃 래퍼 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 컴포넌트들
 * @returns {JSX.Element} 사이드바와 메인 콘텐츠를 포함하는 레이아웃
 */
export default function LayoutWrapper({ children }) {
  // 사이드바의 접힘/펼침 상태 관리
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* 
        네비게이션 레일 컴포넌트
        - 사이드바 상태와 상태 변경 함수를 props로 전달
      */}
      <NavigationRail 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />
      {/* 
        클라이언트 레이아웃 컴포넌트
        - 사이드바 상태를 props로 전달
        - 자식 컴포넌트들을 렌더링
      */}
      <ClientLayout isCollapsed={isCollapsed}>
        {children}
      </ClientLayout>
    </>
  );
} 