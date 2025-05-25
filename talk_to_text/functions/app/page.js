/**
 * 메인 홈페이지 컴포넌트
 * - 애플리케이션의 메인 페이지
 * - 캐러셀, 최근 회의록, 플로팅 액션 버튼 등으로 구성
 */

'use client';

import Header from './components/ui/layout/Header';
import Carousel from './components/ui/Carousel';
import RecentMeetings from './components/features/Meeting/RecentMeetings';
import FloatingActionButton from './components/common/buttons/FloatingActionButton';
import withAuthRedirect from './components/common/withAuthRedirect';
/**
 * 홈페이지 메인 컴포넌트
 * @returns {JSX.Element} 홈페이지 UI
 */
function Home() {
  return (
    <>
      <Header title="홈" />
      <Carousel />
      <RecentMeetings />
      <FloatingActionButton />
    </>
  );
}
export default withAuthRedirect(Home);
// 지금은 홈페이지 접속하면 홈 화면이 나오는데 -> 사용자가 로그인 하기 전이면, 홈 화면이가 아닌 로그인 페이지가 나오게 수정

// export default function Home() {
//   return (
//     <>
//       {/* 페이지 헤더 컴포넌트 */}
//       <Header title="홈" />
//       {/* 메인 캐러셀 컴포넌트 */}
//       <Carousel />
//       {/* 최근 회의록 목록 컴포넌트 */}
//       <RecentMeetings />
//       {/* 플로팅 액션 버튼 컴포넌트 */}
//       <FloatingActionButton />
//     </>
//   );
// }
