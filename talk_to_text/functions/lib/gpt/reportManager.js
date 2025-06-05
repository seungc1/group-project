// project-root/lib/gpt/reportManager.js

import { parseReport, rebuildReport } from "@/utils/reportParser";
import { requestSummaryEdit_JSON } from "@/summaryEditor";

/**
 * editEntireReport_JSON
 * - originalReportText: 전체 보고서 “[필드]: 값\n\n…” 문자열
 * - userRequest: “더 간결하게 요약해줘” 같은 요청
 * 
 * 동작:
 *   1) parseReport(originalReportText) → { "회의 제목": ..., "참여인원": ..., … }
 *   2) Object.values(parsed) 배열을 "\n\n"으로 join → originalValuesString
 *   3) requestSummaryEdit_JSON(originalValuesString, userRequest) 호출 → JSON 문자열 반환
 *   4) JSON.parse()로 객체화 → editedParsedObj
 *   5) rebuildReport(editedParsedObj) → “[필드]: 편집된 값\n\n…” 최종 보고서
 */
export async function editEntireReport_JSON(originalReportText, userRequest) {
  // 1) 보고서 파싱 → 필드별 값만 객체로 분리
  const parsed = parseReport(originalReportText);

  // 2) “값(value)”들만 뽑아서 하나의 문자열로 합침
  const valuesToEdit = Object.values(parsed).join("\n\n");

  // 3) GPT에 JSON 형태로 요청
  const jsonString = await requestSummaryEdit_JSON(valuesToEdit, userRequest);

  let editedObj = {};
  try {
    editedObj = JSON.parse(jsonString);
  } catch (parseErr) {
    console.error("[editEntireReport_JSON] GPT 응답 JSON 파싱 실패:", parseErr, "\n응답:", jsonString);
    // 파싱 실패하면 원본 parsed를 그대로 리턴하거나, 빈 값 처리
    editedObj = parsed;
  }

  // 4) `{ "회의 제목": "편집값1", "참여인원": "편집값2", … }` → “[필드]: 편집값\n\n…” 형태로 조립
  const finalReport = rebuildReport(editedObj);
  return finalReport;
}