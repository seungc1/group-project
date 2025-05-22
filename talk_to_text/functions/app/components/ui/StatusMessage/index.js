import styles from './styles.module.css';

export default function StatusMessage({ type, message }) {
  return (
    <div className={`${styles.container} ${styles[type]}`}>
      {message}
    </div>
  );
} 