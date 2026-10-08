'use client';

import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

export default function MeetingItemActions({ meetingId }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/meetings/${meetingId}`);
  };

  return (
    <div 
      className={styles.actions}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <button className={styles['more-button']}>⋮</button>
    </div>
  );
} 