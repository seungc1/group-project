import { useState, useEffect } from 'react';
import { getFolders, createFolder, deleteFolder, updateFolder } from '@/lib/folderService';
import { useAuth } from '@/app/context/AuthContext';
import styles from './styles.module.css';

export default function FolderSidebar({ selectedFolderId, onSelectFolder }) {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  useEffect(() => {
    if (user) {
      getFolders(user.uid).then(setFolders);
    }
  }, [user]);

  const handleAddFolder = async () => {
    if (!user) return;
    const id = await createFolder(user.uid, '새 폴더');
    setFolders([...folders, { id, name: '새 폴더' }]);
    setEditingFolderId(id);
    setEditingFolderName('새 폴더');
  };

  const handleDeleteFolder = async (folderId) => {
    if (!user) return;
    await deleteFolder(user.uid, folderId);
    setFolders(folders.filter(f => f.id !== folderId));
    if (selectedFolderId === folderId) onSelectFolder('all');
  };

  const handleFolderClick = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
    onSelectFolder(folderId);
  };

  const handleFolderNameChange = async (folderId, newName) => {
    if (!user || !newName.trim()) return;
    await updateFolder(user.uid, folderId, newName.trim());
    setFolders(folders.map(f => 
      f.id === folderId ? { ...f, name: newName.trim() } : f
    ));
    setEditingFolderId(null);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h3>폴더</h3>
        <button 
          className={styles.addButton}
          onClick={handleAddFolder}
          title="새 폴더 추가"
        >
          +
        </button>
      </div>
      <ul className={styles.folderList}>
        <li
          className={`${styles.folderItem} ${selectedFolderId === 'all' ? styles.selected : ''}`}
          onClick={() => onSelectFolder('all')}
        >
          <div className={styles.folderHeader}>
            <span className={styles.folderName}>전체</span>
          </div>
        </li>
        {folders.map(folder => (
          <li key={folder.id} className={styles.folderItem}>
            <div 
              className={`${styles.folderHeader} ${selectedFolderId === folder.id ? styles.selected : ''}`}
              onClick={() => handleFolderClick(folder.id)}
            >
              <span className={styles.folderName}>
                {editingFolderId === folder.id ? (
                  <input
                    type="text"
                    value={editingFolderName}
                    onChange={(e) => setEditingFolderName(e.target.value)}
                    onBlur={() => handleFolderNameChange(folder.id, editingFolderName)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleFolderNameChange(folder.id, editingFolderName);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  folder.name
                )}
              </span>
              <div className={styles.folderActions}>
                <button 
                  className={styles.addButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddFolder();
                  }}
                  title="새 폴더 추가"
                >
                  +
                </button>
                <button 
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id);
                  }}
                  title="폴더 삭제"
                >
                  ×
                </button>
              </div>
            </div>
            {expandedFolders[folder.id] && (
              <div className={styles.folderContent}>
                {/* 여기에 폴더 내용을 표시할 수 있습니다 */}
              </div>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
} 