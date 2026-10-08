'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
{/*import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider} from 'firebase/auth';*/}
{/*import { auth } from '@/lib/firebase';*/}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth); // Firebase에서 세션 제거
    setUser(null);       // 상태도 초기화
    setAccessToken(null);
  };

  const signup = async (email, password, name) => {
    if (!auth) throw new Error('Firebase Auth가 초기화되지 않았습니다.');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    if (name) {
      await updateProfile(user, { displayName: name });
    }
    // Firestore에 사용자 정보 저장
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      name: name,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      role: 'user',
      settings: { notifications: true, theme: 'light' },
      userId: user.uid
    });
    return user;
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
    <AuthContext.Provider value={{ user, logout,loginWithGoogle, accessToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);