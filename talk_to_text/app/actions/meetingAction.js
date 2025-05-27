'use server';

import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function submitMeeting(formData) {
  try {
    // 폼 데이터 추출
    const title = formData.get('title');
    const participants = formData.get('participants');
    const participantNames = formData.get('participantNames');
    const meetingDate = formData.get('meetingDate');
    const projectId = formData.get('projectId');
    const meetingMinutesList = formData.get('meetingMinutesList');
    const file = formData.get('file');

    console.log('Received form data:', {
      title,
      participants,
      participantNames,
      meetingDate,
      projectId,
      meetingMinutesList,
      file: file ? { name: file.name, type: file.type, size: file.size } : null
    });

    // 유효성 검사
    if (!file || !title || !participants || !participantNames || !meetingDate || !projectId) {
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

      // 2. Flask 서버로 오디오 처리 요청
      console.log('Flask 서버로 요청 전송 시작...');
      const requestData = {
        audioUrl: audioUrl,
        meetingId: fileName.split('_')[0]
      };
      console.log('전송할 데이터:', requestData);
      
      // fetch 요청 수정 (포트 번호 변경)
      const flaskResponse = await fetch('http://localhost:5001/process-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'http://localhost:3000'
        },
        mode: 'cors',
        credentials: 'include',
        cache: 'no-cache',
        body: JSON.stringify(requestData)
      });

      console.log('서버 응답 상태:', flaskResponse.status);
      
      if (!flaskResponse.ok) {
        const errorText = await flaskResponse.text();
        console.error('서버 오류 응답:', errorText);
        throw new Error('오디오 처리 요청 실패: ' + errorText);
      }

      const processResult = await flaskResponse.json();
      console.log('오디오 처리 결과:', processResult);

      const pythonResult = processResult;
      // meetings 컬렉션에 ERD에 맞게 저장
      const meetingData = {
        projectId,
        title,
        participants: Number(participants),
        participantNames: participantNames.split(',').map(name => name.trim()),
        meetingDate,
        createdAt: serverTimestamp(),
        createdBy: formData.get('userId'),
        audioUrl,
        audioFileName: fileName,
        summary: pythonResult.summary || '',
        keywords: pythonResult.keywords || [],
        summaryFileUrl: pythonResult.summaryDownloadUrl || '',
        meetingMinutesList: meetingMinutesList || '',
        calendarEventUrls: pythonResult.calendarEventUrls || [],
        calendarDateTimes: pythonResult.calendarDateTimes || '',
      };
      const docRef = await addDoc(collection(db, 'meetings'), meetingData);
      const meetingId = docRef.id;

      // 4. 클라이언트에서 처리할 수 있도록 필요한 정보 반환
      return {
        success: true,
        docId: meetingId,
        audioUrl,
        projectId,
        message: '회의록이 생성되었으며 음성 처리가 진행 중입니다.'
      };

    } catch (error) {
      console.error('상세 오류 정보:', error);
      throw error;
    }

  } catch (error) {
    console.error('Form processing error:', error);
    throw new Error(error.message || '회의록 생성 중 오류가 발생했습니다.');
  }
} 