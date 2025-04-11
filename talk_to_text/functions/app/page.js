'use client'; //Next.js 13+ 클라이언트 컴포넌트 선언

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Header from './components/Header';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Header title="홈" />
      <section className={styles.carousel}>
        <div className={styles['carousel-item']}></div>
        <div className={styles['carousel-item']}></div>
        <div className={styles['carousel-item']}></div>
        <div className={styles['carousel-item']}></div>
      </section>

      <section className={styles['recent-meetings']}>
        <h2>최근 회의 및 전체 노트</h2>
        <div className={styles['meeting-list']}>
          <div className={styles['meeting-item']}>
            <div className={styles.thumbnail}></div>
            <div className={styles.content}>
              <h3>회의 이름</h3>
              <p>회의 간단 설명 ex) 노트 이름, 회의 날짜, 간단 요약?, 참석자</p>
            </div>
            <button className={styles['more-button']}>⋮</button>
          </div>
          <div className={styles['meeting-item']}>
            <div className={styles.thumbnail}></div>
            <div className={styles.content}>
              <h3>회의 이름</h3>
              <p>회의 간단 설명 ex) 노트 이름, 회의 날짜, 간단 요약?, 참석자</p>
            </div>
            <button className={styles['more-button']}>⋮</button>
          </div>
        </div>
      </section>

      <button className={styles.fab}>+</button>
    </>
  );
}