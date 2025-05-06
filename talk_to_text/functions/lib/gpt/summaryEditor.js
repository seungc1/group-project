// functions/lib/gpt/summaryEditor.js

import OpenAI from "openai";

// OpenAI API 키를 환경변수에서 불러와 클라이언트 인스턴스 생성
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * requestSummaryEdit
 * 사용자의 요청에 따라 기존 회의 요약을 수정하는 GPT API 요청 함수
 *
 * @param {string} originalSummary - 기존 요약 내용
 * @param {string} userRequest     - 사용자의 수정 요청 (예: 더 간결하게 바꿔줘)
 * @returns {Promise<string>}      - 수정된 요약 텍스트
 */
export async function requestSummaryEdit(originalSummary, userRequest) {
  // system + user 메시지로 prompt 구성
  const messages = [
    {
      role: "system",
      content: "당신은 회의 요약을 다듬어 주는 비서입니다.",
    },
    {
      role: "user",
      content: `
다음은 회의 요약입니다:

"${originalSummary}"

위 내용을 다음 요청에 맞춰 수정해주세요:
"${userRequest}"

수정된 요약만 반환해 주세요.
      `.trim(),
    },
  ];

  try {
    // v4 문법: openai.chat.completions.create
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
    });

    // 첫 번째 선택지의 메시지 내용 반환
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("[requestSummaryEdit] GPT API 호출 실패:", err);
    return "GPT 요청 중 오류가 발생했습니다.";
  }
}
