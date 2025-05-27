/**
 * 애플리케이션의 루트 레이아웃 컴포넌트
 * - 전체 애플리케이션의 기본 구조를 정의
 * - 폰트 설정 및 전역 스타일 적용
 * - LayoutWrapper를 통해 사이드바와 메인 콘텐츠 구조 제공
 */

// 전역 스타일시트 임포트
import "./globals.css";
// 레이아웃 래퍼 컴포넌트 임포트
import LayoutWrapper from './components/layout/LayoutWrapper';
import styles from './page.module.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/app/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

// 메타데이터 설정
export const metadata = {
  title: 'Talk to Text',
  description: '음성을 텍스트로 변환하는 애플리케이션',
};

/**
 * 루트 레이아웃 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 컴포넌트들
 * @returns {JSX.Element} 애플리케이션의 기본 레이아웃
 */
/**
 * 루트 레이아웃 컴포넌트
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 컴포넌트들
 * @returns {JSX.Element} 애플리케이션의 기본 레이아웃
 */
export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      {/* 폰트 변수를 body에 적용 */}
      <body className={inter.className}>
        <AuthProvider>
        {/* 사이드바와 메인 콘텐츠를 포함하는 레이아웃 래퍼 */}
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
