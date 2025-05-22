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
import styles from './styles.module.css';
import FolderHeader from '@/components/features/Folder/FolderHeader';
import ProjectList from '@/components/features/Folder/ProjectList';
import AddProjectModal from '@/components/features/Folder/AddProjectModal';

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
  const [sortOrder, setSortOrder] = useState('desc');
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

  // 프로젝트 폴더에서 제거
  const handleRemoveProject = async (projectId) => {
    if (!window.confirm('정말 이 프로젝트를 폴더에서 제거하시겠습니까?')) return;
    await moveProjectToFolder(user.uid, projectId, null); // 폴더 연결 해제
    setProjects(projects => projects.filter(p => p.id !== projectId));
    // TODO: 스낵바 등으로 "제거 완료" 안내 가능
  };

  // 프로젝트 정렬 함수
  const sortProjects = (projects, order) => {
    return [...projects].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  // 정렬 순서 변경
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    setProjects(prev => sortProjects(prev, newOrder));
  };

  return (
    <main className={styles.container}>
      {loading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : !folder ? (
        <div className={styles.error}>폴더를 찾을 수 없습니다.</div>
      ) : (
        <>
          <FolderHeader
            folder={folder}
            isEditingName={isEditingName}
            editingName={editingName}
            onNameChange={handleNameChange}
            onNameBlur={handleNameBlur}
            onNameKeyDown={handleNameKeyDown}
            onEditName={handleEditName}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            menuRef={menuRef}
            onOpenModal={openModal}
            onDeleteFolder={handleDeleteFolder}
          />
          <div className={styles.sortRow}>
            <button
              onClick={toggleSortOrder}
              className={styles.sortButton}
            >
              {sortOrder === 'asc' ? '오래된순' : '최신순'}
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <ProjectList
            projects={projects}
            expandedProject={expandedProject}
            onProjectClick={handleProjectClick}
            loadingMeetings={loadingMeetings}
            projectMeetings={projectMeetings}
            onRemoveProject={handleRemoveProject}
          />
          {showModal && (
            <AddProjectModal
              availableProjects={availableProjects}
              selectedProjectIds={selectedProjectIds}
              onProjectSelect={handleProjectSelect}
              onClose={() => setShowModal(false)}
              onAdd={handleAddProjects}
            />
          )}
        </>
      )}
    </main>
  );
} 