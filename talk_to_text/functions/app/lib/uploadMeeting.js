import { setDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export const uploadMeeting = async ({ file, title, participants, participantNames, userId }) => {
  try {
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    };

    const currentDate = formatDate(new Date());
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9가-힣]/g, '_');
    const docId = `${currentDate}_${sanitizedTitle}_${participants}명`;
    const fileExtension = file.name.split('.').pop();
    const newFileName = `${docId}.${fileExtension}`;

    // 회의 문서 생성
    await setDoc(doc(db, 'meetings', docId), {
      title,
      userId, // 사용자 ID 추가
      participants: parseInt(participants),
      participantName: participantNames.split(',').map(name => name.trim()),
      createAt: serverTimestamp(),
      status: 'processing'
    });

    // 파일 업로드
    const storageRef = ref(storage, `audio/${newFileName}`);
    await uploadBytes(storageRef, file);
    const audioUrl = await getDownloadURL(storageRef);

    // STT 처리 API 호출
    const response = await fetch('/api/process-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl, docId }),
    });

    if (!response.ok) {
      throw new Error(`API 응답 오류: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || result.details || '음성 처리 중 오류 발생');
    }

    const textinfo = result.transcript.map(segment => ({
      speaker: segment.speaker,
      text: segment.text,
    }));

    // 회의 문서 업데이트
    const updateData = {
      audioUrl,
      audioFileName: newFileName,
      textinfo,
      keywords: result.keywords,
      summary: result.summary,
      summaryDownloadUrl: result.summaryDownloadUrl,
      status: 'completed',
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, 'meetings', docId), updateData);
    return { success: true, docId };
  } catch (error) {
    console.error('회의 업로드 중 오류 발생:', error);
    throw error;
  }
};
 