'use client';

import { useState } from 'react';
import styles from './style.module.css';
import SaveButton from '@/components/common/buttons/SaveButton';

export default function MeetingEditor({ meeting, meetingId }) {
  const [editableSummary, setEditableSummary] = useState(meeting.summary || '');
  const [input, setInput] = useState('');
  const [generated, setGenerated] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gpt-edit-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original: meeting.summary,
          userRequest: input
        }),
      });
      const { result, error } = await res.json();
      if (error) throw new Error(error);
      setGenerated(result);
    } catch (err) {
      console.error(err);
      setGenerated('GPT 요청 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    setEditableSummary(generated);
    setGenerated('');
    setInput('');
  };

  const handleCancel = () => {
    setGenerated('');
    setInput('');
  };

  return (
    <div className={styles.container}>
      {/* 왼쪽: 직접 수정 가능한 요약 */}
      <div className={`${styles.leftPane} ${styles.summarySection}`}>
        <h3>현재 요약</h3>

        {/* 스크롤이 필요한 부분만 감싸기 */}
        <div className={styles.scrollContainer}>
          <textarea
            className={styles.textarea}
            value={editableSummary}
            onChange={e => setEditableSummary(e.target.value)}
          />
        </div>

        {/* 언제나 보이는 저장 버튼 */}
        <SaveButton
          meetingId={meetingId}
          newSummary={editableSummary}
          onSuccess={() => console.log('수정 저장 완료')}
        />
      </div>

      {/* 오른쪽: GPT 수정 요청 */}
      <div className={`${styles.rightPane} ${styles.summarySection}`}>
        <h3>GPT 요약 수정 요청</h3>

        <div className={styles.gptArea}>
          {/* 결과 영역만 스크롤! */}
          <div className={styles.scrollContainer}>
            {generated ? (
              <div className={styles.gptResultBox}>
                <h4>GPT가 제안한 수정 요약</h4>
                <pre className={styles.generatedPreview}>{generated}</pre>
                <div className={styles.actionRow}>
                  <button onClick={handleApply}>변경사항 저장</button>
                  <button onClick={handleCancel}>취소</button>
                </div>
              </div>
            ) : (
              <div className={styles.placeholderText}>
                GPT가 제안한 수정 요약이 여기에 표시됩니다.
              </div>
            )}
          </div>

          {/* 항상 보이는 채팅 입력 행 */}
          <div className={styles.chatRow}>
            <textarea
              className={styles.chatInput}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="GPT에게 요청할 내용을 입력하세요"
              rows={1}
            />
            <button
              className={styles.chatButton}
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? '요청 중…' : '요청'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}