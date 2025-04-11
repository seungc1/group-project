'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import styles from '../page.module.css';
import PageHeader from '@/components/PageHeader';

export default function MeetingsList() {
  const router = useRouter();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const q = query(collection(db, 'meetings'), orderBy('createAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const meetingsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMeetings(meetingsList);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  return (
    <div className={styles['examples-upcoming-web']}>
      <main className={styles['main-content']}>
        <PageHeader title="페이지 목록"/>

        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : (
          <div className={styles.meetingsList}>
            {meetings.map((meeting) => (
              <div key={meeting.id} className={styles.meetingItem}>
                <div className={styles.meetingContent}>
                  <h3>{meeting.title}</h3>
                  <p>참석자: {meeting.participantName.join(', ')}</p>
                  <p>참석자 수: {meeting.participants}명</p>
                  {meeting.textinfo && (
                    <p className={styles.summary}>
                      {meeting.textinfo.slice(0, 3).map(segment => segment.text).join(' ')}...
                    </p>
                  )}
                </div>
                <button 
                  className={styles.viewButton}
                  onClick={() => {
                    console.log('회의록 ID로 이동:', meeting.id);
                    const encodedId = encodeURIComponent(meeting.id);
                    router.push(`/meetings/${encodedId}`);
                  }}
                >
                  보기
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 