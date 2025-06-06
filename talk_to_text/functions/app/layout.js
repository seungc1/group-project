// talk_to_text/functions/app/layout.js
// 전역 스타일시트 임포트
import "./globals.css";
// 레이아웃 래퍼 컴포넌트 임포트
import LayoutWrapper from './components/layout/LayoutWrapper';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/app/context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ subsets: ['latin'] });

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
export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
