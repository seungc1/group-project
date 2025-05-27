'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.error('Firebase Auth is not initialized');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const logout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
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

  const login = async (email, password) => {
    if (!auth) throw new Error('Firebase Auth가 초기화되지 않았습니다.');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  const value = {
    user,
    loading,
    logout,
    signup,
    login
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 