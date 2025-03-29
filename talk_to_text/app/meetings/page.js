'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import styles from './meetings.module.css';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        console.log('Fetching all meetings...');
        const meetingsCollection = collection(db, 'meetings');
        const meetingsSnapshot = await getDocs(meetingsCollection);
        
        console.log('Total number of meetings:', meetingsSnapshot.size);
        
        const meetingsData = meetingsSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Meeting ID:', doc.id);
          console.log('Meeting data:', data);
          
          return {
            id: doc.id,
            title: data.title || '제목 없음',
            createdAt: data.createAt?.toDate?.()?.toLocaleDateString() || '날짜 없음',
            participants: data.participants || 0,
            participantName: data.participantName || [],
            audioUrl: data.audioUrl || null,
            textinfo: data.textinfo || [],
            isExpanded: false
          };
        });

        // 날짜순 정렬 (최신순)
        meetingsData.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA;
        });

        console.log('Total meetings loaded:', meetingsData.length);
        setMeetings(meetingsData);
      } catch (error) {
        console.error('Error fetching meetings:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const handleMeetingClick = (meetingId) => {
    setMeetings(meetings.map(meeting => ({
      ...meeting,
      isExpanded: meeting.id === meetingId ? !meeting.isExpanded : false
    })));
  };

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>에러가 발생했습니다: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>회의록 목록</h1>
      <div className={styles.meetingCount}>
        총 {meetings.length}개의 회의록이 있습니다.
      </div>
      {meetings.length === 0 ? (
        <div className={styles.noMeetings}>등록된 회의록이 없습니다.</div>
      ) : (
        <div className={styles.meetingsList}>
          {meetings.map((meeting) => (
            <div 
              key={meeting.id} 
              className={`${styles.meetingCard} ${meeting.isExpanded ? styles.expanded : ''}`}
              onClick={() => handleMeetingClick(meeting.id)}
            >
              <h2 className={styles.meetingTitle}>{meeting.title}</h2>
              <div className={styles.meetingInfo}>
                <p>날짜: {meeting.createdAt}</p>
                <p>참석자 수: {meeting.participants}명</p>
                <p>참석자: {meeting.participantName.length > 0 ? meeting.participantName.join(', ') : '참석자 정보 없음'}</p>
                {meeting.audioUrl && (
                  <div className={styles.audioSection}>
                    <h3>회의 음성</h3>
                    <audio controls className={styles.audioPlayer}>
                      <source src={meeting.audioUrl} type="audio/mpeg" />
                      브라우저가 오디오 재생을 지원하지 않습니다.
                    </audio>
                  </div>
                )}
                {meeting.isExpanded && meeting.textinfo && meeting.textinfo.length > 0 && (
                  <div className={styles.textInfo}>
                    <h3>회의 내용</h3>
                    <div className={styles.transcript}>
                      {meeting.textinfo.map((segment, index) => (
                        <div key={index} className={styles.transcriptSegment}>
                          <span className={styles.speaker}>{segment.speaker}:</span>
                          <span className={styles.text}>{segment.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 