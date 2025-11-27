'use client';

import styles from './styles.module.css';

export default function AudioPlayer({ url }) {
  return (
    <audio controls className={styles.audioPlayer}>
      <source src={url} type="audio/mpeg" />
      브라우저가 오디오 재생을 지원하지 않습니다.
    </audio>
  );
} 