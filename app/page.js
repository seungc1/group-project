'use client';

import MeetingList from './components/MeetingList';

export default function Home() {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#F6F6F6'
    }}>
      <MeetingList />
    </div>
  );
} 