/**
 * 전체 프로젝트 페이지 컴포넌트
 * - 저장된 모든 프로젝트를 목록 형태로 보여주는 페이지
 * - Header와 MeetingList 컴포넌트로 구성
 */

import styles from './meetings.module.css';
import Header from '../components/ui/layout/Header/index';
import MeetingList from '../components/features/Meeting/MeetingList';

/**
 * 전체 프로젝트 페이지 메인 컴포넌트
 * @returns {JSX.Element} 전체 프로젝트 페이지 UI
 */
export default function MeetingsPage() {
  return (
    <>
      {/* 페이지 헤더 컴포넌트 */}
      <Header title="전체 프로젝트" />
      {/* 전체 프로젝트 컴포넌트 */}
      <MeetingList />
    </>
  );
} 