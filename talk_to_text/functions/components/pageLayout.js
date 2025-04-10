"use client";

import styles from "@/app/page.module.css";

export default function PageLayout({ title, children }) {
  return (
    <div className={styles['examples-upcoming-web']}>
      <main className={styles['main-content']}>
        {/* 공통 Header */}
        <header className={styles.header}>
          <h1>{title}</h1>
          <div className={styles['header-actions']}>
            <button className={styles['icon-button']}>📎</button>
            <button className={styles['icon-button']}>📅</button>
            <button className={styles['icon-button']}>⋮</button>
          </div>
        </header>

        {/* 각 페이지 콘텐츠 */}
        {children}
      </main>
    </div>
  );
}
