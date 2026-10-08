import { updateDoc, doc } from 'firebase/firestore';
import { db } from 'lib/firebase'; 

/**
 * 특정 회의의 요약(summary) 내용을 업데이트합니다.
 * 
 * @param {string} meetingId - 업데이트할 회의 문서의 ID (문서 키)
 * @param {string} summary - 새로 저장할 요약 내용
 * @returns {Promise<void>} - 업데이트 완료 시 아무 것도 반환하지 않음 (비동기 처리)
 */
export async function updateMeetingSummary(meetingId, summary) {
  await updateDoc(
    doc(db, 'meetings', meetingId), { summary }                     
    // Firestore에서 'meetings' 컬렉션 내의 특정 문서 참조 생성해당 문서의 'summary' 필드를 새로운 값으로 업데이트
  );
}
