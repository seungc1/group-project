/**
 * 회의 상세 정보를 표시하는 컴포넌트
 * @param {string} id - 회의록 ID
 */
'use client';

// React 훅과 라우터 임포트
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Firebase 관련 임포트
import { db } from '@/lib/firebase';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';

// 스타일과 하위 컴포넌트 임포트
import styles from './styles.module.css';
import MeetingHeader from './MeetingHeader';
import MeetingSummary from './MeetingSummary';
import MeetingKeywords from './MeetingKeywords';
import MeetingTranscript from './MeetingTranscript';
import MeetingAudio from './MeetingAudio';
import MeetingError from './MeetingError';

export default function MeetingDetail({ id }) {
  // 라우터 인스턴스 생성
  const router = useRouter();
  // 회의 데이터와 로딩 상태를 관리하는 상태 변수
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  // 회의 데이터를 가져오는 useEffect
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        // URL 인코딩된 ID를 디코딩
        const decodedId = decodeURIComponent(id);
        console.log('원본 ID:', id);
        console.log('디코딩된 ID:', decodedId);

        // ID 유효성 검사
        if (!decodedId || decodedId === 'undefined') {
          console.error('유효하지 않은 회의록 ID');
          setMeeting(null);
          setLoading(false);
          return;
        }

        // Firestore에서 문서 참조 생성
        const docRef = doc(db, 'meetings', decodedId);
        console.log('문서 참조:', docRef);

        // 문서 데이터 가져오기
        const docSnap = await getDoc(docRef);
        console.log('문서 존재 여부:', docSnap.exists());

        if (docSnap.exists()) {
          // 문서가 존재하는 경우 데이터 설정
          const meetingData = docSnap.data();
          console.log('회의 데이터:', meetingData);
          setMeeting({ id: docSnap.id, ...meetingData });
        } else {
          console.error('회의록을 찾을 수 없습니다. ID:', decodedId);

          try {
            // 직접 쿼리를 통한 대체 검색
            console.log('직접 쿼리 시도...');
            const q = query(collection(db, 'meetings'), where('title', '==', decodedId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              // 쿼리 결과가 있는 경우 데이터 설정
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

  // 로딩 중일 때 표시
  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  // 회의 데이터가 없는 경우 에러 컴포넌트 표시
  if (!meeting) {
    return <MeetingError id={id} />;
  }

  // 회의 상세 정보 렌더링
  return (
    <div className={styles.meetingDetail}>
      <MeetingHeader meeting={meeting} />
      <MeetingSummary meeting={meeting} />
      <MeetingKeywords meeting={meeting} />
      <MeetingTranscript meeting={meeting} />
      <MeetingAudio meeting={meeting} />
    </div>
  );
} 