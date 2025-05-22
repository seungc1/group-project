"use client"

import { useState, useEffect } from 'react';
import FolderSidebar from '@/components/features/Meeting/MeetingList/FolderSidebar';
import { useAuth } from '@/app/context/AuthContext';
import { getAllProjects } from '@/lib/meetingsService';
import { getProjectsByFolder, getFolders } from '@/lib/folderService';
import MeetingListItem from '@/components/features/Meeting/MeetingList/MeetingListItem';

export default function FoldersPage() {
  const { user } = useAuth();
  const [selectedFolderId, setSelectedFolderId] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    if (!user) return;
    getFolders(user.uid).then(setFolders);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    if (selectedFolderId === 'all') {
      getAllProjects(user.uid).then(list => {
        setProjects(list);
        setLoading(false);
      });
    } else {
      getProjectsByFolder(user.uid, selectedFolderId).then(list => {
        setProjects(list);
        setLoading(false);
      });
    }
  }, [user, selectedFolderId]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <FolderSidebar selectedFolderId={selectedFolderId} onSelectFolder={setSelectedFolderId} />
      <main style={{ flex: 1, padding: 32 }}>
        <h2 style={{ fontSize: 24, marginBottom: 24 }}>
          {selectedFolderId === 'all' ? '전체 프로젝트' : '폴더별 프로젝트'}
        </h2>
        <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {folders.map(folder => (
            <button
              key={folder.id}
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                border: selectedFolderId === folder.id ? '2px solid #4f46e5' : '1px solid #ccc',
                background: selectedFolderId === folder.id ? '#eef2ff' : '#f8f9fa',
                color: selectedFolderId === folder.id ? '#4f46e5' : '#333',
                fontWeight: selectedFolderId === folder.id ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: 15,
                transition: 'all 0.2s',
              }}
              onClick={() => setSelectedFolderId(folder.id)}
            >
              {folder.name}
            </button>
          ))}
          <button
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: selectedFolderId === 'all' ? '2px solid #4f46e5' : '1px solid #ccc',
              background: selectedFolderId === 'all' ? '#eef2ff' : '#f8f9fa',
              color: selectedFolderId === 'all' ? '#4f46e5' : '#333',
              fontWeight: selectedFolderId === 'all' ? 'bold' : 'normal',
              cursor: 'pointer',
              fontSize: 15,
              transition: 'all 0.2s',
            }}
            onClick={() => setSelectedFolderId('all')}
          >
            전체
          </button>
        </div>
        {loading ? (
          <div>로딩 중...</div>
        ) : projects.length === 0 ? (
          <div>프로젝트가 없습니다.</div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {projects.map(project => (
              <MeetingListItem key={project.id} meeting={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 