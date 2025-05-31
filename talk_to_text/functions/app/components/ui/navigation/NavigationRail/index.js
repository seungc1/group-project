'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { getFolders, createFolder, updateFolder, deleteFolder } from '@/lib/folderService';
import styles from './styles.module.css';

export const NavigationRail = ({ isCollapsed, setIsCollapsed }) => {
  const router = useRouter();
  const { user, logout, loginWithGoogle } = useAuth();

  const [folders, setFolders] = useState([]);
  const [showFolders, setShowFolders] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const settingsRef = useRef(null);

  useEffect(() => {
    if (user) {
      getFolders(user.uid).then(setFolders);
    } else {
      setFolders([]);
    }
  }, [user]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(v => !v);
  };

  const handleFolderAreaClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setShowFolders(v => !v);
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleEditClick = e => {
    e.stopPropagation();
    setShowFolders(true);
    setIsEditMode(v => !v);
    setEditingId(null);
  };

  const handleAddFolder = async () => {
    if (!user) {
      loginWithGoogle();
      return;
    }
    const id = await createFolder(user.uid, '새 폴더');
    setFolders([...folders, { id, name: '새 폴더' }]);
    setEditingId(id);
    setEditingName('새 폴더');
    setShowFolders(true);
    setIsEditMode(true);
  };

  const handleDeleteFolder = async folderId => {
    if (!user) return;
    await deleteFolder(user.uid, folderId);
    setFolders(folders.filter(f => f.id !== folderId));
    if (editingId === folderId) setEditingId(null);
  };

  const handleEditName = (folderId, name) => {
    setEditingId(folderId);
    setEditingName(name);
  };

  const handleNameChange = e => {
    setEditingName(e.target.value);
  };

  const handleNameBlur = async folderId => {
    if (!user || !editingName.trim()) {
      setEditingId(null);
      return;
    }
    await updateFolder(user.uid, folderId, editingName.trim());
    setFolders(folders.map(f =>
      f.id === folderId
        ? { ...f, name: editingName.trim() }
        : f
    ));
    setEditingId(null);
  };

  const handleNameKeyDown = (e, folderId) => {
    if (e.key === 'Enter') {
      handleNameBlur(folderId);
    }
  };

  const handleSettingsClick = () => {
    setShowSettings(v => !v);
  };

  const handleLogoutClick = async () => {
    await logout();
    setShowSettings(false);
    router.push('/login');
  };

  const handleCreateProjectClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push('/projects/new');
  };

  const handleProjectsClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push('/projects');
  };

  const handleBookmarksClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push('/bookmarks');
  };

  const handleRecordClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push('/record');
  };

  return (
    <nav className={`${styles['navigation-rail']} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* 헤더: 햄버거 + 로고 */}
      <div className={styles['nav-header']}>
        <button
          className={styles['hamburger-button']}
          onClick={toggleCollapse}
          aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          <span className={styles['hamburger-icon']}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        {!isCollapsed && (
          <span
            className={styles['logo-text']}
            role="button"
            tabIndex={0}
            onClick={toggleCollapse}
          >
            TalkToText
          </span>
        )}
      </div>

      {/* 네비게이션 메뉴 */}
      <div className={styles['nav-items']}>
        <div className={styles['nav-item']} onClick={() => router.push('/')}>
          <div className={styles.icon}><Image
            src="/images/home.png"
            alt="설정"
            width={22}
            height={22}
          /></div>
          <span>홈</span>
        </div>

        <div className={styles['nav-item']} onClick={handleCreateProjectClick}>
          <div className={styles.icon}><Image
            src="/images/edit.png"
            alt="설정"
            width={21}
            height={21}
          /></div>
          <span>프로젝트 생성</span>
        </div>

        {/* 전체 프로젝트 메뉴 아이템 */}
        <div className={styles['nav-item']} onClick={handleProjectsClick}>
          <div className={styles.icon}><Image
            src="/images/page.png"
            alt="설정"
            width={24}
            height={24}
          /></div>
          <span>전체 프로젝트</span>
        </div>

        <div className={styles['nav-item']} style={{ position: 'relative', flexDirection: 'column', alignItems: 'stretch', padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', cursor: 'pointer' }} onClick={handleFolderAreaClick}>
            <div className={styles.icon}><Image
              src="/images/folder.png"
              alt="설정"
              width={24}
              height={24}
            /></div>
            <span>폴더</span>
            <button
              className={styles['editButton']}
              style={{ marginLeft: 'auto' }}
              onClick={handleEditClick}
              title="폴더 편집"
            >
              <Image
                src="/images/plus.png"
                alt="설정"
                width={12}
                height={12}
              />
            </button>
          </div>
          {showFolders && (
            <div className={styles['folderListInNav']}>
              {folders.length === 0
                ? <div className={styles['folderDropdownItem']} style={{ color: '#888' }}>폴더 없음</div>
                : folders.map(folder => (
                  <div
                    key={folder.id}
                    className={styles['folderDropdownItem']}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    {editingId === folder.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={handleNameChange}
                        onBlur={() => handleNameBlur(folder.id)}
                        onKeyDown={e => handleNameKeyDown(e, folder.id)}
                        autoFocus
                        style={{ flex: 1, fontSize: 14 }}
                      />
                    ) : (
                      <span
                        style={{ flex: 1, cursor: 'pointer' }}
                        onClick={() => router.push(`/folders/${folder.id}`)}
                        onDoubleClick={e => { e.stopPropagation(); handleEditName(folder.id, folder.name); }}
                      >
                        {folder.name}
                      </span>
                    )}
                    {isEditMode && (
                      <>
                        <button
                          className={styles['iconButton']}
                          title="이름 수정"
                          onClick={() => handleEditName(folder.id, folder.name)}
                        >
                          <div className={styles.icon}><Image
                            src="/images/editName.png"
                            alt="설정"
                            width={18}
                            height={18}
                          /></div>
                        </button>
                        <button
                          className={styles['iconButton']}
                          title="폴더 삭제"
                          onClick={() => handleDeleteFolder(folder.id)}
                        >
                          <div className={styles.icon}><Image
                            src="/images/trashcan.png"
                            alt="설정"
                            width={18}
                            height={18}
                          /></div>
                        </button>
                      </>
                    )}
                  </div>
                ))
              }
              {isEditMode && (
                <button
                  className={styles['addButton']}
                  style={{ marginTop: 8, width: '100%' }}
                  onClick={handleAddFolder}
                >
                  + 새 폴더
                </button>
              )}
            </div>
          )}
        </div>

        {/* 전체 북마크 메뉴를 폴더 메뉴 바로 아래에 위치 */}
        <div
          className={styles['nav-item']}
          style={{ cursor: 'pointer' }}
          onClick={handleBookmarksClick}
        >
          <div className={styles.icon}>
            <div className={styles.icon}><Image
            src="/images/bookmark.png"
            alt="북마크"
            width={22}
            height={20}
          /></div>
          </div>
          <span>전체 북마크</span>
        </div>

        {/* 음성 녹음 메뉴 아이템 */}
        <div
          className={styles['nav-item']}
          onClick={handleRecordClick}
        >
          <div className={styles.icon}><Image
            src="/images/mic.png"
            alt="설정"
            width={24}
            height={24}
          /></div>
          <span>회의 음성 녹음</span>
        </div>
      </div>

      {/* 하단 설정 및 인증 */}
      <div ref={settingsRef} className={styles.settings}>
        <div
          className={styles['nav-item']}
          onClick={handleSettingsClick}
        >
          <div className={styles.icon}>
            <Image
              src="/images/setting.png"
              alt="설정"
              width={20}
              height={20}
            />
          </div>
          <span>설정</span>
        </div>
        {showSettings && (
          <div className={styles.settingsDropdown}>
            {user ? (
              <div
                className={styles.dropdownItem}
                onClick={handleLogoutClick}
              >
                로그아웃
              </div>
            ) : (
              <>
                <div
                  className={styles.dropdownItem}
                  onClick={() => { router.push('/login'); setShowSettings(false); }}
                >
                  로그인
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};