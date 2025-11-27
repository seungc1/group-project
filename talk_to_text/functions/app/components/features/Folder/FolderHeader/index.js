import styles from './styles.module.css';

export default function FolderHeader({
  folder,
  isEditingName,
  editingName,
  onNameChange,
  onNameBlur,
  onNameKeyDown,
  onEditName,
  showMenu,
  setShowMenu,
  menuRef,
  onOpenModal,
  onDeleteFolder
}) {
  return (
    <header className={styles.header}>
      {isEditingName ? (
        <input
          type="text"
          value={editingName}
          onChange={onNameChange}
          onBlur={onNameBlur}
          onKeyDown={onNameKeyDown}
          autoFocus
          className={styles.nameInput}
        />
      ) : (
        <h1 className={styles.title}>{folder?.name}</h1>
      )}
      <div className={styles.menuWrap}>
        <button
          className={styles.menuButton}
          onClick={() => setShowMenu(v => !v)}
          title="더보기"
        >
          ⋮
        </button>
        {showMenu && (
          <div ref={menuRef} className={styles.menuDropdown}>
            <button onClick={onOpenModal} className={styles.menuItem}>프로젝트 추가</button>
            <button onClick={onEditName} className={styles.menuItem}>폴더 이름 편집</button>
            <button onClick={onDeleteFolder} className={styles.menuItemDanger}>폴더 삭제</button>
          </div>
        )}
      </div>
    </header>
  );
} 