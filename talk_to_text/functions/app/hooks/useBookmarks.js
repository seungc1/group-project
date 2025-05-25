import { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useBookmarks(user, projectId) {
  const [bookmarkedMeetings, setBookmarkedMeetings] = useState(new Set());

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;
      try {
        const bookmarksQuery = query(
          collection(db, 'users', user.uid, 'bookmarks'),
          where('type', '==', 'meeting')
        );
        const snapshot = await getDocs(bookmarksQuery);
        const bookmarkedIds = new Set(snapshot.docs.map(doc => doc.data().itemId));
        setBookmarkedMeetings(bookmarkedIds);
      } catch (err) {
        console.error('북마크 목록을 가져오는 중 오류 발생:', err);
      }
    };
    fetchBookmarks();
  }, [user]);

  const toggleBookmark = async (meetingId) => {
    if (!user) return;
    try {
      const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', `meeting_${meetingId}`);
      if (bookmarkedMeetings.has(meetingId)) {
        await deleteDoc(bookmarkRef);
        setBookmarkedMeetings(prev => {
          const next = new Set(prev);
          next.delete(meetingId);
          return next;
        });
      } else {
        await setDoc(bookmarkRef, {
          type: 'meeting',
          itemId: meetingId,
          projectId,
          createdAt: new Date()
        });
        setBookmarkedMeetings(prev => new Set(prev).add(meetingId));
      }
    } catch (err) {
      console.error('북마크 토글 중 오류 발생:', err);
    }
  };

  return {
    bookmarkedMeetings,
    toggleBookmark
  };
} 