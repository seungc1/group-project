"use client"

import { useAuth } from '@/app/context/AuthContext';
import { useFolders } from '@/app/hooks/useFolders';
import { useFolderSelection } from '@/app/hooks/useFolderSelection';
import FolderSidebar from '@/components/features/Meeting/MeetingList/FolderSidebar';
import FolderLayout from '@/components/layout/FolderLayout';
import FolderContent from '@/components/features/Folder/FolderContent';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useErrorHandler } from '@/app/hooks/useErrorHandler';

export default function FoldersPage() {
  const { user } = useAuth();
  const handleError = useErrorHandler();
  
  const {
    selectedFolderId,
    setSelectedFolderId,
    projects,
    loading,
    folders,
    error
  } = useFolders(user);

  const { handleFolderSelect } = useFolderSelection(setSelectedFolderId);

  if (!user) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">로그인이 필요합니다.</p>
        </div>
      </ErrorBoundary>
    );
  }

  if (loading) {
    return (
      <ErrorBoundary>
        <FolderLayout
          sidebar={<LoadingSkeleton />}
        >
          <LoadingSkeleton />
        </FolderLayout>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <FolderLayout
        sidebar={
          <FolderSidebar
            selectedFolderId={selectedFolderId}
            onSelectFolder={handleFolderSelect}
          />
        }
      >
        <FolderContent
          selectedFolderId={selectedFolderId}
          folders={folders}
          onSelectFolder={handleFolderSelect}
          projects={projects}
          loading={loading}
          error={error}
        />
      </FolderLayout>
    </ErrorBoundary>
  );
} 