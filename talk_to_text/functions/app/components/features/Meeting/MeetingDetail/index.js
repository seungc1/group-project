'use client';

/**
 * 회의록 상세 정보를 표시하는 컴포넌트
 * @param {string} id - 회의록 ID
 * @param {string} projectId - 프로젝트 ID
 */
import { getMeetingDetail } from '@/lib/meetingsService';
import { useAuth } from '@/app/context/AuthContext';
import MeetingHeader from './MeetingHeader';
import MeetingSummary from './MeetingSummary';
import MeetingKeywords from './MeetingKeywords';
import MeetingTranscript from './MeetingTranscript';
import MeetingAudio from './MeetingAudio';
import MeetingError from './MeetingError';
import styles from './styles.module.css';
import { useState, useEffect } from 'react';
import DownloadButton from './DownloadButton';
import EditSummaryButton from './EditSummaryButton';

export default function MeetingDetail({ id, projectId }) {
  const { user } = useAuth();
  const [meeting, setMeeting] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!user || !id || !projectId) return;

      try {
        const meetingData = await getMeetingDetail(user.uid, projectId, id);
        setMeeting(meetingData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [user, id, projectId]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <MeetingError message={error} />;
  if (!meeting) return <MeetingError message="회의를 찾을 수 없습니다." />;

  return (
    <div className={styles.meetingContent}>
      <MeetingHeader meeting={meeting} />      
      <MeetingSummary meeting={meeting} />
      <MeetingKeywords meeting={meeting} />
      <MeetingTranscript meeting={meeting} />
      <MeetingAudio meeting={meeting} />
    </div>
  );
}