"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { getFolders, getProjectsByFolder, moveProjectToFolder, updateFolder, deleteFolder } from '@/lib/folderService';
import { getAllProjects, getMeetings } from '@/lib/meetingsService';
import MeetingListItem from '@/components/features/Meeting/MeetingList/MeetingListItem';
import Header from '@/components/ui/layout/Header';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function FolderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [folder, setFolder] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const menuRef = useRef(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [projectMeetings, setProjectMeetings] = useState({});
  const [loadingMeetings, setLoadingMeetings] = useState({});

  useEffect(() => {
    if (!user || !id) return;
    setLoading(true);
    getFolders(user.uid).then(folders => {
      const found = folders.find(f => f.id === id);
      setFolder(found || null);
      setEditingName(found ? found.name : '');
    });
    getProjectsByFolder(user.uid, id).then(list => {
      setProjects(list);
      setLoading(false);
    });
  }, [user, id]);

  // 바깥 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // 모달 열릴 때 전체 프로젝트 목록 불러오기
  const openModal = async () => {
    if (!user) return;
    const all = await getAllProjects(user.uid);
    setAllProjects(all);
    setSelectedProjectIds([]);
    setShowModal(true);
    setShowMenu(false);
  };

  // 모달에서 프로젝트 선택
  const handleProjectSelect = (projectId) => {
    setSelectedProjectIds(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  // 선택한 프로젝트를 폴더로 이동
  const handleAddProjects = async () => {
    if (!user) return;
    await Promise.all(selectedProjectIds.map(pid => moveProjectToFolder(user.uid, pid, id)));
    const updated = await getProjectsByFolder(user.uid, id);
    setProjects(updated);
    setShowModal(false);
  };

  // 폴더 이름 편집
  const handleEditName = () => {
    setIsEditingName(true);
    setShowMenu(false);
  };
  const handleNameChange = (e) => setEditingName(e.target.value);
  const handleNameBlur = async () => {
    if (!user || !editingName.trim() || !folder) {
      setIsEditingName(false);
      setEditingName(folder?.name || '');
      return;
    }
    await updateFolder(user.uid, folder.id, editingName.trim());
    setFolder({ ...folder, name: editingName.trim() });
    setIsEditingName(false);
  };
  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') handleNameBlur();
  };

  // 폴더 삭제
  const handleDeleteFolder = async () => {
    if (!user || !folder) return;
    if (!window.confirm('정말 이 폴더를 삭제하시겠습니까?')) return;
    await deleteFolder(user.uid, folder.id);
    window.location.href = '/folders';
  };

  // 현재 폴더에 없는 프로젝트만 모달에 표시
  const availableProjects = allProjects.filter(
    p => !projects.some(proj => proj.id === p.id)
  );

  // 프로젝트 클릭 시 해당 프로젝트의 회의 목록 가져오기
  const handleProjectClick = async (project) => {
    if (expandedProject === project.id) {
      setExpandedProject(null);
      return;
    }

    setExpandedProject(project.id);
    setLoadingMeetings(prev => ({ ...prev, [project.id]: true }));
    try {
      const meetingsList = await getMeetings(user.uid, project.id);
      setProjectMeetings(prev => ({ ...prev, [project.id]: meetingsList }));
    } catch (error) {
      console.error('회의 목록을 가져오는 중 오류 발생:', error);
    } finally {
      setLoadingMeetings(prev => ({ ...prev, [project.id]: false }));
    }
  };

  // Header의 점 세개 버튼에만 메뉴 연결
  const customHeader = (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
      {isEditingName ? (
        <input
          type="text"
          value={editingName}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          onKeyDown={handleNameKeyDown}
          autoFocus
          style={{ fontSize: 24, fontWeight: 700, color: '#222', border: '1px solid #ccc', borderRadius: 6, padding: '4px 12px', minWidth: 180 }}
        />
      ) : (
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#222', margin: 0 }}>{folder?.name}</h1>
      )}
      <div style={{ position: 'relative' }}>
        <button
          style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#6b7280', padding: 8 }}
          onClick={() => setShowMenu(v => !v)}
          title="더보기"
        >
          ⋮
        </button>
        {showMenu && (
          <div ref={menuRef} style={{ position: 'absolute', right: 0, top: 40, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', borderRadius: 8, minWidth: 160, zIndex: 10 }}>
            <button onClick={openModal} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 15, color: '#222' }}>프로젝트 추가</button>
            <button onClick={handleEditName} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 15, color: '#222' }}>폴더 이름 편집</button>
            <button onClick={handleDeleteFolder} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#d32f2f', fontSize: 15 }}>폴더 삭제</button>
          </div>
        )}
      </div>
    </header>
  );

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 32 }}>
      {loading ? (
        <div>로딩 중...</div>
      ) : !folder ? (
        <div style={{ color: '#d32f2f', fontWeight: 'bold' }}>폴더를 찾을 수 없습니다.</div>
      ) : (
        <>
          {customHeader}
          {projects.length === 0 ? (
            <div>이 폴더에 속한 프로젝트가 없습니다.</div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {projects.map(project => (
                <div key={project.id}>
                  <div 
                    style={{ 
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      backgroundColor: expandedProject === project.id ? '#f8fafc' : 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleProjectClick(project)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: 0, color: '#111', fontSize: '18px', fontWeight: 600 }}>{project.name}</h3>
                        <p style={{ margin: '8px 0 0', color: '#666', fontSize: '14px' }}>{project.description || '설명 없음'}</p>
                      </div>
                      <div style={{ 
                        transform: expandedProject === project.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}>
                        ▼
                      </div>
                    </div>
                  </div>
                  
                  {/* 펼쳐진 회의 목록 */}
                  {expandedProject === project.id && (
                    <div style={{ 
                      marginTop: '12px',
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: 'white'
                    }}>
                      {loadingMeetings[project.id] ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>회의 목록 로딩 중...</div>
                      ) : !projectMeetings[project.id] || projectMeetings[project.id].length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>이 프로젝트에 속한 회의가 없습니다.</div>
                      ) : (
                        <div style={{ display: 'grid', gap: '12px' }}>
                          {projectMeetings[project.id].map(meeting => (
                            <MeetingListItem 
                              key={meeting.id} 
                              meeting={{
                                ...meeting,
                                projectId: project.id, // projectId 추가
                                projectName: project.name // projectName 추가
                              }} 
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 프로젝트 추가 모달 */}
          {showModal && (
            <div style={{
              position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 360, maxWidth: 480 }}>
                <h3 style={{ fontSize: 20, marginBottom: 16 }}>프로젝트 선택</h3>
                {availableProjects.length === 0 ? (
                  <div style={{ color: '#888', marginBottom: 16 }}>추가할 수 있는 프로젝트가 없습니다.</div>
                ) : (
                  <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
                    {availableProjects.map(project => (
                      <label key={project.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedProjectIds.includes(project.id)}
                          onChange={() => handleProjectSelect(project.id)}
                        />
                        <span>{project.name || '(제목 없음)'}</span>
                      </label>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ccc', background: '#f8f9fa', color: '#333', cursor: 'pointer' }}>취소</button>
                  <button
                    onClick={handleAddProjects}
                    disabled={selectedProjectIds.length === 0}
                    style={{ padding: '8px 16px', borderRadius: 6, background: selectedProjectIds.length ? '#4f46e5' : '#ccc', color: '#fff', fontWeight: 600, border: 'none', cursor: selectedProjectIds.length ? 'pointer' : 'not-allowed' }}
                  >
                    추가하기
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
} 