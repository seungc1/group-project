'use client';

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
}
