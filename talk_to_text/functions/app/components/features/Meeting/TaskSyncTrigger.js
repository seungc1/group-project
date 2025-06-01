// functions/app/components/features/Meeting/TaskSyncTrigger.js

'use client';

import { useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { registerTasksWithToken } from '@/lib/googleTasks';
import { extract_task_commands_with_solar } from '@/lib/taskExtractor';

/**
 * @param {Object} props
 * @param {string} props.summaryText - 회의 요약 텍스트 (명령형 문장 추출 대상)
 */
export default function TaskSyncTrigger({ summaryText }) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;
      console.log('🔑 Google Tasks accessToken:', accessToken);

      // 명령형 문장 추출
      const commands = extract_task_commands_with_solar(summaryText).filter((cmd) => cmd.trim());
      if (!commands.length) {
        alert('추출된 명령형 문장이 없습니다.');
        return;
      }

      try {
        await registerTasksWithToken(commands, accessToken);
        alert('✅ Google Tasks 등록 완료');
      } catch (err) {
        console.error('❌ Google Tasks 등록 실패:', err);
        alert('Tasks 등록 실패');
      }
    },
    onError: (error) => {
      console.error('❌ Google 로그인 실패:', error);
      alert('Google 로그인 실패');
    },
    scope: 'https://www.googleapis.com/auth/tasks',
    flow: 'implicit',
  });

  useEffect(() => {
    if (!summaryText || summaryText.trim().length < 5) return;
    login();
  }, [summaryText]);

  return null; // UI 없이 자동 실행되는 트리거
}