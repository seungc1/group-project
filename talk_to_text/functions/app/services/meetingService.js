/**
 * 회의 관련 데이터를 서버 사이드에서 가져오는 서비스
 */

import { db, storage } from 'lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * 최근 회의 목록을 가져옵니다
 * @returns {Promise<Array>} 회의 목록
 */
export async function getRecentMeetings() {
  try {
    const meetingsRef = collection(db, 'meetings');
    const q = query(meetingsRef, where('createAt', '!=', null));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }
}

/**
 * 특정 회의의 상세 정보를 가져옵니다
 * @param {string} id - 회의 ID
 * @returns {Promise<Object>} 회의 상세 정보
 */
export async function getMeetingById(id) {
  try {
    const decodedId = decodeURIComponent(id);
    const docRef = doc(db, 'meetings', decodedId);
    const docSnap = await getDoc(docRef);

    const normalizeMeeting = (data) => {
      // Firestore Timestamp 객체를 문자열로 변환
      const createAt = data.createAt?.toDate?.().toISOString?.() || null;
      return { ...data, createAt };
    };

    if (docSnap.exists()) {
      return { id: docSnap.id, ...normalizeMeeting(docSnap.data()) };
    }

    // 대체 쿼리 (title이 ID일 경우)
    const q = query(collection(db, 'meetings'), where('title', '==', decodedId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...normalizeMeeting(doc.data()) };
    }

    return null;
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return null;
  }
}

export async function createMeeting({ title, participants, participantNames, meetingDate, file }) {
  try {
    // 문서 ID 생성
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9가-힣]/g, '_');
    const docId = `${year}${month}${day}_${sanitizedTitle}_${participants}명`;
    const fileExtension = file.name.split('.').pop();
    const newFileName = `${docId}.${fileExtension}`;

    // Firestore에 초기 문서 생성
    await setDoc(doc(db, 'meetings', docId), {
      title,
      participants,
      participantName: participantNames,
      meetingDate,
      createAt: serverTimestamp()
    });

    // 파일 업로드 및 URL 획득
    const storageRef = ref(storage, `audio/${newFileName}`);
    await uploadBytes(storageRef, file);
    const audioUrl = await getDownloadURL(storageRef);
    
    // 음성 처리 API 호출
    const response = await fetch('http://localhost:5000/api/process-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        audioUrl,
        docId
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || result.details || '음성 처리 중 오류가 발생했습니다');
    }

    if (!result.success) {
      throw new Error(result.error || '음성 처리 중 오류가 발생했습니다');
    }
    
    // 텍스트 정보 포맷팅
    const textinfo = result.transcript.map(segment => ({
      speaker: segment.speaker,
      text: segment.text
    }));

    // 업데이트할 데이터 준비
    const updateData = {
      audioUrl,
      audioFileName: newFileName,
      textinfo,
      keywords: result.keywords,
      summary: result.summary,
      summaryDownloadUrl: result.summaryDownloadUrl
    };
    
    // Firestore 문서 업데이트
    await updateDoc(doc(db, 'meetings', docId), updateData);

    return { success: true, id: docId };
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
} 