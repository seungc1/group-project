// 전체 북마크 페이지
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useBookmarks } from '@/app/hooks/useBookmarks';
import { getMeetingDetail, getProject } from '@/lib/meetingsService';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';
import Header from '@/components/ui/layout/Header';

export default function BookmarksPage() {
  const { user } = useAuth();
  const { bookmarkedMeetings } = useBookmarks(user);
  const [bookmarkedList, setBookmarkedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const bookmarkMap = useMemo(() => {
    const map = new Map();
    bookmarkedMeetings.forEach(b => {
      map.set(b.meetingId, b.projectName);
    });
    return map;
  }, [bookmarkedMeetings]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !bookmarkedMeetings.length) {
        setBookmarkedList([]);
        setLoading(false);
        return;
      }
      const result = [];
      for (const { meetingId, projectId } of bookmarkedMeetings) {
        try {
          const meeting = await getMeetingDetail(user.uid, projectId, meetingId);
          if (meeting) result.push(meeting);
        } catch {}
      }
      setBookmarkedList(result);
      setLoading(false);
    };
    fetchData();
  }, [user, bookmarkedMeetings]);

  return (
    <>
      <Header title="전체 북마크" />
      <div className={styles.bookmarksContainer}>
        {loading ? (
          <div style={{ padding: 32 }}>로딩 중...</div>
        ) : bookmarkedList.length === 0 ? (
          <div className={styles.empty}>북마크한 회의가 없습니다.</div>
        ) : (
          <ul className={styles.bookmarksList}>
            {bookmarkedList.map(meeting => (
              <li
                key={meeting.id}
                className={styles.bookmarkItem}
                onClick={() => router.push(`/projects/${meeting.projectId}/meetings/${meeting.id}`)}
              >
                <div className={styles.projectName}>
                  프로젝트: {bookmarkMap.get(meeting.id) || meeting.projectId}
                </div>
                <div className={styles.meetingTitle}>{meeting.title}</div>
                <div className={styles.meetingDate}>
                  날짜: {meeting.meetingDate ? (typeof meeting.meetingDate === 'string' ? meeting.meetingDate : meeting.meetingDate.toDate ? meeting.meetingDate.toDate().toLocaleDateString() : String(meeting.meetingDate)) : '-'}
                </div>
                {/*<div style={{ color: '#888', fontSize: 14 }}>
                  참석자: {Array.isArray(meeting.participantNames) ? meeting.participantNames.join(', ') : meeting.participantNames}
                </div>*/}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
} 