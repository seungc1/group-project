import { db, storage } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// 회의 데이터 저장
export const saveMeeting = async (meetingData) => {
  try {
    const docRef = await addDoc(collection(db, 'meetings'), {
      ...meetingData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving meeting:', error);
    throw error;
  }
};

// 회의 데이터 업데이트
export const updateMeeting = async (meetingId, updateData) => {
  try {
    const docRef = doc(db, 'meetings', meetingId);
    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating meeting:', error);
    throw error;
  }
};

// 회의 데이터 가져오기
export const getMeeting = async (meetingId) => {
  try {
    const docRef = doc(db, 'meetings', meetingId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Meeting not found');
    }
  } catch (error) {
    console.error('Error getting meeting:', error);
    throw error;
  }
};

// 모든 회의 데이터 가져오기
export const getAllMeetings = async () => {
  try {
    const q = query(collection(db, 'meetings'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting meetings:', error);
    throw error;
  }
};

// 오디오 파일 업로드
export const uploadAudioToStorage = async (audioBlob, fileName) => {
  try {
    const storageRef = ref(storage, `audio/${fileName}`);
    await uploadBytes(storageRef, audioBlob);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading audio:', error);
    throw error;
  }
};

// 회의록 텍스트 저장
export const saveTranscriptionToFirestore = async (meetingId, textinfo) => {
  try {
    const docRef = doc(db, 'meetings', meetingId);
    await updateDoc(docRef, { textinfo });
    return true;
  } catch (error) {
    console.error('Error saving transcription:', error);
    throw error;
  }
};

export const updateTranscription = async (docId, text) => {
  const docRef = doc(db, 'transcriptions', docId);
  await updateDoc(docRef, { text });
}; 