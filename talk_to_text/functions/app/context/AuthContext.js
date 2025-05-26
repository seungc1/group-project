'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const logout = async () => {
    await signOut(auth); // Firebase에서 세션 제거
    setUser(null);       // 상태도 초기화
    setAccessToken(null);
  };

  // 구글 로그인 함수 (accessToken 포함)
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar'); // 🔧 추가: Calendar 권한

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    setUser(result.user);
    setAccessToken(token); // 🔧 추가: 토큰 저장
  };

  return (
    <AuthContext.Provider value={{ user, logout,loginWithGoogle, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);