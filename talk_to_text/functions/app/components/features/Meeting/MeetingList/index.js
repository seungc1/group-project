/**
 * 회의록 목록을 표시하는 컴포넌트
 * - 회의록 데이터를 가져와서 목록으로 표시
 * - 각 회의록 항목 클릭 시 상세 페이지로 이동
 * - 로딩 상태와 빈 목록 상태 처리
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

export default function MeetingList() {
  const router = useRouter();
  const [meetings, setMeetings] = useState([]); // 회의록 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태

  // 회의록 데이터 가져오기
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch('/api/meetings');
        const data = await response.json();
        setMeetings(data);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  /**
   * 날짜를 한국어 형식으로 포맷팅하는 함수
   * @param {Date|number|string} date - 변환할 날짜 데이터
   * @returns {string} 포맷팅된 날짜 문자열 (YYYY.MM.DD)
   */
  const formatDate = (date) => {
    if (!date) return '날짜 정보 없음';
    
    try {
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };

      // Firestore Timestamp 객체인 경우
      if (typeof date === 'object' && date.seconds) {
        return new Date(date.seconds * 1000)
          .toLocaleDateString('ko-KR', options)
          .replace(/\. /g, '.');
      }
      
      // 일반 타임스탬프(숫자)인 경우
      if (typeof date === 'number') {
        return new Date(date)
          .toLocaleDateString('ko-KR', options)
          .replace(/\. /g, '.');
      }

      // ISO 문자열인 경우
      if (typeof date === 'string') {
        return new Date(date)
          .toLocaleDateString('ko-KR', options)
          .replace(/\. /g, '.');
      }

      return '날짜 형식 오류';
    } catch (error) {
      console.error('Date formatting error:', error);
      return '날짜 형식 오류';
    }
  };

  // 로딩 중이거나 데이터가 없는 경우 처리
  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (!meetings.length) return <div className={styles.empty}>등록된 회의가 없습니다.</div>;

  return (
    <div className={styles['meeting-list']}>
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          className={styles['meeting-item']}
          onClick={() => router.push(`/meetings/${meeting.id}`)}
        >
          <h3>{meeting.title}</h3>
          <p>참석자: {meeting.participants}명</p>
          <p>생성일: {formatDate(meeting.createAt)}</p>
        </div>
      ))}
    </div>
  );
}