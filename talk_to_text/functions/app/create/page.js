/**
 * 회의록 생성 페이지 컴포넌트
 * - 회의록 생성을 위한 폼을 포함하는 페이지
 * - Header와 MeetingForm 컴포넌트로 구성
 */

import Header from '../components/ui/layout/Header';
import MeetingForm from '../components/features/Meeting/MeetingForm';

/**
 * 회의록 생성 페이지 메인 컴포넌트
 * @returns {JSX.Element} 회의록 생성 페이지 UI
 */
export default function CreateMeeting() {
  return (
    <>
      {/* 페이지 헤더 컴포넌트 */}
      <Header title="회의록 생성" />
      {/* 회의록 생성 폼 컴포넌트 */}
      <MeetingForm />
    </>
  );
}