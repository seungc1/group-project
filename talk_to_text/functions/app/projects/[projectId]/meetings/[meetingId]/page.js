'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Header from '@/components/ui/layout/Header';
import MeetingDetail from '@/components/features/Meeting/MeetingDetail';

export default function MeetingDetailPage() {
  const { projectId, meetingId } = useParams();
  const searchParams = useSearchParams();
  const page = searchParams.get('page');

  return (
    <>
      <Header title="회의록 상세" />
      <MeetingDetail id={meetingId} projectId={projectId} page={page} />
    </>
  );
} 