'use client';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * 저장 버튼 컴포넌트
 * - 사용자가 수정한 요약(newSummary)을 해당 meeting 문서에 업데이트
 * - meetingId는 URL-safe 인코딩된 상태이므로 디코딩 후 사용
 * - 저장 완료 시 onSuccess 콜백 호출 가능
 */

export default function SaveButton({ meetingId, newSummary, onSuccess }) {
  const handleSave = async () => {
    try {
      const decodedId = decodeURIComponent(meetingId); // URL 인코딩 해제

      const docRef = doc(db, 'meetings', decodedId);   // Firestore 문서 참조 생성
      const docSnap = await getDoc(docRef);            // 문서 존재 여부 확인

      if (!docSnap.exists()) {
        alert('저장 실패: 회의 문서를 찾을 수 없습니다.');
        return;
      }

      await updateDoc(docRef, { summary: newSummary }); // ✅ 요약 내용 업데이트
      alert('수정된 요약이 저장되었습니다.');

      onSuccess?.(); // 선택적 콜백 실행
    } catch (error) {
      alert('저장 실패: ' + error.message); // 오류 알림
    }
  };

  return (
    <button onClick={handleSave}>
      요약 저장
    </button>
  );
}
