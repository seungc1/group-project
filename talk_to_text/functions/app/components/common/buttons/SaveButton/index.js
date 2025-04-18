'use client';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SaveButton({ meetingId, newSummary, onSuccess }) {
  const handleSave = async () => {
    try {
      const decodedId = decodeURIComponent(meetingId); // ✅ 디코딩
      console.log('[SaveButton] decodedId:', decodedId);

      const docRef = doc(db, 'meetings', decodedId);
      const docSnap = await getDoc(docRef);
      console.log('[SaveButton] 문서 존재 여부:', docSnap.exists());

      if (!docSnap.exists()) {
        alert('저장 실패: 회의 문서를 찾을 수 없습니다.');
        return;
      }

      await updateDoc(docRef, { summary: newSummary });
      alert('수정된 요약이 저장되었습니다.');
      onSuccess?.();
    } catch (error) {
      console.error('[SaveButton] 저장 실패:', error);
      alert('저장 실패: ' + error.message);
    }
  };

  return (
    <button onClick={handleSave}>
      요약 저장
    </button>
  );
}
