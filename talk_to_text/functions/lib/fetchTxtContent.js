// lib/fetchTxtContent.js

export async function fetchTxtContent(url) {
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error(`파일 다운로드 실패 (HTTP ${response.status})`);
  }

  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.includes('text/plain')) {
    throw new Error(`지원하지 않는 파일 형식입니다. (Content-Type: ${contentType})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new TextDecoder('utf-8').decode(arrayBuffer);
}
