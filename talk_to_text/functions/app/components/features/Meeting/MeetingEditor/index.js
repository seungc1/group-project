'use client';

import { useState } from 'react';
import styles from './style.module.css';
import { requestSummaryEdit } from '@/lib/gpt/summaryEditor';
import { updateMeetingSummary } from '@/lib/firestore/updateSummary';
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
            const result = await requestSummaryEdit(editableSummary, input);
            setGenerated(result);
        } catch (err) {
            console.error(err);
            setGenerated('오류 발생');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* 왼쪽: 직접 수정 영역 */}
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
                    onSuccess={() => console.log('저장 완료 후 콜백')}
                />
            </div>

            {/* 오른쪽: GPT 기반 수정 영역 */}
            <div className={`${styles.rightPane} ${styles.summarySection}`}>
                <h3>GPT 요약 수정 요청</h3>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="예: 더 간결하게 수정해줘" ㄴㄴ
                    rows={4}
                />
                <button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? '요청 중...' : 'GPT에게 수정 요청'}
                </button>

                {generated && (
                    <>
                        <h4>수정된 요약</h4>
                        <pre>{generated}</pre>
                        <button
                            onClick={async () => {
                                await updateMeetingSummary(meetingId, generated);
                                alert('GPT 수정 결과가 저장되었습니다.');
                            }}
                        >
                            이걸로 저장하기
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
