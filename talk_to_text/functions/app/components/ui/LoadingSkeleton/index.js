import styles from './styles.module.css';

export default function LoadingSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header} />
      <div className={styles.content}>
        {[1, 2, 3].map((item) => (
          <div key={item} className={styles.item} />
        ))}
      </div>
    </div>
  );
} 