'use client';

import { useState, useEffect } from 'react';
import styles from './style.module.css';
import SaveButton from '@/components/common/buttons/SaveButton';
import { useRouter } from 'next/navigation';

export default function MeetingEditor({
  meeting,
  userId,
  projectId,
  meetingId,
}) {
  const router = useRouter();

  // 편집 중인 요약, GPT 채팅 입력, GPT 결과, 로딩 상태
  const [editableSummary, setEditableSummary] = useState(meeting.summary || '');
  const [input, setInput] = useState('');
  const [generated, setGenerated] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // “저장”과 “초기 상태로 되돌리기” 버튼 활성화 여부
  const [isModified, setIsModified] = useState(false);

  // editableSummary가 원본(meeting.summary)과 달라지면 isModified = true
  useEffect(() => {
    const original = meeting.summary || '';
    setIsModified(editableSummary !== original);
  }, [editableSummary, meeting.summary]);

  /**
   * GPT 편집 API 호출
   * - original: editableSummary
   * - userRequest: input
   * 응답으로 { result: '<편집된 텍스트>' } 형태를 받으면 setGenerated
   */
  const handleGenerate = async () => {
    if (isGenerating) return;
    if (input.trim() === '') {
      alert('먼저 GPT에게 요청할 내용을 입력하세요.');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerated('');

      const payload = {
        original: editableSummary,
        userRequest: input.trim(),
      };

      const response = await fetch('/api/gpt-edit-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorJson = await response.json();
        throw new Error(errorJson.error || '서버 에러');
      }

      const data = await response.json();
      setGenerated(data.result || '');
      setInput('');
    } catch (err) {
      console.error('❌ [handleGenerate] 에러 발생:', err);
      alert('GPT 요청 중 에러가 발생했습니다: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // “변경사항 저장” 클릭 시 generated를 editableSummary로 덮어씀
  const handleApply = () => {
    setEditableSummary(generated);
  };

  // “취소” 클릭 시 generated와 input 리셋
  const handleCancel = () => {
    setGenerated('');
    setInput('');
  };

  // “초기 상태로 되돌리기” 클릭 시 editableSummary만 원본으로 복원
  const handleReset = () => {
    setEditableSummary(meeting.summary || '');
    // generated, input은 그대로 유지
  };

  return (
    <div className={styles.container}>
      {/* ───────── 왼쪽 패널: 직접 편집 가능한 요약 ───────── */}
      <div className={`${styles.leftPane} ${styles.summarySection}`}>
        <h3>현재 회의록</h3>
        <div className={styles.scrollContainer}>
          <textarea
            className={styles.textarea}
            value={editableSummary}
            onChange={(e) => setEditableSummary(e.target.value)}
          />
        </div>

        <div className={styles.buttonRow}>
          {console.log('▶ props to SaveButton:', { userId, projectId, meetingId })}
          {/* SaveButton에 userId, projectId, meetingId를 분리된 prop으로 넘김 */}
          <SaveButton
            className={styles.saveButton}
            userId={userId}
            projectId={projectId}
            meetingId={meetingId}
            newSummary={editableSummary}
            disabled={!isModified}
            onSuccess={() => {
            alert('수정이 완료되었습니다');
            router.back();
}}
          />
          <button
            onClick={handleReset}
            className={styles.resetButton}
            disabled={!isModified}
          >
            초기 상태로 되돌리기
          </button>
        </div>
      </div>

      {/* ───────── 오른쪽 패널: GPT 수정 요청 ───────── */}
      <div className={`${styles.rightPane} ${styles.summarySection}`}>
        <h3>회의록 수정 요청</h3>

        <div className={styles.gptArea}>
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
                AI가 제안한 수정 요약이 여기에 표시됩니다.
              </div>
            )}
          </div>

          <div className={styles.chatRow}>
            <textarea
              className={styles.chatInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="AI에게 요청할 내용을 입력하세요"
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
