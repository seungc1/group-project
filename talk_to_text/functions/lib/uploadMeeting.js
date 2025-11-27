import { setDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from 'lib/firebase';

export const uploadMeeting = async ({ file, title, participants, participantNames }) => {
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

  await setDoc(doc(db, 'meetings', docId), {
    title,
    participants: parseInt(participants),
    participantName: participantNames.split(',').map(name => name.trim()),
    createAt: serverTimestamp(),
  });

  const storageRef = ref(storage, `audio/${newFileName}`);
  await uploadBytes(storageRef, file);
  const audioUrl = await getDownloadURL(storageRef);

  const response = await fetch('http://localhost:5000/api/process-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioUrl, docId }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || result.details || '음성 처리 중 오류 발생');
  }

  const textinfo = result.transcript.map(segment => ({
    speaker: segment.speaker,
    text: segment.text,
  }));

  const updateData = {
    audioUrl,
    audioFileName: newFileName,
    textinfo,
    keywords: result.keywords,
    summary: result.summary,
    summaryDownloadUrl: result.summaryDownloadUrl,
  };

  await updateDoc(doc(db, 'meetings', docId), updateData);
  return { success: true, docId };
};
