/**
 * 회의의 주요 키워드를 표시하는 컴포넌트
 * @param {Object} meeting - 회의 데이터 객체
 * @param {Array} meeting.keywords - 회의의 주요 키워드 배열
 */
'use client';

import styles from './styles.module.css';

export default function MeetingKeywords({ meeting }) {
  // 키워드가 없거나 빈 배열인 경우 컴포넌트를 렌더링하지 않음
  if (!meeting.keywords || meeting.keywords.length === 0) {
    return null;
  }

  // 키워드 섹션 UI 렌더링
  return (
    <div className={styles.keywordsSection}>
      {/* 섹션 제목 */}
      <h3>주요 키워드</h3>
      
      {/* 키워드 목록 컨테이너 */}
      <div className={styles.keywordsList}>
        {/* 각 키워드를 순회하며 렌더링 */}
        {meeting.keywords.map((keyword, index) => (
          <span key={index} className={styles.keyword}>
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
} 