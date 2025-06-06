'use client';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';

/**
 * 저장 버튼 컴포넌트
 *
 * props:
 *  - className  (string): 외부에서 전달된 CSS 클래스
 *  - userId     (string): Firestore 경로상의 사용자 UID
 *  - projectId  (string): Firestore 경로상의 프로젝트 ID
 *  - meetingId  (string): Firestore 경로상의 meeting 문서 ID
 *  - newSummary (string): 사용자가 입력한 최신 요약
 *  - onSuccess  (function, optional): 저장 성공 후 호출할 콜백
 *  - disabled   (boolean, optional): 버튼 활성화/비활성화를 제어
 */
export default function SaveButton({
  className,
  userId,
  projectId,
  meetingId,
  newSummary,
  onSuccess,
  disabled = false,
}) {
  const handleSave = async () => {
    if (disabled) return;

    try {
      // 필수 식별자가 모두 전달되었는지 검증
      if (!userId || !projectId || !meetingId) {
        throw new Error('저장에 필요한 userId, projectId, meetingId 중 하나가 누락되었습니다.');
      }

      // Firestore 문서 레퍼런스 생성
      const docRef = doc(
        db,
        'users',
        userId,
        'projects',
        projectId,
        'meetings',
        meetingId
      );

      // 문서 존재 여부 확인
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        alert('저장 실패: 해당 회의 문서를 찾을 수 없습니다.');
        return;
      }

      // summary 필드 업데이트
      await updateDoc(docRef, { summary: newSummary });
      alert('수정된 요약이 저장되었습니다.');

      // onSuccess 콜백 호출 (선택)
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ [SaveButton] 저장 중 에러 발생:', error);
      alert('저장 실패: ' + error.message);
    }
  };

  return (
    <button
      className={`${className ?? ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleSave}
      disabled={disabled}
    >
      요약 저장
    </button>
  );
}
