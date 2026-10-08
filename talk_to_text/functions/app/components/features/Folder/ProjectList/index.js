import MeetingListItem from '@/components/features/Meeting/MeetingList/MeetingListItem';
import styles from './styles.module.css';

export default function ProjectList({ projects, expandedProject, onProjectClick, loadingMeetings, projectMeetings, onRemoveProject }) {
  if (!projects || projects.length === 0) {
    return <div className={styles.empty}>이 폴더에 속한 프로젝트가 없습니다.</div>;
  }
  return (
    <div className={styles.projectList}>
      {projects.map(project => (
        <div key={project.id}>
          <div
            className={
              expandedProject === project.id
                ? `${styles.projectCard} ${styles.expanded}`
                : styles.projectCard
            }
            onClick={() => onProjectClick(project)}
          >
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.projectName}>{project.name}</h3>
                <p className={styles.projectDesc}>{project.description || '설명 없음'}</p>
              </div>
              <div
                className={
                  expandedProject === project.id
                    ? `${styles.arrow} ${styles.expanded}`
                    : styles.arrow
                }
              >
                ▼
              </div>
            </div>
          </div>
          {/* 회의 목록 */}
          {expandedProject === project.id && (
            <div className={styles.meetingListWrap}>
              {loadingMeetings[project.id] ? (
                <div className={styles.meetingLoading}>회의 목록 로딩 중...</div>
              ) : !projectMeetings[project.id] || projectMeetings[project.id].length === 0 ? (
                <div className={styles.meetingEmpty}>이 프로젝트에 속한 회의가 없습니다.</div>
              ) : (
                <div className={styles.meetingList}>
                  {projectMeetings[project.id].map(meeting => (
                    <MeetingListItem
                      key={meeting.id}
                      meeting={{
                        ...meeting,
                        projectId: project.id,
                        projectName: project.name
                      }}
                    />
                  ))}
                </div>
              )}
              <button className={styles.removeButton} onClick={() => onRemoveProject(project.id)}>
                폴더에서 제거
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 