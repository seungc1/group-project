import styles from './styles.module.css';

export default function ProjectHeader({ project, onCreateMeeting }) {
  return (
    <div className={styles.projectInfo}>
      <h2>{project.name}</h2>
      {project.description && (
        <p className={styles.description}>{project.description}</p>
      )}
      <button
        className={styles.createButton}
        onClick={onCreateMeeting}
      >
        회의 생성
      </button>
    </div>
  );
} 