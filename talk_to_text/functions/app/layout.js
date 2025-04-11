'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  const router = useRouter();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className={styles['examples-upcoming-web']}>
          <nav className={styles['navigation-rail']}>
            <div className={styles['nav-items']}>
              <div 
                className={styles['nav-item']} 
                onClick={() => router.push('/')}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.icon}>🏠</div>
                <span>홈</span>
              </div>
              <div 
                className={styles['nav-item']} 
                onClick={() => router.push('/create')}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.icon}>🎙️</div>
                <span>회의 생성</span>
              </div>
              <div className={styles['nav-item']}>
                <div className={styles.icon}>🎤</div>
                <span>음성 녹음</span>
              </div>
              <div 
                className={styles['nav-item']}
                onClick={() => router.push('/meetings')}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.icon}>📋</div>
                <span>전체 회의록</span>
              </div>
              <div className={styles['nav-item']}>
                <div className={styles.icon}>⚙️</div>
                <span>미정</span>
              </div>
            </div>
          </nav>

          <main className={styles['main-content']}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
