/**
 * 메인 홈페이지 컴포넌트
 * - 애플리케이션의 메인 페이지
 * - 캐러셀, 최근 회의록, 플로팅 액션 버튼 등으로 구성
 */

// 필요한 컴포넌트 임포트
import Header from './components/ui/layout/Header';
import Carousel from './components/ui/Carousel';
import RecentMeetings from './components/features/Meeting/RecentMeetings';
import FloatingActionButton from './components/common/buttons/FloatingActionButton';

/**
 * 홈페이지 메인 컴포넌트
 * @returns {JSX.Element} 홈페이지 UI
 */
export default function Home() {
  return (
    <>
      {/* 페이지 헤더 컴포넌트 */}
      <Header title="홈" />
      {/* 메인 캐러셀 컴포넌트 */}
      <Carousel />
      {/* 최근 회의록 목록 컴포넌트 */}
      <RecentMeetings />
      {/* 플로팅 액션 버튼 컴포넌트 */}
      <FloatingActionButton />
    </>
  );
}