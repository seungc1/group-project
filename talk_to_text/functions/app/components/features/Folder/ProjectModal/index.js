import styles from './styles.module.css';

export default function ProjectModal({
  showModal,
  availableProjects,
  selectedProjectIds,
  onProjectSelect,
  onAddProjects,
  onClose
}) {
  if (!showModal) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>프로젝트 선택</h3>
        {availableProjects.length === 0 ? (
          <div className={styles.empty}>추가할 수 있는 프로젝트가 없습니다.</div>
        ) : (
          <div className={styles.projectList}>
            {availableProjects.map(project => (
              <label key={project.id} className={styles.projectItem}>
                <input
                  type="checkbox"
                  checked={selectedProjectIds.includes(project.id)}
                  onChange={() => onProjectSelect(project.id)}
                />
                <span>{project.name || '(제목 없음)'}</span>
              </label>
            ))}
          </div>
        )}
        <div className={styles.buttonRow}>
          <button onClick={onClose} className={styles.cancelButton}>취소</button>
          <button
            onClick={onAddProjects}
            disabled={selectedProjectIds.length === 0}
            className={selectedProjectIds.length ? styles.addButton : styles.addButtonDisabled}
          >
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
} 