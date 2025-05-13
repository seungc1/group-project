/**
 * 회의록 목록 페이지 컴포넌트
 * - 저장된 모든 회의록을 목록 형태로 보여주는 페이지
 * - Header와 MeetingList 컴포넌트로 구성
 */

import styles from './meetings.module.css';
import Header from '../components/ui/layout/Header/index';
import MeetingList from '../components/features/Meeting/MeetingList';

/**
 * 회의록 목록 페이지 메인 컴포넌트
 * @returns {JSX.Element} 회의록 목록 페이지 UI
 */
export default function MeetingsPage() {
  return (
    <>
      {/* 페이지 헤더 컴포넌트 */}
      <Header title="회의록 목록" />
      {/* 회의록 목록 컴포넌트 */}
      <MeetingList />
    </>
  );
} 