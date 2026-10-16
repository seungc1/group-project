import styles from './styles.module.css';

export default function FolderFilters({ folders, selectedFolderId, onSelectFolder }) {
  return (
    <div className={styles.filterContainer}>
      {folders.map(folder => (
        <button
          key={folder.id}
          className={`${styles.filterButton} ${
            selectedFolderId === folder.id ? styles.active : ''
          }`}
          onClick={() => onSelectFolder(folder.id)}
        >
          {folder.name}
        </button>
      ))}
      <button
        className={`${styles.filterButton} ${
          selectedFolderId === 'all' ? styles.active : ''
        }`}
        onClick={() => onSelectFolder('all')}
      >
        전체
      </button>
    </div>
  );
} 