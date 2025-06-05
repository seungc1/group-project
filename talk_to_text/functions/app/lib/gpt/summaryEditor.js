// project-root/lib/gpt/summaryEditor.js

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * requestSummaryEdit(originalValuesString, userRequest)
 * - originalValuesString: "값1\n\n값2\n\n값3\n\n..."
 * - userRequest: "더 간결하게 요약해줘" 같은 편집 지시
 * - 반환: “값1(편집됨)\n\n값2(편집됨)\n\n값3(편집됨)…”
 */
export async function requestSummaryEdit(originalValuesString, userRequest) {
  const messages = [
    {
      role: "system",
      content: [
        "당신은 회의 요약을 다듬어 주는 비서입니다.",
        "반환값은 오직 수정된 요약 텍스트만 입니다.",
        "추가 안내문, 질문, 형식 수정 지시문은 절대 포함하지 마세요."
      ].join(" ")
    },
    {
      role: "user",
      content: `
다음은 기존 보고서의 “값(value)” 목록입니다. 각 값 사이에는 빈 줄(\n\n)로 구분되어 있습니다:

${originalValuesString}

위의 값들을 "순서를 절대 변경하지 않고" 다음 요청대로 편집해서 반환해 주세요:
"${userRequest}"

반환 형식: 값1\n\n값2\n\n값3…  
(절대로 부가적인 안내문을 포함하지 말고, 값들만 순서대로 반환해주세요)
      `.trim(),
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.5,
      top_p: 0.8,
      frequency_penalty: 0.4,
      presence_penalty: 0.3,
      max_tokens: 1500,
      // stop 파라미터를 제거했습니다. 
      // 아래 줄을 지우거나 주석 처리하세요:
      // stop: ["\n\n"],  
      n: 1
    });

    // GPT가 반환한 텍스트 전체를 잘라내지 않고 그대로 리턴
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("[requestSummaryEdit] GPT API 호출 실패:", err);
    return "GPT 요청 중 오류가 발생했습니다.";
  }
}