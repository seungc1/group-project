"use client";
import MeetingForm from '@/components/features/Meeting/MeetingForm';
import { useParams } from 'next/navigation';

export default function MeetingCreatePage() {
  const { projectId } = useParams();

  // MeetingForm에 projectId를 prop으로 전달 (필요시 내부에서 활용)
  return (
    <main style={{ padding: 32 }}>
      <h1>회의 생성</h1>
      <MeetingForm projectId={projectId} />
    </main>
  );
} 