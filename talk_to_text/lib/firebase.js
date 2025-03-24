import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"; // ✅ 추가
import { getFirestore } from "firebase/firestore"; // ✅ Firestore도 같이

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyA5Mk_3UwacG9Y4ZKzUQTvz8rlL52nLEXE",
  authDomain: "talktotext-b57a1.firebaseapp.com",
  projectId: "talktotext-b57a1",
  storageBucket: "talktotext-b57a1.appspot.com",
  messagingSenderId: "528255242962",
  appId: "1:528255242962:web:c49f8050834e8c97b8130b",
  measurementId: "G-PH3B18KTS6"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);       // ✅ Storage 추가
const db = getFirestore(app);          // ✅ Firestore 추가

// 브라우저 환경에서만 Analytics 사용
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, db, storage, analytics }; // ✅ 모두 export
