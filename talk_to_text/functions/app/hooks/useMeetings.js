import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export const useMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(null);
      } catch (error) {
        console.error('Error fetching meetings:', error)
        setError('회의 데이터를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  return { meetings, loading, error };
};