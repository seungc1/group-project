'use client';

/**
 * 회의록 상세 정보를 표시하는 컴포넌트
 * @param {string} id - 회의록 ID
 * @param {string} projectId - 프로젝트 ID
 */
import { getMeetingDetail, markCalendarLogAsSynced } from '@/lib/meetingsService';
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
import { addEventToGoogleCalendar } from '@/lib/googleCalendar';

export default function MeetingDetail({ id, projectId, page }) {
  const { user, accessToken } = useAuth();
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

  useEffect(() => {
    if (!user || !meeting || !meeting.calendar_logs || !accessToken) return;

    const syncCalendarEvents = async () => {
      for (const log of meeting.calendar_logs) {
        if (log.synced) continue;

        try {
          const event = {
            title: log.summary || '회의 일정',
            description: '회의록에서 자동 등록된 일정입니다.',
            start: log.start,
            end: log.end,
          };

          await addEventToGoogleCalendar(accessToken, event);

          // ✅ Firestore에 synced: true로 저장
          if (log.logId) {
            await markCalendarLogAsSynced(user.uid, projectId, id, log.logId);
          }

          console.log('✅ 캘린더 등록 완료:', event.title);
        } catch (err) {
          console.error('❌ 캘린더 등록 실패:', err);
        }
      }
    };

    syncCalendarEvents();
  }, [user, meeting, accessToken]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <MeetingError message={error} />;
  if (!meeting) return <MeetingError message="회의를 찾을 수 없습니다." />;

  return (
    <div className={styles.meetingContent}>
      <MeetingHeader meeting={meeting} page={page} />
      <MeetingSummary meeting={meeting} />
      <MeetingKeywords meeting={meeting} />
      <MeetingTranscript meeting={meeting} />
      <MeetingAudio meeting={meeting} />
    </div>
  );
}


// 'use client';

// /**
//  * 회의록 상세 정보를 표시하는 컴포넌트
//  * @param {string} id - 회의록 ID
//  * @param {string} projectId - 프로젝트 ID
//  */
// import { getMeetingDetail } from '@/lib/meetingsService';
// import { useAuth } from '@/app/context/AuthContext';
// import MeetingHeader from './MeetingHeader';
// import MeetingSummary from './MeetingSummary';
// import MeetingKeywords from './MeetingKeywords';
// import MeetingTranscript from './MeetingTranscript';
// import MeetingAudio from './MeetingAudio';
// import MeetingError from './MeetingError';
// import styles from './styles.module.css';
// import { useState, useEffect } from 'react';
// import DownloadButton from './DownloadButton';
// import EditSummaryButton from './EditSummaryButton';
// import { addEventToGoogleCalendar } from '@/utils/googleCalendar';

// export default function MeetingDetail({ id, projectId, page }) {
//   const { user } = useAuth();
//   const [meeting, setMeeting] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchMeeting = async () => {
//       if (!user || !id || !projectId) return;

//       try {
//         const meetingData = await getMeetingDetail(user.uid, projectId, id);
//         setMeeting(meetingData);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMeeting();
//   }, [user, id, projectId]);

//   if (loading) return <div>로딩 중...</div>;
//   if (error) return <MeetingError message={error} />;
//   if (!meeting) return <MeetingError message="회의를 찾을 수 없습니다." />;

//   return (
//     <div className={styles.meetingContent}>
//       <MeetingHeader meeting={meeting} page={page} />
//       <MeetingSummary meeting={meeting} />
//       <MeetingKeywords meeting={meeting} />
//       <MeetingTranscript meeting={meeting} />
//       <MeetingAudio meeting={meeting} />
//     </div>
//   );
// }