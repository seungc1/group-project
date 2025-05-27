import { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useBookmarks(user, projectId) {
  // [{ meetingId, projectId }] 형태의 배열로 관리
  const [bookmarkedMeetings, setBookmarkedMeetings] = useState([]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;
      try {
        const bookmarksQuery = query(
          collection(db, 'users', user.uid, 'bookmarks'),
          where('type', '==', 'meeting')
        );
        const snapshot = await getDocs(bookmarksQuery);
        const bookmarks = snapshot.docs.map(doc => ({
          meetingId: doc.data().itemId,
          projectId: doc.data().projectId,
          projectName: doc.data().projectName
        })).filter(b => b.meetingId && b.projectId);
        setBookmarkedMeetings(bookmarks);
      } catch (err) {
        console.error('북마크 목록을 가져오는 중 오류 발생:', err);
      }
    };
    fetchBookmarks();
  }, [user]);

  const toggleBookmark = async (meetingId, projectId, projectName) => {
    if (!user) return;
    try {
      const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', `meeting_${meetingId}`);
      const exists = bookmarkedMeetings.some(b => b.meetingId === meetingId && b.projectId === projectId);
      if (exists) {
        await deleteDoc(bookmarkRef);
        setBookmarkedMeetings(prev => prev.filter(b => !(b.meetingId === meetingId && b.projectId === projectId)));
      } else {
        await setDoc(bookmarkRef, {
          type: 'meeting',
          itemId: meetingId,
          projectId,
          projectName,
          createdAt: new Date()
        });
        setBookmarkedMeetings(prev => [...prev, { meetingId, projectId, projectName }]);
      }
    } catch (err) {
      console.error('북마크 토글 중 오류 발생:', err);
    }
  };

  return {
    bookmarkedMeetings, // [{ meetingId, projectId }]
    toggleBookmark
  };
} 