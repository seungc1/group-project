import { db, storage } from './firebase.js';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  getDoc,
  deleteDoc,
  limit,
  writeBatch,
  collectionGroup
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// 회의 생성 및 저장
export const submitMeeting = async (meetingData, audioFile, userId, projectId) => {
  try {
    if (!userId || !projectId) {
      throw new Error('사용자 ID와 프로젝트 ID가 필요합니다.');
    }

    // participantNames를 Firestore에 배열로 저장
    let participantNames = meetingData.participantNames;
    if (typeof participantNames === 'string') {
      try {
        participantNames = JSON.parse(participantNames);
      } catch {
        participantNames = [participantNames];
      }
    }
    participantNames = Array.isArray(participantNames) ? participantNames.filter(n => n && n.trim()) : [];

    // 1. Firestore에 회의 문서 생성 (ERD 모든 필드 포함)
    const meetingRef = await addDoc(
      collection(db, 'users', userId, 'projects', projectId, 'meetings'),
      {
        meetingId: '', // meetingRef.id로 나중에 업데이트
        projectId: projectId ?? 0,
        title: meetingData.title ?? 0,
        participants: meetingData.participants ?? 0,
        participantNames, // 배열로 저장
        meetingDate: meetingData.meetingDate ?? 0,
        createdAt: new Date(),
        createdBy: userId ?? 0,
        audioUrl: '',
        audioFileName: '',
        summary: '',
        keywords: [],
        summaryFileUrl: '',
        meetingMinutesList: '',
        calendarEventUrls: [],
        calendarDateTimes: '',
        status: 'processing',
        updatedAt: new Date()
      }
    );

    // meetingId 필드 업데이트
    await updateDoc(doc(db, 'users', userId, 'projects', projectId, 'meetings', meetingRef.id), {
      meetingId: meetingRef.id
    });

    // 2. Storage에 음성 파일 업로드
    let audioUrl = '';
    if (audioFile) {
      const storageRef = ref(storage, `users/${userId}/projects/${projectId}/meetings/${meetingRef.id}/${audioFile.name}`);
      await uploadBytes(storageRef, audioFile);
      audioUrl = await getDownloadURL(storageRef);

      // 3. 회의 문서에 오디오 URL/파일명 업데이트
      await updateDoc(doc(db, 'users', userId, 'projects', projectId, 'meetings', meetingRef.id), {
        audioUrl,
        audioFileName: audioFile.name
      });
    }

    // 4. STT 백엔드 호출
    const response = await fetch('/api/process-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meetingId: meetingRef.id,
        audioUrl,
        userId,
        projectId
      }),
    });

    if (!response.ok) {
      throw new Error('STT 처리 실패');
    }

    const sttResult = await response.json();
    console.log('STT 백엔드 반환값:', sttResult);
    const {
      summary = 0,
      keywords = 0,
      summaryFileUrl = 0,
      meetingMinutesList = 0,
      calendarEventUrls = 0,
      calendarDateTimes = 0,
      textinfo,
      tags,
      calendar_logs
    } = sttResult;

    // 5. 회의 문서에 STT 결과 및 모든 필드 업데이트
    await updateDoc(doc(db, 'users', userId, 'projects', projectId, 'meetings', meetingRef.id), {
      summary,
      keywords,
      summaryFileUrl,
      meetingMinutesList,
      calendarEventUrls,
      calendarDateTimes,
      status: 'completed',
      updatedAt: new Date()
    });

    // 6. textinfo 저장
    if (textinfo && textinfo.length > 0) {
      const textinfoBatch = writeBatch(db);
      textinfo.forEach((item, index) => {
        const textinfoRef = doc(collection(db, 'users', userId, 'projects', projectId, 'meetings', meetingRef.id, 'textinfo'));
        textinfoBatch.set(textinfoRef, {
          textId: `text_${index}`,
          meetingId: meetingRef.id,
          speaker: item.speaker,
          text: item.text,
          startTime: item.startTime,
          endTime: item.endTime,
          createdAt: new Date()
        });
      });
      await textinfoBatch.commit();
    }

    // 7. tags 저장
    if (tags && tags.length > 0) {
      const tagsBatch = writeBatch(db);
      tags.forEach((item, index) => {
        const tagRef = doc(collection(db, 'users', userId, 'projects', projectId, 'meetings', meetingRef.id, 'tags'));
        tagsBatch.set(tagRef, {
          tagId: `tag_${index}`,
          meetingId: meetingRef.id,
          label: item.label,
          createdAt: item.createdAt || new Date()
        });
      });
      await tagsBatch.commit();
    }

    // 8. calendar_logs 저장
    if (calendar_logs && calendar_logs.length > 0) {
      const calBatch = writeBatch(db);
      calendar_logs.forEach((item, index) => {
        const calRef = doc(collection(db, 'users', userId, 'projects', projectId, 'meetings', meetingRef.id, 'calendar_logs'));
        calBatch.set(calRef, {
          logId: `log_${index}`,
          meetingId: meetingRef.id,
          ...item,
          createdAt: item.createdAt || new Date()
        });
      });
      await calBatch.commit();
    }

    return meetingRef.id;
  } catch (error) {
    console.error('회의 저장 중 오류 발생:', error);
    throw error;
  }
};

