// functions/app/lib/googleCalendar.js 실제 Google API 호출 코드

export async function addEventToGoogleCalendar(accessToken, eventData) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: eventData.title,
      description: eventData.description || '',
      start: {
        dateTime: eventData.start,
        timeZone: 'Asia/Seoul',
      },
      end: {
        dateTime: eventData.end,
        timeZone: 'Asia/Seoul',
      },
    }),
  });

  if (!res.ok) {
    console.error('❌ 캘린더 등록 실패:', await res.text());
    throw new Error('Google Calendar 등록 실패');
  }

  const data = await res.json();
  console.log('✅ 등록 성공:', data.htmlLink);
  return data;
}