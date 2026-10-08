export const addToCalendar = async ({ title, startTime, endTime }) => {
  const calendarUrl = new URL('https://calendar.google.com/calendar/u/0/r/eventedit');

  calendarUrl.searchParams.set('text', title);
  calendarUrl.searchParams.set('dates', formatForCalendar(startTime, endTime));
  calendarUrl.searchParams.set('details', '회의록 기반으로 생성된 일정입니다.');
  calendarUrl.searchParams.set('location', '');
  calendarUrl.searchParams.set('sf', 'true');
  calendarUrl.searchParams.set('output', 'xml');

  return calendarUrl.toString(); // 링크 반환
};

function formatForCalendar(start, end) {
  const toCalFormat = (d) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return `${toCalFormat(start)}/${toCalFormat(end)}`;
}
