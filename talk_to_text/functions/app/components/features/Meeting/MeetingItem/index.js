/**
 * 회의 목록에서 개별 회의를 표시하는 컴포넌트
 * @param {Object} meeting - 회의 데이터 객체
 * @param {string} meeting.title - 회의 제목
 * @param {string} meeting.description - 회의 설명
 */
'use client';

// 컴포넌트 스타일 임포트
import styles from './styles.module.css';

export default function MeetingItem({ meeting }) {
  // 회의 아이템 UI 렌더링
  return (
    <div className={styles['meeting-item']}>
      {/* 썸네일 영역 */}
      <div className={styles.thumbnail}></div>
      
      {/* 회의 내용 영역 */}
      <div className={styles.content}>
        {/* 회의 제목 */}
        <h3>{meeting.title}</h3>
        {/* 회의 설명 */}
        <p>{meeting.description}</p>
      </div>
      
      {/* 추가 메뉴 버튼 */}
      <button className={styles['more-button']}>⋮</button>
    </div>
  );
} 