// 회의 목록 조회
export const getMeetings = async (userId, projectId) => {
  try {
    if (!userId || !projectId) return [];
    const meetingsQuery = query(
      collection(db, 'users', userId, 'projects', projectId, 'meetings'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(meetingsQuery);
    const meetings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      projectId,
      ...doc.data()
    }));
    return meetings;
  } catch (error) {
    console.error('회의 목록 조회 중 오류 발생:', error);
    throw error;
  }
};

// 회의 상세 조회
export const getMeetingDetail = async (userId, projectId, meetingId) => {
  try {
    if (!userId || !projectId || !meetingId) {
      throw new Error('필수 파라미터가 누락되었습니다.');
    }

    const meetingRef = doc(db, 'users', userId, 'projects', projectId, 'meetings', meetingId);
    const meetingDoc = await getDoc(meetingRef);
    
    if (!meetingDoc.exists()) {
      throw new Error('회의를 찾을 수 없습니다.');
    }

    const meetingData = {
      id: meetingDoc.id,
      ...meetingDoc.data()
    };

    // textinfo 데이터 가져오기
    const textinfoQuery = query(
      collection(db, 'users', userId, 'projects', projectId, 'meetings', meetingId, 'textinfo'),
      orderBy('startTime', 'asc')
    );
    const textinfoSnapshot = await getDocs(textinfoQuery);
    meetingData.textinfo = textinfoSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // tags 데이터 가져오기
    const tagsQuery = query(
      collection(db, 'users', userId, 'projects', projectId, 'meetings', meetingId, 'tags')
    );
    const tagsSnapshot = await getDocs(tagsQuery);
    meetingData.tags = tagsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // calendar_logs 데이터 가져오기
    const calendarLogsQuery = query(
      collection(db, 'users', userId, 'projects', projectId, 'meetings', meetingId, 'calendar_logs')
    );
    const calendarLogsSnapshot = await getDocs(calendarLogsQuery);
    meetingData.calendar_logs = calendarLogsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return meetingData;
  } catch (error) {
    console.error('회의 상세 조회 중 오류 발생:', error);
    throw error;
  }
};

// 회의 수정
export const updateMeeting = async (meetingId, meetingData) => {
  try {
    const meetingRef = doc(db, 'meetings', meetingId);
    await updateDoc(meetingRef, {
      ...meetingData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('회의 수정 중 오류 발생:', error);
    throw error;
  }
};

// 회의 삭제
export const deleteMeeting = async (meetingId) => {
  try {
    const meetingRef = doc(db, 'meetings', meetingId);
    await deleteDoc(meetingRef);
  } catch (error) {
    console.error('회의 삭제 중 오류 발생:', error);
    throw error;
  }
};

// 프로젝트 정보 조회
export const getProject = async (userId, projectId) => {
  try {
    if (!userId || !projectId) return null;
    const projectDoc = await getDoc(doc(db, 'users', userId, 'projects', projectId));
    if (!projectDoc.exists()) return null;
    return { id: projectDoc.id, ...projectDoc.data() };
  } catch (error) {
    console.error('프로젝트 정보 조회 중 오류 발생:', error);
    throw error;
  }
};

// 전체 회의록(모든 프로젝트의 meetings) 조회
export const getAllMeetings = async (userId) => {
  try {
    if (!userId) return [];
    const meetingsQuery = query(
      collectionGroup(db, 'meetings'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(meetingsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      projectId: doc.data().projectId ?? null,
      ...doc.data()
    }));
  } catch (error) {
    console.error('전체 회의록 조회 중 오류 발생:', error);
    throw error;
  }
};

// 해당 계정의 모든 프로젝트만 불러오는 함수
export const getAllProjects = async (userId) => {
  if (!userId) return [];
  const projectsQuery = query(
    collection(db, 'users', userId, 'projects'),
    orderBy('createdAt', 'desc')
  );
  const projectsSnap = await getDocs(projectsQuery);
  return projectsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}; 