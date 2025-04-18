'use client';

import { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/ui/layout/Header';
import styles from '@/app/page.module.css';
import { useMeeting } from '@/hooks/useMeeting'; 

export default function aiEditMeetingNote({ params }) {
  const meetingId = params.id;
  const { meeting, loading, error } = useMeeting(meetingId); 
  const [input, setInput] = useState('');
  const [generated, setGenerated] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim() || !meeting) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gpt-edit-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original: meeting.summary, request: input }),
      });
      const data = await res.json();
      setGenerated(data.result || 'GPT 응답 없음');
    } catch (err) {
      console.error(err);
      setGenerated('오류 발생');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'meetings', meetingId), {
        summary: generated
      });
      alert('수정된 요약이 저장되었습니다.');
    } catch (error) {
      alert('저장 실패: ' + error.message);
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>불러오는 중...</p>;
  if (error || !meeting) return <p style={{ padding: '20px' }}>{error || '회의 데이터를 불러오지 못했습니다.'}</p>;

  // createAt이 Timestamp 객체이므로 문자열로 변환
  const createdDate = meeting.createAt?.toDate?.().toISOString();

  return (
    <>
      <Header title="회의록 수정" />
      <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
        {/* 왼쪽 요약 */}
        <div className={styles.meetingSummaryBox}>
          <h3>현재 요약</h3>
          <pre>{meeting.summary || '요약이 없습니다.'}</pre>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
            생성일: {createdDate || '알 수 없음'}
          </p>
        </div>

        {/* 오른쪽 수정 영역 */}
        <div className={styles.meetingEditBox}>
          <h3>GPT 요약 수정 요청</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예: 더 간결하게 수정해줘"
            rows={4}
          />
          <button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? '요청 중...' : 'GPT에게 수정 요청'}
          </button>

          {generated && (
            <>
              <h4>수정된 요약</h4>
              <pre>{generated}</pre>
              <button onClick={handleSave}>이걸로 저장하기</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
