import FolderHeader from '../FolderHeader';
import FolderFilters from '../FolderFilters';
import ProjectList from '../ProjectList';
import StatusMessage from '@/components/ui/StatusMessage';
import styles from './styles.module.css';

export default function FolderContent({
  selectedFolderId,
  folders,
  onSelectFolder,
  projects,
  loading,
  error
}) {
  return (
    <div className={styles.content}>
      <FolderHeader selectedFolderId={selectedFolderId} />
      
      <FolderFilters
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={onSelectFolder}
      />

      {error ? (
        <StatusMessage type="error" message={error} />
      ) : loading ? (
        <StatusMessage type="loading" message="로딩 중..." />
      ) : (
        <ProjectList projects={projects} />
      )}
    </div>
  );
} 