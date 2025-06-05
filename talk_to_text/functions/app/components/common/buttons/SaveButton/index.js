// 파일 경로: project-root/app/components/common/buttons/SaveButton/index.js
'use client';

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // 루트 경로에서 lib/firebase.js를 가져옵니다

/**
 * 저장 버튼 컴포넌트
 * props:
 *  - className  (string)  : 외부에서 전달된 CSS 클래스
 *  - meetingId  (string)  : URL-safe 인코딩된 회의 문서 ID
 *  - newSummary (string)  : 사용자가 입력한 최신 요약 내용
 *  - onSuccess  (function, optional) : 저장 성공 후 호출될 콜백
 */
export default function SaveButton({ className, meetingId, newSummary, onSuccess }) {
  const handleSave = async () => {
    try {
      // 1) URL-safe 인코딩 해제
      const decodedId = decodeURIComponent(meetingId);

      // 2) Firestore 내의 'meetings' 컬렉션에서 해당 문서를 찾습니다.
      //    (프로젝트 구조에 따라 경로가 다를 수 있습니다. 
      //     현재는 최상위 컬렉션 'meetings'를 사용한다고 가정합니다.)
      const docRef = doc(db, "meetings", decodedId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("저장 실패: 회의 문서를 찾을 수 없습니다.");
        return;
      }

      // 3) Firestore 문서 업데이트 (summary 필드만 교체)
      await updateDoc(docRef, { summary: newSummary });
      alert("수정된 요약이 저장되었습니다.");

      // 4) 저장 성공 시 호출되는 콜백 (선택적)
      onSuccess?.();
    } catch (error) {
      alert("저장 실패: " + error.message);
    }
  };

  return (
    <button
      className={className}
      onClick={handleSave}
    >
      요약 저장
    </button>
  );
}