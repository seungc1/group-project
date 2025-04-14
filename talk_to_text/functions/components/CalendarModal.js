'use client';

export default function CalendarModal({ visible, url, onClose }) {
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100%', height: '100%',
      background: 'rgba(0, 0, 0, 0.4)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '12px',
        width: '360px',
        textAlign: 'center'
      }}>
        <h2>일정이 추가되었습니다</h2>
        <p style={{ margin: '16px 0' }}>Google Calendar에서 확인하시겠습니까?</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <button style={{ padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '6px' }}>
              구글 캘린더 열기
            </button>
          </a>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '6px' }}>
            창 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
