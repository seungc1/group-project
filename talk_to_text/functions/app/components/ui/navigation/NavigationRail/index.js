/**
 * 사이드바 네비게이션 컴포넌트
 * - 접기/펼치기 기능과 주요 페이지 이동 메뉴 제공
 * - 반응형 디자인 지원
 */

'use client';

// React 훅과 라우터 임포트
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useState, useEffect } from 'react';
import { getFolders, createFolder, updateFolder, deleteFolder } from '@/lib/folderService';
// 컴포넌트 스타일 임포트
import styles from './styles.module.css';

export const NavigationRail = ({ isCollapsed, setIsCollapsed }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [folders, setFolders] = useState([]);
  const [showFolders, setShowFolders] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    if (user) {
      getFolders(user.uid).then(setFolders);
    }
  }, [user]);

  // 폴더 영역 클릭 시 펼침/접힘
  const handleFolderAreaClick = () => {
    setShowFolders(v => !v);
    setIsEditMode(false);
    setEditingId(null);
  };

  // 편집 버튼 클릭 시 편집모드 진입
  const handleEditClick = (e) => {
    e.stopPropagation();
    setShowFolders(true);
    setIsEditMode(v => !v);
    setEditingId(null);
  };

  const handleAddFolder = async () => {
    if (!user) return;
    const id = await createFolder(user.uid, '새 폴더');
    setFolders([...folders, { id, name: '새 폴더' }]);
    setEditingId(id);
    setEditingName('새 폴더');
    setShowFolders(true);
    setIsEditMode(true);
  };

  const handleDeleteFolder = async (folderId) => {
    if (!user) return;
    await deleteFolder(user.uid, folderId);
    setFolders(folders.filter(f => f.id !== folderId));
    if (editingId === folderId) setEditingId(null);
  };

  const handleEditName = (folderId, name) => {
    setEditingId(folderId);
    setEditingName(name);
  };

  const handleNameChange = (e) => {
    setEditingName(e.target.value);
  };

  const handleNameBlur = async (folderId) => {
    if (!user || !editingName.trim()) {
      setEditingId(null);
      return;
    }
    await updateFolder(user.uid, folderId, editingName.trim());
    setFolders(folders.map(f => f.id === folderId ? { ...f, name: editingName.trim() } : f));
    setEditingId(null);
  };

  const handleNameKeyDown = (e, folderId) => {
    if (e.key === 'Enter') {
      handleNameBlur(folderId);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // 네비게이션 레일 UI 렌더링
  return (
    <nav className={`${styles['navigation-rail']} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* 상단 로고 + 햄버거 버튼 */}
      <div className={styles['nav-header']}>
        <button 
          className={styles['hamburger-button']} 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          {/* 햄버거 아이콘 (줄 3개) */}
          <span className={styles['hamburger-icon']}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        {/* TalkToText 로고 텍스트: 펼쳐졌을 때만 보임 */}
        {!isCollapsed && (
          <span 
            className={styles['logo-text']} 
            onClick={() => setIsCollapsed(!isCollapsed)}
            role="button"
            tabIndex={0}
          >
            TalkToText
          </span>
        )}
      </div>

      {/* 네비게이션 메뉴 아이템들 */}
      <div className={styles['nav-items']}>
        {/* 홈 메뉴 아이템 */}
        <div 
          className={styles['nav-item']} 
          onClick={() => router.push('/')}
        >
          <div className={styles.icon}>🏠</div>
          <span>홈</span>
        </div>

        {/* 회의 생성 메뉴 아이템 */}
        <div 
          className={styles['nav-item']} 
          onClick={() => router.push('/create')}
        >
          <div className={styles.icon}>🎙️</div>
          <span>프로젝트 생성</span>
        </div>

        {/* 전체 회의록 메뉴 아이템 */}
        <div 
          className={styles['nav-item']}
          onClick={() => router.push('/meetings')}
        >
          <div className={styles.icon}>📋</div>
          <span>전체 프로젝트</span>
        </div>

        {/* 폴더 메뉴 아이템 */}
        <div className={styles['nav-item']} style={{ position: 'relative', flexDirection: 'column', alignItems: 'stretch', padding: 0 }}>
          <div
            style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', cursor: 'pointer', position: 'relative' }}
            onClick={handleFolderAreaClick}
          >
            <div className={styles.icon}>📁</div>
            <span>폴더</span>
            <button
              className={styles['editButton']}
              style={{ marginLeft: 'auto' }}
              onClick={handleEditClick}
              title="폴더 편집"
            >
              ✏️
            </button>
          </div>
          {showFolders && (
            <div className={styles['folderListInNav']}>
              {folders.length === 0 ? (
                <div className={styles['folderDropdownItem']} style={{ color: '#888' }}>폴더 없음</div>
              ) : (
                folders.map(folder => (
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
                          ✏️
                        </button>
                        <button
                          className={styles['iconButton']}
                          title="폴더 삭제"
                          onClick={() => handleDeleteFolder(folder.id)}
                        >
                          🗑
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
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

        {/* 음성 녹음 메뉴 아이템 */}
        <div 
          className={styles['nav-item']}
          onClick={() => router.push('/record')}
          >
          <div className={styles.icon}>🌹</div>
          <span>회의 음성 녹음</span>
        </div>
        
        {/* 설정 메뉴 아이템 */}
        <div className={styles['nav-item']}>
          <div className={styles.icon}>⚙️</div>
          <span>설정</span>
        </div>

        {/* 인증 관련 버튼들 */}
        <div className={styles['auth-buttons']}>
          {user ? (
            <div 
              className={styles['nav-item']}
              onClick={handleLogout}
            >
              <div className={styles.icon}>🚪</div>
              <span>로그아웃</span>
            </div>
          ) : (
            <>
              <div 
                className={styles['nav-item']}
                onClick={() => router.push('/login')}
              >
                <div className={styles.icon}>🔑</div>
                <span>로그인</span>
              </div>
              <div 
                className={styles['nav-item']}
                onClick={() => router.push('/signup')}
              >
                <div className={styles.icon}>📝</div>
                <span>회원가입</span>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};