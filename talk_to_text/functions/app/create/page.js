'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styles from '../page.module.css';
import PageHeader from '@/components/pageHeader';

export default function CreateMeeting() {
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

      const currentDate = formatDate(new Date());
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9가-힣]/g, '_');
      const docId = `${currentDate}_${sanitizedTitle}_${participants}명`;
      const fileExtension = file.name.split('.').pop();
      const newFileName = `${docId}.${fileExtension}`;

      await setDoc(doc(db, 'meetings', docId), {
        title,
        participants: parseInt(participants),
        participantName: participantNames.split(',').map(name => name.trim()),
        createAt: serverTimestamp()
      });

      const storageRef = ref(storage, `audio/${newFileName}`);
      await uploadBytes(storageRef, file);
      const audioUrl = await getDownloadURL(storageRef);
      
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
      
      if (!response.ok) {
        throw new Error(result.error || result.details || '음성 처리 중 오류가 발생했습니다');
      }

      if (!result.success) {
        throw new Error(result.error || '음성 처리 중 오류가 발생했습니다');
      }
      
      const textinfo = result.transcript.map(segment => ({
        speaker: segment.speaker,
        text: segment.text
      }));

      const updateData = {
        audioUrl,
        audioFileName: newFileName,
        textinfo,
        keywords: result.keywords,
        summary: result.summary,
        summaryDownloadUrl: result.summaryDownloadUrl
      };
      
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

  return (
    <div className={styles['examples-upcoming-web']}>
      <main className={styles['main-content']}>
        <PageHeader title="회의록 생성"/>

        <div className={styles.carousel}>
          <div className={styles['carousel-item']}>
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>제목:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="회의 제목을 입력하세요"
                />
              </div>

              <div className={styles.formGroup}>
                <label>참석자 수:</label>
                <input
                  type="number"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  placeholder="참석자 수를 입력하세요"
                />
              </div>

              <div className={styles.formGroup}>
                <label>참석자 이름 (쉼표로 구분):</label>
                <input
                  type="text"
                  value={participantNames}
                  onChange={(e) => setParticipantNames(e.target.value)}
                  placeholder="참석자 이름을 쉼표로 구분하여 입력하세요"
                />
              </div>

              <div className={styles.formGroup}>
                <label>음성 파일:</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              <button 
                className={styles.submitButton}
                onClick={handleUpload}
                disabled={processing}
              >
                {processing ? '처리 중...' : '회의록 저장'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 