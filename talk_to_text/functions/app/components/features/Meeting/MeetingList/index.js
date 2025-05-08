'use client';

/**
 * MeetingList 컴포넌트
 * - 회의 목록을 표시하는 컴포넌트
 * - 로딩, 에러, 빈 목록 상태 처리
 */
import { getMeetings } from '@/lib/meetingsService';
import MeetingListItem from './MeetingListItem';
import styles from './styles.module.css';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export default function MeetingList() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMeetings = async () => {
      if (user) {
        try {
          const meetingsList = await getMeetings(user.uid);
          setMeetings(meetingsList);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMeetings();
  }, [user]);

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>에러 발생: {error}</div>;
  }

  if (meetings.length === 0) {
    return <div className={styles.empty}>회의가 없습니다.</div>;
  }

  return (
    <div className={styles.meetingList}>
      {meetings.map(meeting => (
        <MeetingListItem key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
} 