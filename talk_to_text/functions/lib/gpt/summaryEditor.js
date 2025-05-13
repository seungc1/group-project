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
  // 1) system 메시지에 “오직 수정된 요약만 반환, 부가 안내문 금지” 지시를 추가
  // 2) API 호출에 stop 파라미터를 넣어 불필요한 후속 텍스트 생성 차단
  const messages = [
    {
      role: "system",
      content: [
        "당신은 회의 요약을 다듬어 주는 비서입니다.",
        "반환값은 오직 수정된 요약 텍스트만 입니다.",
        "“추가 요청이 있으면 알려주세요” 같은 안내 문구는 절대 포함하지 마세요."
      ].join(" ")
    },
    {
      role: "user",
      content: `
다음은 기존 회의 요약입니다:

"${originalSummary}"

위 내용을 다음 요청에 맞춰 수정해주세요:
"${userRequest}"

수정된 요약만 반환해 주세요.
      `.trim(),
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.5,         // 좀 더 안정된 출력
      top_p: 0.8,               // 확률 상위 80%만 고려
      frequency_penalty: 0.4,   // 반복 억제
      presence_penalty: 0.3,    // 새로운 표현 유도
      max_tokens: 1000,
      stop: ["\n\n"],
      n: 1
    });
    

    // 첫 번째 선택지의 메시지 내용만 리턴
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("[requestSummaryEdit] GPT API 호출 실패:", err);
    return "GPT 요청 중 오류가 발생했습니다.";
  }
}
