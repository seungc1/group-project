// 파일: app/components/common/buttons/SaveButton/index.js
'use client';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from 'lib/firebase';

export default function SaveButton({ className, meetingId, projectId, userId, newSummary, onSuccess }) {
  const handleSave = async () => {
    try {
      const decodedMeetingId = decodeURIComponent(meetingId);
      const decodedProjectId = decodeURIComponent(projectId);
      const decodedUserId = decodeURIComponent(userId);

      // Firestore 경로 예시:
      // users/{userId}/projects/{projectId}/meetings/{meetingId}
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

      await updateDoc(docRef, { summary: newSummary });
      alert('수정이 완료되었습니다.');
      onSuccess?.();
    } catch (error) {
      alert('저장 실패: ' + error.message);
    }
  };

  const handleKeepEditing = () => {
    // 모달을 닫고 그대로 에디터에 남아 있게 하고 싶으면 로직 추가
  };

  const handleGoBack = () => {
    // 이전 페이지로 돌아가기 (Next.js router 사용)
    window.history.back();
  };

  return (
    <div className={className}>
      <button onClick={handleSave}>
        요약 저장
      </button>
      {/* 저장 후 뜨는 안내창 예시 (임의 구현) */}
      {/* 
      <Modal>
        <p>수정이 완료되었습니다.</p>
        <button onClick={handleKeepEditing}>계속 수정하기</button>
        <button onClick={handleGoBack}>이전으로 돌아가기</button>
      </Modal>
      */}
    </div>
  );
}