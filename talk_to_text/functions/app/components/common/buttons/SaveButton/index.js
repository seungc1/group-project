// 파일: app/components/common/buttons/SaveButton/index.js
'use client';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';

/**
 * 저장 버튼 컴포넌트
 * props:
 *  - className  (string): 외부에서 전달된 CSS 클래스
 *  - userId     (string): Firestore 경로상의 상위 사용자 UID
 *  - projectId  (string): Firestore 경로상의 프로젝트 ID
 *  - meetingId  (string): Firestore 경로상의 meeting 문서 ID
 *  - newSummary (string): 사용자가 입력한 최신 요약
 *  - onSuccess  (function, optional): 저장 성공 후 호출할 콜백
 */
export default function SaveButton({
  className,
  userId,
  projectId,
  meetingId,
  newSummary,
  onSuccess,
}) {
  const handleSave = async () => {
    try {
      // URL-safe 인코딩 되어 전달된 값을 디코딩
      const decodedUserId = decodeURIComponent(userId);
      const decodedProjectId = decodeURIComponent(projectId);
      const decodedMeetingId = decodeURIComponent(meetingId);

      // Firestore 실제 경로:
      //   users/{userId}/projects/{projectId}/meetings/{meetingId}
      const docRef = doc(
        db,
        'users',
        decodedUserId,
        'projects',
        decodedProjectId,
        'meetings',
        decodedMeetingId
      );
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert('저장 실패: 회의 문서를 찾을 수 없습니다.');
        return;
      }

      // 해당 경로의 'summary' 필드만 업데이트
      await updateDoc(docRef, { summary: newSummary });
      alert('수정된 요약이 저장되었습니다.');

      onSuccess?.(); // 선택적으로, 성공 콜백 실행
    } catch (error) {
      alert('저장 실패: ' + error.message);
    }
  };

  return (
    <button className={className} onClick={handleSave}>
      요약 저장
    </button>
  );
}