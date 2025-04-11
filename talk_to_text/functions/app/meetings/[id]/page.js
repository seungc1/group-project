'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../../page.module.css';
import Header from '../../components/Header';

export default function MeetingDetail({ params }) {
  const router = useRouter();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const decodedId = decodeURIComponent(params.id);
        console.log('회의록 ID:', decodedId);
        
        const docRef = doc(db, 'meetings', decodedId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setMeeting({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log('회의록을 찾을 수 없습니다:', decodedId);
        }
      } catch (error) {
        console.error('회의록을 가져오는 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [params.id]);

  if (loading) {
    return (
      <>
        <Header title="회의록 상세" />
        <div className={styles.loading}>로딩 중...</div>
      </>
    );
  }

  if (!meeting) {
    return (
      <>
        <Header title="회의록 상세" />
        <div className={styles.error}>회의록을 찾을 수 없습니다.</div>
      </>
    );
  }

  return (
    <>
      <Header title="회의록 상세" />
      <div className={styles['meeting-detail']}>
        <div className={styles['meeting-info']}>
          <h2>{meeting.title}</h2>
          <div className={styles['meeting-meta']}>
            <span>참석자: {meeting.participantName?.join(', ')}</span>
            <span>참석자 수: {meeting.participants}명</span>
            <span>생성일: {new Date(meeting.createAt?.toDate()).toLocaleString()}</span>
          </div>
        </div>

        <div className={styles['meeting-content']}>
          <div className={styles.section}>
            <h3>회의록</h3>
            <div className={styles.transcript}>
              {meeting.textinfo?.map((segment, index) => (
                <div key={index} className={styles.segment}>
                  <span className={styles.speaker}>{segment.speaker}:</span>
                  <span className={styles.text}>{segment.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h3>키워드</h3>
            <div className={styles.keywords}>
              {meeting.keywords?.map((keyword, index) => (
                <span key={index} className={styles.keyword}>{keyword}</span>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h3>요약</h3>
            <div className={styles.summary}>
              {meeting.summary}
            </div>
          </div>

          {meeting.summaryDownloadUrl && (
            <div className={styles.section}>
              <a 
                href={meeting.summaryDownloadUrl} 
                download
                className={styles.downloadButton}
              >
                요약 다운로드
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 