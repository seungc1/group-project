/**
 * 회의록 상세 페이지 컴포넌트
 * - 특정 회의록의 상세 내용을 보여주는 페이지
 * - 동적 라우팅을 통해 회의록 ID를 받아 처리
 * - Header와 MeetingDetail 컴포넌트로 구성
 */

import Header from '../../components/ui/layout/Header';
import MeetingDetail from '../../components/features/Meeting/MeetingDetail';

/**
 * 회의록 상세 페이지 메인 컴포넌트
 * @param {Object} params - 라우트 파라미터 객체
 * @param {string} params.id - 회의록 ID
 * @returns {JSX.Element} 회의록 상세 페이지 UI
 */
export default function MeetingDetailPage({ params }) {
  return (
    <>
      {/* 페이지 헤더 컴포넌트 */}
      <Header title="회의록 상세" />
      {/* 회의록 상세 정보 컴포넌트 */}
      <MeetingDetail id={params.id} />
    </>
  );
}