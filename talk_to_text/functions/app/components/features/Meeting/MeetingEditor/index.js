'use client';

import { useState } from 'react';
import styles from '@/app/page.module.css';
import { requestSummaryEdit } from '@/lib/gpt/summaryEditor';
import { updateMeetingSummary } from '../../../../../lib/firestore/updateSummary';

export default function MeetingEditor({ meeting, meetingId }) {
  const [input, setInput] = useState('');
  const [generated, setGenerated] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    try {
      const result = await requestSummaryEdit(meeting.summary, input);
      setGenerated(result);
    } catch (err) {
      console.error(err);
      setGenerated('오류 발생');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateMeetingSummary(meetingId, generated);
      alert('수정된 요약이 저장되었습니다.');
    } catch (error) {
      alert('저장 실패: ' + error.message);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
      {/* 왼쪽 요약 */}
      <div className={styles.meetingSummaryBox}>
        <h3>현재 요약</h3>
        <pre>{meeting.summary || '요약이 없습니다.'}</pre>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
          생성일: {meeting.createAt?.toDate?.().toISOString() || '알 수 없음'}
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
  );
}