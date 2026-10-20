import styles from './styles.module.css';

export default function FolderLayout({ sidebar, children }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        {sidebar}
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
} 