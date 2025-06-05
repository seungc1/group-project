// project-root/lib/utils/reportParser.js

/**
 * parseReport(text)
 * - 입력: 전체 보고서 문자열 
 *   e.g) "[회의 제목]: 할 일 테스트 최종\n[참여인원]: 주지환\n…"
 * - 출력: { "회의 제목": "할 일 테스트 최종", "참여인원": "주지환", … }
 */
export function parseReport(text) {
  const lines = text.split("\n");
  const result = {};
  let currentKey = null;
  let currentBuf = [];

  for (let line of lines) {
    // “[필드명]: 내용” 형태 패턴
    const m = line.match(/^\[([^\]]+)\]:\s*(.*)$/);
    if (m) {
      // 이전 필드 버퍼 있으면 저장
      if (currentKey !== null) {
        result[currentKey] = currentBuf.join("\n").trim();
      }
      // 새 필드 시작
      currentKey = m[1];             
      const afterColon = m[2] || ""; 
      currentBuf = [afterColon];
    } else {
      // “[필드]:”이 아닌 일반 텍스트 라인 → 현재 키 버퍼 이어붙이기
      if (currentKey !== null) {
        currentBuf.push(line);
      }
    }
  }

  // 마지막 필드 저장
  if (currentKey !== null) {
    result[currentKey] = currentBuf.join("\n").trim();
  }

  return result;
}

/**
 * rebuildReport(parsedObj)
 * - 입력: { "회의 제목": "값1", "참여인원": "값2", … }
 * - 출력: “[회의 제목]: 값1\n\n[참여인원]: 값2\n\n…” 문자열
 */
export function rebuildReport(parsedObj) {
  // 객체 키 순서를 보장하기 위해 Object.entries() 이용
  return Object.entries(parsedObj)
    .map(([field, value]) => `[${field}]: ${value}`)
    .join("\n\n");
}