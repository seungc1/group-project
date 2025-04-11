import { useState } from 'react';
import styles from './styles.module.css';

export const Transcription = ({ text, isLoading }) => {
  return (
    <div className={styles.transcription}>
      {isLoading ? (
        <div className={styles.loading}>변환 중...</div>
      ) : (
        <div className={styles.text}>{text}</div>
      )}
    </div>
  );
}; 