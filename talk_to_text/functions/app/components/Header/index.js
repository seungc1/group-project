'use client';

import styles from './styles.module.css';

export default function Header({ title }) {
  return (
    <header className={styles.header}>
      <h1>{title}</h1>
      <div className={styles['header-actions']}>
        <button className={styles['icon-button']}>📎</button>
        <button className={styles['icon-button']}>📅</button>
        <button className={styles['icon-button']}>⋮</button>
      </div>
    </header>
  );
} 