// app/hooks/useMeeting.js
// const { meeting, loading, error } = useMeeting(meetingId);  으로 사용가능
// 특정 회의 상세 정보가 필요한 경우 사용

import { useEffect, useState } from 'react';
import { db } from 'lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function useMeeting(meetingId) {
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const decodedId = decodeURIComponent(meetingId);
  useEffect(() => {
    if (!meetingId) return;
    const fetchData = async () => {
      try {
        console.log('문서 ID:', decodedId);
        const docRef = doc(db, 'meetings', decodedId);
        const docSnap = await getDoc(docRef);
        console.log('문서 존재 여부:', docSnap.exists());

        if (docSnap.exists()) {
          setMeeting({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('회의를 찾을 수 없습니다.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [meetingId]);

  return { meeting, loading, error };
}
