// functions/app/components/features/Meeting/CalendarSyncTrigger.js (자동 로그인 후 일정 등록 트리거)

'use client';

import { useAutoGoogleLogin } from '@/hooks/useGoogleAccessToken'; // accessToken 받아오는 훅
import { useEffect } from 'react';

/**
 * Google OAuth로 자동 로그인 후 accessToken을 받아
 * 서버로 일정 등록 요청을 트리거하는 컴포넌트
 */
export default function CalendarSyncTrigger({ start, end, title, description }) {
  const eventData = {
    title: title || '회의 일정',
    description: description || '자동 생성된 회의 일정',
    start,  // ISO 형식 문자열 예: '2025-06-01T15:00:00'
    end,    // ISO 형식 문자열 예: '2025-06-01T16:00:00'
  };

  // ✅ accessToken을 받아 서버에 일정 등록 요청
  const login = useAutoGoogleLogin(async (accessToken) => {
    try {
      const res = await fetch('http://localhost:5001/process-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          accessToken, // 서버에 전달
          userId,
          projectId,
          meetingId,
          audioUrl,
          title: eventData.title,
        }),
      });

      const result = await res.json();
      console.log('📆 서버 응답:', result);
    } catch (err) {
      console.error('❌ 서버 요청 실패:', err);
    }
  });

  useEffect(() => {
    login(); // 자동 로그인 및 등록
  }, []);
  
  return null;
}