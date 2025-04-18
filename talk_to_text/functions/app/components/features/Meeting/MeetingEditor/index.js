'use client';

import { useState } from 'react';
import styles from './style.module.css';
import { requestSummaryEdit } from '@/lib/gpt/summaryEditor'; // GPT 요약 요청 함수
import { updateMeetingSummary } from '@/lib/firestore/updateSummary'; // Firestore 업데이트 함수
import SaveButton from '@/components/common/buttons/SaveButton'; // 저장 버튼 컴포넌트

/**
 * MeetingEditor 컴포넌트
 * - 회의 요약을 직접 수정하거나 GPT를 통해 수정 요청할 수 있음
 * - 수정된 내용을 Firestore에 저장 가능
 */

export default function MeetingEditor({ meeting, meetingId }) {
    const [editableSummary, setEditableSummary] = useState(meeting.summary || ''); // 직접 수정할 요약 상태
    const [input, setInput] = useState('');               // GPT 요청 입력
    const [generated, setGenerated] = useState('');       // GPT 응답 요약
    const [isGenerating, setIsGenerating] = useState(false); // 요청 중 여부

    // GPT에게 수정 요청하는 함수
    const handleGenerate = async () => {
        if (!input.trim()) return;
        setIsGenerating(true);
        try {
            const result = await requestSummaryEdit(editableSummary, input); // GPT에 요청
            setGenerated(result); // GPT 응답 저장
        } catch (err) {
            console.error(err);
            setGenerated('오류 발생');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* 왼쪽: 수동 요약 수정 영역 */}
            <div className={`${styles.leftPane} ${styles.summarySection}`}>
                <h3>현재 요약 (수정 가능)</h3>
                <textarea
                    value={editableSummary}
                    onChange={(e) => setEditableSummary(e.target.value)}
                    className={styles.leftPaneTextarea}
                />

                {/* 직접 입력한 요약 저장 버튼 */}
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
                    placeholder="예: 더 간결하게 수정해줘"
                    rows={4}
                />
                <button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? '요청 중...' : 'GPT에게 수정 요청'}
                </button>

                {/* GPT 결과가 생성되면 하단에 표시 */}
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
