'use client';

import styles from '@/app/page.module.css';

export default function PageHeader({ title = '제목 없음' }) {

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

