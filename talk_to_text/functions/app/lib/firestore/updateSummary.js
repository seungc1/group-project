import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export async function updateMeetingSummary(meetingId, summary) {
  await updateDoc(doc(db, 'meetings', meetingId), { summary });
}