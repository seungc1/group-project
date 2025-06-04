// functions/app/hooks/useGoogleTasks.js

'use client';

import { useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { addTasksToGoogleTasks } from '@/lib/googleTasks';

/**
 * Google Tasks 자동 동기화 훅
 * @param {Array<string>} tasks - 등록할 할 일 목록
 */
export function useAutoTaskSync(tasks) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;
      console.log('🔑 Google Tasks accessToken:', accessToken);

      try {
        await addTasksToGoogleTasks(accessToken, tasks);
        console.log('✅ Google Tasks 등록 성공');
      } catch (err) {
        console.error('❌ Google Tasks 등록 실패:', err);
      }
    },
    onError: (error) => {
      console.error('❌ Google 로그인 실패:', error);
    },
    scope: 'https://www.googleapis.com/auth/tasks',
    flow: 'implicit',
  });

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      console.warn('⛔ 등록할 할 일 없음');
      return;
    }

    login(); // 자동 로그인 시도
  }, [tasks]);
}