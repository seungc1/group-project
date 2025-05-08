/**
 * 회의록 상세 페이지 컴포넌트
 * - 특정 회의록의 상세 내용을 보여주는 페이지
 * - 동적 라우팅을 통해 회의록 ID를 받아 처리
 * - Header와 MeetingDetail 컴포넌트로 구성
 */

'use client';

import { useParams } from 'next/navigation';
import Header from '@/components/ui/layout/Header';
import MeetingDetail from '@/components/features/Meeting/MeetingDetail';

/**
 * 회의록 상세 페이지 메인 컴포넌트
 * @returns {JSX.Element} 회의록 상세 페이지 UI
 */
export default function MeetingDetailPage() {
  const { id, projectId } = useParams();

  return (
    <>
      {/* 페이지 헤더 컴포넌트 */}
      <Header title="회의록 상세" />
      {/* 회의록 상세 정보 컴포넌트 */}
      <MeetingDetail id={id} projectId={projectId} />
    </>
  );
}