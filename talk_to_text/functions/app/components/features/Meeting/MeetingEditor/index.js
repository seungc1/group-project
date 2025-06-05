// 파일 경로: project-root/app/components/features/Meeting/MeetingEditor/index.js
'use client';

import { useState } from "react";
import styles from "./style.module.css"; // 동일 디렉토리의 style.module.css를 가져옵니다
import SaveButton from "@/components/common/buttons/SaveButton";

export default function MeetingEditor({ meeting, meetingId }) {
  // meeting.summary: 백엔드에서 받아온 기존 요약 (문자열)
  // meetingId: URL-safe 인코딩된 회의 문서 ID
  const [editableSummary, setEditableSummary] = useState(meeting.summary || "");
  const [input, setInput] = useState("");        // GPT에게 요청할 텍스트
  const [generated, setGenerated] = useState(""); // GPT가 반환한 수정된 요약
  const [isGenerating, setIsGenerating] = useState(false);

  // “GPT에게 수정 요청” 버튼 클릭 시 호출
  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/gpt-edit-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original: meeting.summary,
          userRequest: input,
        }),
      });
      const { result, error } = await res.json();
      if (error) throw new Error(error);
      setGenerated(result);   // GPT가 보낸 수정된 전체 보고서(값들) 문자열
    } catch (err) {
      console.error(err);
      setGenerated("GPT 요청 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  // “변경사항 저장” 클릭 시: 좌측 textarea에 GPT가 보낸 수정본을 덮어쓰기
  const handleApply = () => {
    setEditableSummary(generated);
    setGenerated("");
    setInput("");
  };

  // “취소” 클릭 시: GPT 결과 박스 숨김
  const handleCancel = () => {
    setGenerated("");
    setInput("");
  };

  return (
    <div className={styles.container}>
      {/* ─────────────────────────────────────────────────────────────
          왼쪽 패널: 직접 수정 가능한 “현재 요약” 영역
      ───────────────────────────────────────────────────────────── */}
      <div className={`${styles.leftPane} ${styles.summarySection}`}>
        <h3>현재 요약</h3>
        {/* 스크롤 가능한 영역 (textarea) */}
        <div className={styles.scrollContainer}>
          <textarea
            className={styles.textarea}
            value={editableSummary}
            onChange={(e) => setEditableSummary(e.target.value)}
          />
        </div>
        {/* 항상 보이는 “요약 저장” 버튼 */}
        <SaveButton
          className={styles.saveButton}
          meetingId={meetingId}
          newSummary={editableSummary}
          onSuccess={() => console.log("수정 저장 완료")}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          오른쪽 패널: GPT “요약 수정 요청” 영역
      ───────────────────────────────────────────────────────────── */}
      <div className={`${styles.rightPane} ${styles.summarySection}`}>
        <h3>GPT 요약 수정 요청</h3>
        <div className={styles.gptArea}>
          {/* 1) 결과 영역(스크롤 가능): GPT 응답이 없으면 플레이스홀더, 있으면 결과 박스 */}
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

          {/* 2) 항상 보이는 채팅 입력(요청) 행 */}
          <div className={styles.chatRow}>
            <textarea
              className={styles.chatInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="GPT에게 요청할 내용을 입력하세요"
              rows={1}
            />
            <button
              className={styles.chatButton}
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? "요청 중…" : "요청"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}