import { useCallback } from 'react';

export function useErrorHandler() {
  return useCallback((error, message) => {
    console.error(message || '에러 발생', error);
    if (message) {
      alert(message);
    }
  }, []);
}