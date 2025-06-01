// talk_to_text/functions/app/hooks/useGoogleCalendar.js 

'use client';

import { useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { addEventToGoogleCalendar } from '@/lib/googleCalendar';

/**
 * 자동 로그인 및 일정 등록 훅
 * @param {Object} eventData - 등록할 일정 정보 { title, start, end }
 */
export function useAutoCalendarSync(eventData) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;
      console.log('🔑 accessToken:', accessToken);

      try {
        await addEventToGoogleCalendar(accessToken, eventData);
        console.log('✅ Google Calendar 등록 성공');
      } catch (err) {
        console.error('❌ Google Calendar 등록 실패:', err);
      }
    },
    onError: (error) => {
      console.error('❌ Google 로그인 실패:', error);
    },
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks',
    flow: 'implicit',
  });

  useEffect(() => {
    if (!eventData || !eventData.title || !eventData.start || !eventData.end) {
      console.warn('⛔ 필수 일정 정보 누락: eventData', eventData);
      return;
    }

    login();
  }, [eventData]);
}