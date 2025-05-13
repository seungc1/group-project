export async function requestSummaryEdit(original, request) {
    const res = await fetch('/api/gpt-edit-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ original, request }),
    });
    const data = await res.json();
    return data.result || 'GPT 응답 없음';
  }