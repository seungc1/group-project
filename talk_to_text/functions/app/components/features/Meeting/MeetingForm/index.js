/**
 * 회의록 생성을 위한 폼 컴포넌트
 * 음성 파일 업로드, 회의 정보 입력, 처리 및 저장 기능을 제공
 */
'use client';

// React 훅과 라우터 임포트
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Firebase 관련 임포트
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// 스타일과 하위 컴포넌트 임포트
import styles from './styles.module.css';
import FileUpload from '../../../common/inputs/FileUpload';
import LoadingButton from '../../../common/buttons/LoadingButton';

export default function MeetingForm() {
  // 라우터 인스턴스 생성
  const router = useRouter();
  
  // 폼 상태 관리
  const [file, setFile] = useState(null); // 선택된 파일
  const [title, setTitle] = useState(''); // 회의 제목
  const [participants, setParticipants] = useState(0); // 참석자 수
  const [participantNames, setParticipantNames] = useState(''); // 참석자 이름
  const [processing, setProcessing] = useState(false); // 처리 중 상태

  /**
   * 날짜를 YYYYMMDD 형식의 문자열로 변환
   * @param {Date} date - 변환할 날짜
   * @returns {string} 포맷된 날짜 문자열
   */
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  /**
   * 파일 업로드 및 회의록 생성 처리
   * 1. 입력값 검증
   * 2. 문서 ID 생성
   * 3. Firestore에 초기 문서 생성
   * 4. 파일 업로드 및 URL 획득
   * 5. 음성 처리 API 호출
   * 6. 결과 데이터 업데이트
   */
  const handleUpload = async () => {
    // 필수 입력값 검증
    if (!file) return alert('파일을 선택하세요');
    if (!title) return alert('제목을 입력하세요');
    if (!participants) return alert('참석자 수를 입력하세요');
    if (!participantNames) return alert('참석자 이름을 입력하세요');

    try {
      setProcessing(true);

      // 문서 ID 생성
      const currentDate = formatDate(new Date());
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9가-힣]/g, '_');
      const docId = `${currentDate}_${sanitizedTitle}_${participants}명`;
      const fileExtension = file.name.split('.').pop();
      const newFileName = `${docId}.${fileExtension}`;

      // Firestore에 초기 문서 생성
      await setDoc(doc(db, 'meetings', docId), {
        title,
        participants: parseInt(participants),
        participantName: participantNames.split(',').map(name => name.trim()),
        createAt: serverTimestamp()
      });

      // 파일 업로드 및 URL 획득
      const storageRef = ref(storage, `audio/${newFileName}`);
      await uploadBytes(storageRef, file);
      const audioUrl = await getDownloadURL(storageRef);
      
      // 음성 처리 API 호출
      const response = await fetch('/api/process-audio', {
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
      
      // API 응답 검증
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

      alert('회의록 저장 완료!');
      router.push('/meetings');
      
    } catch (error) {
      console.error('Error saving meeting:', error);
      alert(error.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  // 폼 UI 렌더링
  return (
    <div className={styles.form}>
      {/* 제목 입력 필드 */}
      <div className={styles.formGroup}>
        <label>제목:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="회의 제목을 입력하세요"
        />
      </div>

      {/* 참석자 수 입력 필드 */}
      <div className={styles.formGroup}>
        <label>참석자 수:</label>
        <input
          type="number"
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          placeholder="참석자 수를 입력하세요"
        />
      </div>

      {/* 참석자 이름 입력 필드 */}
      <div className={styles.formGroup}>
        <label>참석자 이름 (쉼표로 구분):</label>
        <input
          type="text"
          value={participantNames}
          onChange={(e) => setParticipantNames(e.target.value)}
          placeholder="참석자 이름을 쉼표로 구분하여 입력하세요"
        />
      </div>

      {/* 파일 업로드 컴포넌트 */}
      <FileUpload
        onFileSelect={setFile}
        selectedFile={file}
      />

      {/* 저장 버튼 */}
      <LoadingButton
        onClick={handleUpload}
        loading={processing}
        text="회의록 저장"
        loadingText="처리 중..."
      />
    </div>
  );
} 