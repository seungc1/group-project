import { Suspense } from 'react';
import Header from '../components/ui/layout/Header/index';
import MeetingList from '../components/features/Meeting/MeetingList';

export default function ProjectsPage() {
  return (
    <>
      <Header title="전체 프로젝트" />
      <Suspense fallback={<div>로딩 중…</div>}>
        <MeetingList />
      </Suspense>
    </>
  );
}