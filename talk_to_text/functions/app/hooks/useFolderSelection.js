import { useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

export const useFolderSelection = (setSelectedFolderId) => {
  const handleError = useErrorHandler();

  const handleFolderSelect = useCallback((folderId) => {
    try {
      setSelectedFolderId(folderId);
    } catch (err) {
      handleError(err, '폴더 선택 중 오류가 발생했습니다.');
    }
  }, [setSelectedFolderId, handleError]);

  return { handleFolderSelect };
}; 