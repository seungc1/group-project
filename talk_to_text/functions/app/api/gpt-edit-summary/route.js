export const runtime = 'nodejs'

// 1) 파일이 로딩되는지 제일 먼저 찍어 봅니다.
console.log('[API:gpt-edit-summary] route.js 로딩됨');

export async function POST(req) {
  console.log('[API:gpt-edit-summary] POST 진입, OPENAI_API_KEY=', process.env.OPENAI_API_KEY);

  const { original, request } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    console.error('[API] 키 없음');
    return new Response(JSON.stringify({ error: 'API Key가 설정되지 않았습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: '당신은 회의록 요약을 다듬는 조력자입니다.' },
        { role: 'user', content: `기존 요약: ${original}` },
        { role: 'user', content: `요청 사항: ${request}` },
      ],
    }),
  });

  const data = await res.json();
  console.log('[API] GPT 응답 전체:', data);

  if (!res.ok) {
    return new Response(JSON.stringify({ error: data.error?.message || 'API 요청 실패' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = data.choices?.[0]?.message?.content?.trim() ?? '응답 없음';
  return new Response(JSON.stringify({ result }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
