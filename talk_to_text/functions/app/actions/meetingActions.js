'use server';

import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function submitMeeting(formData) {
  try {
    // 폼 데이터 추출
    const userId = formData.get('userId');
    const title = formData.get('title');
    const participantNames = formData.get('participantNames');
    const meetingDate = formData.get('meetingDate');
    const meetingMinutesList = formData.get('meetingMinutesList');
    const file = formData.get('file');
    const projectId = formData.get('projectId');

    console.log('Received form data:', {
      userId,
      title,
      participantNames,
      meetingDate,
      meetingMinutesList,
      file: file ? { name: file.name, type: file.type, size: file.size } : null
    });

    // 유효성 검사 (실제 폼에 있는 필드만 체크)
    if (!userId || !file || !title || !participantNames || !meetingDate) {
      throw new Error('모든 필드를 입력해주세요.');
    }

    try {
      // 1. Firebase Storage에 파일 업로드
      const fileBuffer = await file.arrayBuffer();
      const fileBlob = new Blob([fileBuffer], { type: file.type });
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `audio/${projectId}/${fileName}`);
      
      console.log('Uploading file to Storage...');
      await uploadBytes(storageRef, fileBlob);
      const audioUrl = await getDownloadURL(storageRef);
      console.log('File uploaded successfully, URL:', audioUrl);

      // 2. Firestore에 중첩 경로로 저장
      const initialData = {
        projectId,
        title,
        participantNames: participantNames.split(',').map(name => name.trim()),
        meetingDate,
        meetingMinutesList: meetingMinutesList || '',
        audioUrl,
        audioFileName: fileName,
        createdAt: serverTimestamp(),
        createdBy: userId,
        status: 'processing'
      };

      const docRef = await addDoc(
        collection(db, 'users', userId, 'projects', projectId, 'meetings'),
        initialData
      );
      const meetingId = docRef.id;

      return {
        success: true,
        docId: meetingId,
        audioUrl,
        audioFileName: fileName,
        projectId,
        userId,
        message: '회의록이 생성되었으며 음성 처리가 진행 중입니다.'
      };

    } catch (error) {
      console.error('Operation error:', error);
      throw new Error(error.message || '처리 중 오류가 발생했습니다.');
    }

  } catch (error) {
    console.error('Form processing error:', error);
    throw new Error(error.message || '회의록 생성 중 오류가 발생했습니다.');
  }
} 