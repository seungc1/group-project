// 파일 위치: project-root/lib/gpt/summaryEditor.js

import OpenAI from "openai";

// OpenAI API 키를 환경변수에서 불러와 클라이언트 인스턴스 생성
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * requestSummaryEdit(originalValuesString, userRequest)
 * - originalValuesString: 편집 대상 값들의 문자열 (값1\n\n값2\n\n값3…)
 * - userRequest: 사용자의 지시문(예: "더 간결하게 요약해줘" 등)
 * - 반환: “값1(편집됨)\n\n값2(편집됨)\n\n값3(편집됨)…”
 *
 * - 절대 안내문구, 추가 질문, 형식 자체를 건드리는 내용 금지!
 */
export async function requestSummaryEdit(originalValuesString, userRequest) {
  const messages = [
    {
      role: "system",
      content: [
        "당신은 회의 보고서의 [ ] 안에 들어가는 “값(value)”들을 다듬어 주는 비서입니다.",
        "반환값은 오직 “편집된 값”들만이어야 합니다.",
        "절대로 [필드명]: 형식, 혹은 자체 문서의 양식을 변경하지 마세요.",
        "“추가 요청이 있으면 알려주세요” 같은 안내문구를 절대 포함하지 마세요."
      ].join(" ")
    },
    {
      role: "user",
      content: `
다음은 기존 보고서의 “값(value)” 목록입니다. 각 값(value) 사이에는 빈 줄(\n\n)로 구분되어 있습니다:

${originalValuesString}

위 “값(value)”들을 그대로 “순서를 유지한 채” 다음 요청대로 편집하여 돌려주세요:
"${userRequest}"

반환 형식: 값1\n\n값2\n\n값3...  (절대로 추가 안내문이나 질문 금지)
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
      max_tokens: 1200,
      // stop 조건: 빈 줄 두 개가 나오면 멈추도록
      //stop: ["\n\n"],
      n: 1,
    });

    // 첫 번째 선택지의 메시지 내용만 리턴
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("[requestSummaryEdit] GPT API 호출 실패:", err);
    return "GPT 요청 중 오류가 발생했습니다.";
  }
}