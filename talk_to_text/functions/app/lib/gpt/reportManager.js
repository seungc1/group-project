import { parseReport, rebuildReport } from "../utils/reportParser";
import { requestSummaryEdit } from "./summaryEditor";

/**
 * editEntireReport
 *  - originalReportText: 전체 보고서(“[회의 제목]: …\n\n[참여인원]: …\n\n…”) 문자열
 *  - userRequest        : “어떤 방식으로 편집해달라”는 지시 (예: “더 간결하게 해줘”, “[참고사항]을 더 구체적으로 작성해줘”)
 *
 * 1) parseReport(originalReportText) → { field1: value1, field2: value2, … }
 * 2) Object.values(parsedObj).join("\n\n")하여 “값만” 합친 문자열 → valuesToEdit
 * 3) requestSummaryEdit(valuesToEdit, userRequest) 호출 → editedValuesString (예: “편집된값1\n\n편집된값2\n\n편집된값3…”)
 * 4) editedValuesString을 “\n\n” 기준으로 split → editedArray
 * 5) parsedObj의 키 순서대로editedArray를 다시 객체(newParsed)로 매핑
 * 6) rebuildReport(newParsed) → “[회의 제목]: 편집된값1\n\n[참여인원]: 편집된값2\n\n…” 완성 문자열 반환
 */
export async function editEntireReport(originalReportText, userRequest) {
  // 1) 보고서 파싱
  const parsed = parseReport(originalReportText);

  // 2) “값(value)들만” 순서대로 합침
  const valuesToEdit = Object.values(parsed).join("\n\n");

  // 3) GPT에게 “값(value)들”만 편집 요청
  const editedValuesString = await requestSummaryEdit(valuesToEdit, userRequest);

  // 4) GPT가 준 편집 문자열을 배열로 분리
  //    ("값1\n\n값2\n\n값3..." → ["값1","값2","값3",...])
  const editedArray = editedValuesString
    .split("\n\n")
    .map((s) => s.trim());

  // 5) 원본 parsed 객체의 키 순서대로 다시 매핑
  const keys = Object.keys(parsed);
  const newParsed = {};
  keys.forEach((key, idx) => {
    newParsed[key] = editedArray[idx] || "";
  });

  // 6) 최종 보고서 문자열 생성 후 반환
  return rebuildReport(newParsed);
}