import styles from './styles.module.css';

export default function MeetingFilters({
  showBookmarkedOnly,
  onFilterChange,
  bookmarkedCount,
  sortOrder,
  onSortChange
}) {
  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterButtons}>
        <button
          className={`${styles.filterButton} ${!showBookmarkedOnly ? styles.active : ''}`}
          onClick={() => onFilterChange(false)}
        >
          전체
        </button>
        <button
          className={`${styles.filterButton} ${showBookmarkedOnly ? styles.active : ''}`}
          onClick={() => onFilterChange(true)}
        >
          북마크
          {bookmarkedCount > 0 && (
            <span className={styles.badge}>
              {bookmarkedCount}
            </span>
          )}
        </button>
      </div>
      <button
        className={styles.sortButton}
        onClick={onSortChange}
      >
        {sortOrder === 'asc' ? '오래된순' : '최신순'}
        {sortOrder === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  );
} 