// functions/lib/gpt/summaryEditor.js

import OpenAI from "openai";

// OpenAI API 키는 환경변수에서 불러옵니다.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * requestSummaryEdit
 * - 기존 회의록(보고서) 양식은 절대 손대지 않고
 *   “[]”로 묶인 필드명과 콜론 구조를 그대로 유지하면서
 *   userRequest에 맞춰 필드 뒤의 내용만 수정합니다.
 * - 반환 시 오직 수정된 보고서 텍스트만 내보내며,
 *   그 외 다른 문장(설명, 안내, 추가 질문 등)은 절대 포함하지 않습니다.
 *
 * @param {string} originalReport  기존 보고서 전체 텍스트
 * @param {string} userRequest     사용자의 수정 요청(예: “간결하게 요약해줘”)
 * @returns {Promise<string>}       수정된 보고서 텍스트 전체
 */
export async function requestSummaryEdit(originalReport, userRequest) {
  const messages = [
    {
      role: "system",
      content: [
        "당신은 회의록(보고서) 편집 비서입니다.",
        "아래 텍스트에서 “[]”로 묶인 필드명과 콜론(“:”) 구조를 절대 바꾸지 말고," +
        " 오직 그 뒤의 내용 부분만 userRequest에 맞춰 수정하세요.",
        "반환값은 오직 수정된 보고서 텍스트 전체여야 하며, “추가 안내”나 “질문 유도” 같은 부가 문장은 절대 포함하지 마세요."
      ].join(" ")
    },
    {
      role: "user",
      content: [
        "=== 기존 보고서 (양식 절대 변경 금지) ===",
        "```plaintext",
        originalReport.trim(),
        "```",
        `위 양식을 그대로 두고, “${userRequest}” 요청에 따라 ‘[]’ 뒤의 내용만 바꿔서`,
        "오직 수정된 보고서 텍스트만 출력해주세요."
      ].join("\n")
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.2,
      top_p: 0.8,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 1200
    });

    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("[requestSummaryEdit] GPT 호출 실패:", err);
    return "GPT 요청 중 오류가 발생했습니다.";
  }
}