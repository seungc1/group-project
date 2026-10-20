import styles from './styles.module.css';
import CloseButton from '@/components/common/buttons/CloseButton';

export default function ProjectHeader({ project, onCreateMeeting, onClose }) {
  return (
    <div className={styles.projectInfo} style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <CloseButton onClick={onClose} />
      </div>
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