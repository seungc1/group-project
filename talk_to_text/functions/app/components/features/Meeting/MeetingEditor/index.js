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
            {/* 왼쪽: 직접 수정 가능 요약 영역 */}
            <div className={`${styles.leftPane} ${styles.summarySection}`}>
                <h3>현재 요약 (수정 가능)</h3>
                <textarea
                    value={editableSummary}
                    onChange={(e) => setEditableSummary(e.target.value)}
                    className={styles.leftPaneTextarea}
                />
                <SaveButton
                    meetingId={meetingId}
                    newSummary={editableSummary}
                    onSuccess={() => console.log('수정 저장 완료')}
                />
            </div>

            {/* 오른쪽: GPT 수정 요청 + 결과 확인 */}
            <div className={`${styles.rightPane} ${styles.summarySection}`}>
                <h3>GPT 요약 수정 요청</h3>

                {/* GPT 응답 표시 영역 */}
                {generated && (
                    <div className={styles.gptResultBox}>
                        <h4>GPT가 제안한 수정 요약</h4>
                        <pre className={styles.generatedPreview}>{generated}</pre>
                        <div className={styles.actionRow}>
                            <button onClick={handleApply}>변경사항 저장</button>
                            <button onClick={handleCancel}>취소</button>
                        </div>
                    </div>
                )}

                {/* 채팅 입력창 스타일 */}
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="예: 더 구체적으로 작성해줘"
                    className={styles.chatInput}
                    rows={1}
                />
                <button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? '요청 중...' : 'GPT에게 수정 요청'}
                </button>
            </div>
        </div>
    );
}
