'use server';

import { createMeeting } from '@/app/services/meetingService';

export async function submitMeeting(formData) {
  const title = formData.get('title');
  const participants = formData.get('participants');
  const participantNames = formData.get('participantNames');
  const file = formData.get('file');

  if (!file || !title || !participants || !participantNames) {
    throw new Error('모든 필드를 입력해주세요.');
  }

  try {
    await createMeeting({
      title,
      participants: parseInt(participants),
      participantNames: participantNames.split(',').map(name => name.trim()),
      file
    });
    return { success: true };
  } catch (error) {
    throw new Error('회의록 생성 중 오류가 발생했습니다.');
  }
} 