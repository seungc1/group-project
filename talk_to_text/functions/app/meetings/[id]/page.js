'use client';

import CalendarModal from '@/components/calendarModal';
import { addToCalendar } from '@/lib/addToCalendar';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import styles from '../../page.module.css';
import PageHeader from '@/components/pageHeader';

export default function MeetingDetail({ params }) {
  const [modalInfo, setModalInfo] = useState({ visible: false, url: '' });
  const router = useRouter();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = params;

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        // URL 디코딩 적용
        const decodedId = decodeURIComponent(id);
        console.log('원본 ID:', id);
        console.log('디코딩된 ID:', decodedId);

        // ID가 유효한지 확인
        if (!decodedId || decodedId === 'undefined') {
          console.error('유효하지 않은 회의록 ID');
          setMeeting(null);
          setLoading(false);
          return;
        }

        const docRef = doc(db, 'meetings', decodedId);
        console.log('문서 참조:', docRef);

        const docSnap = await getDoc(docRef);
        console.log('문서 존재 여부:', docSnap.exists());

        if (docSnap.exists()) {
          const meetingData = docSnap.data();
          console.log('회의 데이터:', meetingData);
          setMeeting({ id: docSnap.id, ...meetingData });
        } else {
          console.error('회의록을 찾을 수 없습니다. ID:', decodedId);

          // ID가 URL 인코딩된 형태인 경우 직접 쿼리 시도
          try {
            console.log('직접 쿼리 시도...');
            const q = query(collection(db, 'meetings'), where('title', '==', decodedId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const doc = querySnapshot.docs[0];
              const meetingData = doc.data();
              console.log('직접 쿼리로 찾은 회의 데이터:', meetingData);
              setMeeting({ id: doc.id, ...meetingData });
            } else {
              setMeeting(null);
            }
          } catch (queryError) {
            console.error('직접 쿼리 오류:', queryError);
            setMeeting(null);
          }
        }
      } catch (error) {
        console.error('Error fetching meeting:', error);
        setMeeting(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [id]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '날짜 정보 없음';
    const date = timestamp.toDate();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className={styles['examples-upcoming-web']}>
      <main className={styles['main-content']}>
        <PageHeader title="회의록 상세" />
        
        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : meeting ? (
          <div className={styles.meetingDetail}>
            <div className={styles.meetingHeader}>
              <div className={styles.headerTop}>
                <h2>{meeting.title}</h2>
                <button
                  className={styles['icon-button']}
                  onClick={() => router.push('/meetings')}
                >
                  ✖️
                </button>
              </div>
              <div className={styles.meetingMeta}>
                <p>생성일: {formatDate(meeting.createAt)}</p>
                <p>참석자: {meeting.participantName ? meeting.participantName.join(', ') : '정보 없음'}</p>
                <p>참석자 수: {meeting.participants || 0}명</p>
              </div>
            </div>

            {meeting.summary ? (
              <div className={styles.summarySection}>
                <h3>회의 요약</h3>
                <div className={styles.summaryContent}>
                  {typeof meeting.summary === 'string'
                    ? meeting.summary
                    : JSON.stringify(meeting.summary)}
                </div>

                {meeting.summaryDownloadUrl && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <a
                      href={meeting.summaryDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.downloadLink}
                    >
                      요약 다운로드
                    </a>

                    <button
                      className={`${styles.downloadLink} ${styles.noOutline}`}
                      onClick={async () => {
                        const start = meeting.createAt?.toDate?.() ?? new Date();
                        const end = new Date(start.getTime() + 60 * 60 * 1000); // 1시간 후

                        const calendarUrl = await addToCalendar({
                          title: meeting.title,
                          startTime: start,
                          endTime: end,
                        });

                        setModalInfo({ visible: true, url: calendarUrl });
                      }}
                    >
                      일정 추가
                    </button>
                  </div>
                )}

              </div>
            ) : (
              <div className={styles.summarySection}>
                <h3>회의 요약</h3>
                <div className={styles.summaryContent}>
                  요약 데이터가 없습니다.
                </div>
              </div>
            )}

            {meeting.keywords && meeting.keywords.length > 0 && (
              <div className={styles.keywordsSection}>
                <h3>주요 키워드</h3>
                <div className={styles.keywordsList}>
                  {meeting.keywords.map((keyword, index) => (
                    <span key={index} className={styles.keyword}>{keyword}</span>
                  ))}
                </div>
              </div>
            )}

            {meeting.textinfo && meeting.textinfo.length > 0 && (
              <div className={styles.transcriptSection}>
                <h3>회의 내용</h3>
                <div className={styles.transcriptContent}>
                  {meeting.textinfo.map((segment, index) => (
                    <div key={index} className={styles.transcriptSegment}>
                      <div className={styles.speaker}>{segment.speaker}</div>
                      <div className={styles.text}>{segment.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {meeting.audioUrl && (
              <div className={styles.audioSection}>
                <h3>원본 음성</h3>
                <audio controls className={styles.audioPlayer}>
                  <source src={meeting.audioUrl} type="audio/mpeg" />
                  브라우저가 오디오 재생을 지원하지 않습니다.
                </audio>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.error}>
            <h2>회의록을 찾을 수 없습니다</h2>
            <p>요청하신 회의록 ID: {decodeURIComponent(id)}</p>
            <p>다음 사항을 확인해주세요:</p>
            <ul>
              <li>회의록 ID가 올바른지 확인</li>
              <li>Firebase 데이터베이스에 해당 회의록이 존재하는지 확인</li>
              <li>인터넷 연결 상태 확인</li>
              <li>브라우저 콘솔에서 오류 메시지 확인</li>
            </ul>
            <div style={{ marginTop: '20px' }}>
              <button
                className={styles.downloadLink}
                onClick={() => router.push('/meetings')}
                style={{ marginRight: '10px' }}
              >
                회의록 목록으로 돌아가기
              </button>
              <button
                className={styles.downloadLink}
                onClick={() => router.push('/create')}
                style={{ background: '#4CAF50' }}
              >
                새 회의록 만들기
              </button>
            </div>
          </div>
        )}
      </main>
      <CalendarModal
        visible={modalInfo.visible}
        url={modalInfo.url}
        onClose={() => setModalInfo({ visible: false, url: '' })}
      />

    </div>
  );
} 