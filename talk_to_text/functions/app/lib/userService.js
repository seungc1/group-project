import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function fetchUserName(userId) {
  if (!userId) return '정보 없음';
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    return data.name || '정보 없음';
  }
  return '정보 없음';
} 