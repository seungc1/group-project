import styles from './styles.module.css';

export default function ProjectCard({
  project,
  expandedProject,
  onProjectClick,
  onRemoveProject,
  setProjects,
  projectMeetings,
  loadingMeetings,
  setExpandedProject
}) {
  const isExpanded = expandedProject === project.id;
  return (
    <div>
      <div
        className={isExpanded ? `${styles.projectCard} ${styles.expanded}` : styles.projectCard}
        onClick={() => onProjectClick(project)}
      >
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.projectName}>{project.name}</h3>
            <p className={styles.projectDesc}>{project.description || '설명 없음'}</p>
          </div>
          <div className={isExpanded ? `${styles.arrow} ${styles.expanded}` : styles.arrow}>
            ▼
          </div>
        </div>
      </div>
      {/* 펼쳐진 회의 목록 */}
      {isExpanded && (
        <div className={styles.meetingListWrap}>
          {loadingMeetings[project.id] ? (
            <div className={styles.meetingLoading}>회의 목록 로딩 중...</div>
          ) : !projectMeetings[project.id] || projectMeetings[project.id].length === 0 ? (
            <div className={styles.meetingEmpty}>이 프로젝트에 속한 회의가 없습니다.</div>
          ) : (
            <div className={styles.meetingList}>
              {projectMeetings[project.id].map(meeting => (
                <div key={meeting.id}>
                  <div>{meeting.title || meeting.name || '회의'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 