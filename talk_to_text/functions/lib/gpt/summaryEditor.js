// project-root/lib/gpt/summaryEditor.js

import OpenAI from "openai";

// 환경변수에서 API 키 불러오기
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * requestSummaryEdit_JSON
 * - originalValuesString: "값1\n\n값2\n\n값3\n\n..."
 * - userRequest: "더 간결하게 요약해줘" 같은 요청 문구
 * - GPT에게 “JSON”으로 리턴해 달라고 명시
 * 
 * 반환: JSON 문자열 (예: '{"회의 제목":"편집값1","참여인원":"편집값2",...}')
 */
export async function requestSummaryEdit_JSON(originalValuesString, userRequest) {
  // GPT에 JSON 객체로만 리턴하라고 강하게 지시
  const messages = [
    {
      role: "system",
      content: [
        "당신은 회의 보고서의 각 값(value)만 편집해서 반환하는 비서입니다.",
        "반환형식은 반드시 JSON 객체 형태입니다. 예시: {\"회의 제목\":\"편집된 값1\",\"참여인원\":\"편집된 값2\", ...}",
        "절대로 부가적인 안내문구, 설명, 질문을 포함하지 마세요."
      ].join(" ")
    },
    {
      role: "user",
      content: `
다음은 기존 보고서의 “값(value)” 목록입니다. 각 값 사이에는 빈 줄(\n\n)로 구분되어 있습니다:

${originalValuesString}

위 값들을 “순서를 유지한 채” 다음 요청대로 편집하여 JSON 객체로 반환해 주세요:
"${userRequest}"

반환 예시: {"회의 제목":"편집된 값1","참여인원":"편집된 값2", ...}
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
      stop: null,  // JSON을 제대로 닫을 수 있도록 멈춤 토큰 생략
      n: 1
    });

    // 받아온 GPT 응답 메시지 텍스트 (문자열로 JSON 출력되어야 한다)
    const content = response.choices[0].message.content.trim();
    return content;
  } catch (err) {
    console.error("[requestSummaryEdit_JSON] GPT 호출 실패:", err);
    // 예외 발생 시 빈 JSON으로 리턴하거나, 오류 문구 리턴
    return JSON.stringify({ error: "GPT 요청 중 오류가 발생했습니다." });
  }
}