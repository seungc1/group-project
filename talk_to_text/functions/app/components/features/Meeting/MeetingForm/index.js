/**
 * 회의록 생성을 위한 폼 컴포넌트
 * 음성 파일 업로드, 회의 정보 입력, 처리 및 저장 기능을 제공
 */
'use client';

import { useRouter } from 'next/navigation';
import { submitMeeting } from '@/app/actions/meetingActions';
import FileUpload from '../../../common/inputs/FileUpload';
import LoadingButton from '../../../common/buttons/LoadingButton';
import styles from './styles.module.css';
import { useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/app/context/AuthContext';

export default function MeetingForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleFileSelect = (file) => {
    // 파일 유효성 검사
    if (file) {
      // 허용된 오디오 파일 형식
      const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a'];
      const maxSize = 100 * 1024 * 1024; // 100MB

      console.log('Selected file type:', file.type);
      console.log('Selected file size:', file.size);

      if (!allowedTypes.includes(file.type)) {
        alert('지원되지 않는 파일 형식입니다. WAV, MP3, M4A 형식만 지원됩니다.');
        return;
      }

      if (file.size > maxSize) {
        alert('파일 크기가 너무 큽니다. 100MB 이하의 파일만 업로드 가능합니다.');
        return;
      }
    }
    setSelectedFile(file);
    setErrors({ ...errors, file: '' }); // 파일 선택 시 에러 메시지 제거
  };

  const validateForm = (formData) => {
    const newErrors = {};
    if (!user) newErrors.auth = '로그인이 필요합니다';
    if (!formData.get('title')) newErrors.title = '회의 제목을 입력해주세요';
    if (!formData.get('participants')) newErrors.participants = '참석자 수를 입력해주세요';
    if (!formData.get('participantNames')) newErrors.participantNames = '참석자 이름을 입력해주세요';
    if (!formData.get('meetingDate')) newErrors.meetingDate = '회의 날짜를 입력해주세요';
    if (!selectedFile) newErrors.file = '음성 파일을 선택해주세요';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(formData) {
    if (isSubmitting) return;
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (!validateForm(formData)) {
        setIsSubmitting(false);
        return;
      }
      
      // FormData에 파일 추가
      const formDataWithFile = new FormData();
      formDataWithFile.append('userId', user.uid);  // 사용자 ID 추가
      formDataWithFile.append('title', formData.get('title'));
      formDataWithFile.append('participants', formData.get('participants'));
      formDataWithFile.append('participantNames', formData.get('participantNames'));
      formDataWithFile.append('meetingDate', formData.get('meetingDate'));
      formDataWithFile.append('projectId', formData.get('projectId'));
      formDataWithFile.append('projectDescription', formData.get('projectDescription') || '');
      formDataWithFile.append('meetingMinutesList', formData.get('meetingMinutesList') || '');
      
      if (selectedFile) {
        console.log('Uploading file:', selectedFile.name, selectedFile.type, selectedFile.size);
        formDataWithFile.append('file', selectedFile);
      }

      // 서버 액션 직접 호출
      const result = await submitMeeting(formDataWithFile);
      
      if (!result.success) {
        throw new Error(result.error || '회의록 생성 중 오류가 발생했습니다.');
      }

      // Python 서버에 음성 처리 요청
      const pythonResponse = await fetch('http://localhost:5001/process-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audioUrl: result.audioUrl,
          audioFileName: result.audioFileName || '',
          userId: user.uid,
          meetingId: result.docId,
          projectId: result.projectId,
          meetingMinutesList: formData.get('meetingMinutesList') || '',
          meetingDate: formData.get('meetingDate') || '',
          participantNames: formData.get('participantNames') || '',
          participants: formData.get('participants') || 0,
          title: formData.get('title') || ''
        })
      });

      if (!pythonResponse.ok) {
        const errorText = await pythonResponse.text();
        console.error('Python server error:', errorText);
        throw new Error(`음성 처리 중 오류가 발생했습니다: ${errorText}`);
      }

      const pythonResult = await pythonResponse.json();
      
      if (!pythonResult.success) {
        throw new Error(pythonResult.error || '음성 처리 중 오류가 발생했습니다.');
      }

      // meetings 저장 후 users/{userId}/projects/{projectId}에 모든 정보 저장
      const userId = user.uid;
      const projectId = formData.get('projectId');
      const folderId = formData.get('folderId') || '';
      const projectName = formData.get('projectName') || projectId;
      const projectDescription = formData.get('projectDescription') || '';
      const projectRef = doc(db, 'users', userId, 'projects', projectId);
      await setDoc(projectRef, {
        projectId,
        folderId,
        name: projectName,
        description: projectDescription,
        createdAt: serverTimestamp(),
        createdBy: userId,
        members: [userId]
      }, { merge: true });

      alert('회의록이 성공적으로 생성되었습니다.');
      router.push('/meetings');
    } catch (error) {
      console.error('Form submission error:', error);
      alert(error.message || '회의록 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // 로그인 상태가 아니면 로그인 페이지로 리다이렉트 또는 에러 메시지 표시
  if (!user) {
    return (
      <div className={styles.error}>
        로그인이 필요합니다.
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await handleSubmit(formData);
      }}
      className={styles.form}
    >
      <div className={styles.formSection}>
        <div className={styles.formGroup}>
          <label>프로젝트 이름:</label>
          <input
            type="text"
            name="projectId"
            placeholder="프로젝트 ID를 입력하세요"
            required
          />
          {errors.projectId && <span className={styles.error}>{errors.projectId}</span>}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>프로젝트 설명:</label>
        <input
          type="text"
          name="projectDescription"
          placeholder="프로젝트 설명을 입력하세요"
        />
      </div>

      <div className={styles.formGroup}>
        <label>회의 이름:</label>
        <input
          type="text"
          name="title"
          placeholder="회의 제목을 입력하세요"
          required
        />
        {errors.title && <span className={styles.error}>{errors.title}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>회의 날짜:</label>
        <input
          type="text"
          name="meetingDate"
          placeholder="회의 날짜를 입력하세요"
          required
        />
        {errors.meetingDate && <span className={styles.error}>{errors.meetingDate}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>참석자 수:</label>
        <input
          type="number"
          name="participants"
          placeholder="참석자 수를 입력하세요"
          required
        />
        {errors.participants && <span className={styles.error}>{errors.participants}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>참석자 이름 (쉼표로 구분):</label>
        <input
          type="text"
          name="participantNames"
          placeholder="참석자 이름을 쉼표로 구분하여 입력하세요"
          required
        />
        {errors.participantNames && <span className={styles.error}>{errors.participantNames}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>회의록 목록:</label>
        <textarea
          name="meetingMinutesList"
          placeholder="회의록 목록을 입력하세요 (예: 1. 프로젝트 현황 보고&#13;&#10;2. 일정 조율&#13;&#10;3. 다음 단계 논의)"
          rows="5"
          className={styles.textArea}
        />
      </div>

      <FileUpload onFileSelect={handleFileSelect} selectedFile={selectedFile} />
      {errors.file && <span className={styles.error}>{errors.file}</span>}
      {submitError && <div className={styles.error}>{submitError}</div>}

      <LoadingButton 
        type="submit" 
        text={isSubmitting ? "처리 중..." : "회의록 저장"} 
        disabled={isSubmitting || submitError}
      />
    </form>
  );
} 

/*'use client';

import { useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [participants, setParticipants] = useState(0);
  const [participantNames, setParticipantNames] = useState('');
  const [processing, setProcessing] = useState(false);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const handleUpload = async () => {
    if (!file) return alert('파일을 선택하세요');
    if (!title) return alert('제목을 입력하세요');
    if (!participants) return alert('참석자 수를 입력하세요');
    if (!participantNames) return alert('참석자 이름을 입력하세요');

    try {
      setProcessing(true);

      // 파일명 생성 (문서 ID로도 사용)
      const currentDate = formatDate(new Date());
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9가-힣]/g, '_');
      const docId = `${currentDate}_${sanitizedTitle}_${participants}명`;
      const fileExtension = file.name.split('.').pop();
      const newFileName = `${docId}.${fileExtension}`;

      // 1. 회의록 문서 생성 (ID 지정)
      await setDoc(doc(db, 'meetings', docId), {
        title,
        participants: parseInt(participants),
        participantName: participantNames.split(',').map(name => name.trim()),
        createAt: serverTimestamp()
      });

      // 2. 음성 파일 업로드
      const storageRef = ref(storage, `audio/${newFileName}`);
      await uploadBytes(storageRef, file);
      
      // 3. 업로드된 파일의 URL 가져오기
      const audioUrl = await getDownloadURL(storageRef);
      
      // 4. 음성 처리 요청
      const response = await fetch('/api/process-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioUrl })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '음성 처리 중 오류가 발생했습니다');
      }
      
      // 5. Firestore 문서 업데이트
      const textinfo = result.transcript.map(segment => ({
        speaker: segment.speaker,
        text: segment.text
      }));

      const updateData = {
        audioUrl,
        audioFileName: newFileName,
        textinfo    // 텍스트 정보만 저장
      };
      
      await updateDoc(doc(db, 'meetings', docId), updateData);

      alert('회의록 저장 완료!');
      
      // 6. 폼 초기화
      setFile(null);
      setTitle('');
      setParticipants(0);
      setParticipantNames('');
    } catch (error) {
      console.error('Error saving meeting:', error);
      alert(error.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>🎙️ 회의록 생성</h1>
        <button
          onClick={() => router.push('/meetings')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          회의록 목록 보기
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 10 }}>
          <label>제목:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ marginLeft: 10 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>참석자 수:</label>
          <input
            type="number"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            style={{ marginLeft: 10 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>참석자 이름 (쉼표로 구분):</label>
          <input
            type="text"
            value={participantNames}
            onChange={(e) => setParticipantNames(e.target.value)}
            style={{ marginLeft: 10 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>음성 파일:</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginLeft: 10 }}
          />
        </div>

        <button 
          onClick={handleUpload}
          disabled={processing}
          style={{
            padding: '10px 20px',
            backgroundColor: processing ? '#ccc' : '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: processing ? 'not-allowed' : 'pointer'
          }}
        >
          {processing ? '처리 중...' : '회의록 저장'}
        </button>
      </div>
    </main>
  );
}*/