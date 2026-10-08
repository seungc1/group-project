import OpenAI from "openai";

// OpenAI 초기화 (환경변수에 API 키 설정되어 있어야 합니다)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * requestReportEdit
 * - originalReport: "[회의 제목]: ...\n\n[참여인원]: ...\n\n..."
 * - userRequest: 사용자가 원하는 편집 지시(예: "더 간결하게 요약해줘", "참여인원 세부 내용 추가해줘" 등)
 * 
 * → 반환값: 라벨은 건드리지 않고, 라벨 뒤 텍스트만 편집하여 동일한 보고서 형식(한 줄씩 띄어쓴 형태)으로 리턴
 */
export async function requestReportEdit(originalReport, userRequest) {
  // 1) system 메시지: 라벨(대괄호) 절대 미변경, 라벨 사이 빈 줄 유지,
  //    반환 형식 엄격히 보고서 전체 텍스트만
  const systemPrompt = [
    "당신은 회의록 편집 전문 비서입니다.",
    "대괄호로 감싸진 필드명(예: [회의 제목], [참여인원], [회의일시] 등)은 절대로 수정하거나 삭제하지 마세요.",
    "각 라벨(필드)과 라벨 사이에는 반드시 한 줄 이상의 빈 줄(공백 행)을 유지해야 합니다.",
    "반드시 반환 형식은 입력과 동일한 보고서 포맷(라벨→콜론→본문)이어야 하며,",
    "라벨 뒤의 실제 내용(콜론 이후)만 편집해서 리턴해주세요.",
    "추가 안내문이나 질문(예: '추가 요청이 있으면 알려주세요')은 절대로 포함하지 마세요.",
    "반환값에 오직 최종 편집된 보고서 텍스트만 있도록 해주세요."
  ].join(" ");

  // 2) user 메시지: 원본 보고서와 userRequest를 함께 전달
  //    → 이때도 “라벨 사이 빈 줄 유지”를 강조적으로 언급
  const userPrompt = `
다음은 전체 회의 보고서입니다.
(아래 라벨들은 반드시 고정되고, 콜론 뒤의 텍스트만 수정되어야 합니다.)
또한, 라벨과 라벨 사이에 빈 줄(한 줄 띄움)을 반드시 그대로 유지해주세요.

${originalReport}

위 보고서를 아래 요청에 따라 편집해 주세요:
"${userRequest}"

- 출력 포맷:
  [회의 제목]: (편집된 텍스트)

  [참여인원]: (편집된 텍스트)

  [회의일시]: (편집된 텍스트)

  ...

※ 절대로 대괄호로 감싼 라벨이나 전체 형식을 변경하지 말고, 빈 줄도 그대로 유지하며
   본문 내용(콜론 뒤)만 바꾸어 리턴해 주세요.
  `.trim();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt   },
      ],
      temperature: 0.5,
      top_p: 0.8,
      frequency_penalty: 0.4,
      presence_penalty: 0.3,
      max_tokens: 1500,
      // stop 파라미터는 따로 지정하지 않아도 됩니다.
    });

    // GPT가 반환한 편집된 보고서 문자열을 그대로 리턴
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("[requestReportEdit] GPT 호출 실패:", err);
    return "GPT 요청 중 오류가 발생했습니다.";
  }
}
