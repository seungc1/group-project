'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getMeetings, getAllMeetings } from '@/app/lib/meetingsService';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

export default function Calendar({ projectId }) {
  const { user } = useAuth();
  const router = useRouter();
  const [meetings, setMeetings] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (user) {
      loadMeetings();
    }
  }, [user, projectId]);

  const loadMeetings = async () => {
    try {
      let meetingsData = [];
      if (user && projectId) {
        meetingsData = await getMeetings(user.uid, projectId);
      } else if (user) {
        meetingsData = await getAllMeetings(user.uid);
      }
      setMeetings(meetingsData);
    } catch (error) {
      console.error('회의 데이터 로딩 실패:', error);
    }
  };

  useEffect(() => {
    console.log('전체 meetings:', meetings);
  }, [meetings]);

  // 날짜가 같은지 비교하는 함수 (로컬 타임존 기준)
  const isSameDay = (d1, d2) =>
    d1 && d2 &&
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // meetingDate를 Date 객체로 변환 (Timestamp 또는 문자열 모두 지원)
  const getMeetingDateObj = (meeting) => {
    const d = meeting.meetingDate;
    if (!d) return null;
    if (typeof d === 'string') return new Date(d);
    if (d.seconds) return new Date(d.seconds * 1000);
    return new Date(d);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // 이전 달의 날짜들
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift(prevDate);
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // 다음 달의 날짜들
    const remainingDays = 42 - days.length; // 6주 * 7일 = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDateClick = (date) => {
    if (
      date.getFullYear() === 2025 &&
      date.getMonth() === 5 && // 0-indexed, 5=6월
      date.getDate() === 9
    ) {
      console.log('6월 9일 클릭됨', date);
    }
    setSelectedDate(date);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button onClick={handlePrevMonth}>&lt;</button>
        <h2>{formatDate(currentDate)}</h2>
        <button onClick={handleNextMonth}>&gt;</button>
      </div>

      <div className={styles.weekDays}>
        {weekDays.map(day => (
          <div key={day} className={styles.weekDay}>{day}</div>
        ))}
      </div>

      <div className={styles.days}>
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          
          const dayMeetings = meetings.filter(meeting => {
            const meetingDate = getMeetingDateObj(meeting);
            return meetingDate && meetingDate.toDateString() === date.toDateString();
          });

          return (
            <div
              key={index}
              className={`${styles.day} ${!isCurrentMonth ? styles.otherMonth : ''} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleDateClick(date)}
            >
              <span className={styles.dateNumber}>{date.getDate()}</span>
              {dayMeetings.length > 0 && (
                <div className={styles.meetingDot} />
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && (() => {
        console.log('전체 meetings:', meetings);
        const meetingsForDate = meetings.filter(meeting => {
          const meetingDate = getMeetingDateObj(meeting);
          return meetingDate && isSameDay(meetingDate, selectedDate);
        });
        console.log('selectedDate:', selectedDate, 'meetingsForDate:', meetingsForDate);
        return (
          <div className={styles.meetingList}>
            <h3>
              {selectedDate.getFullYear()}.{selectedDate.getMonth() + 1}.{selectedDate.getDate()} 회의
            </h3>
            {meetingsForDate.map(meeting => {
              const meetingDate = getMeetingDateObj(meeting);
              return (
                <div
                  key={meeting.id}
                  className={styles.meetingItem}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (meeting.projectId) {
                      router.push(`/projects/${meeting.projectId}/meetings/${meeting.id}`);
                    } else {
                      router.push(`/meetings/${meeting.id}`);
                    }
                  }}
                >
                  <span>{meeting.title}</span>
                  {/*
                  <span style={{ color: '#888', fontSize: '0.9em', marginLeft: 8 }}>
                    {meetingDate ? meetingDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  */}
                </div>
              );
            })}
            {meetingsForDate.length === 0 && (
              <div className={styles.meetingItem} style={{ color: '#aaa' }}>회의 없음</div>
            )}
          </div>
        );
      })()}
    </div>
  );
} 