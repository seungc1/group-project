import styles from './AddProjectModal.module.css';

export default function AddProjectModal({ availableProjects, selectedProjectIds, onProjectSelect, onClose, onAdd }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>프로젝트 선택</h3>
        {availableProjects.length === 0 ? (
          <div className={styles.modalEmpty}>추가할 수 있는 프로젝트가 없습니다.</div>
        ) : (
          <div className={styles.modalProjectList}>
            {availableProjects.map(project => (
              <label key={project.id} className={styles.modalProjectItem}>
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
        <div className={styles.modalButtonRow}>
          <button onClick={onClose} className={styles.cancelButton}>취소</button>
          <button
            onClick={onAdd}
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