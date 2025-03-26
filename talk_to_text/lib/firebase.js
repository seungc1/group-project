// firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // ✅ 추가
import { getStorage } from "firebase/storage";     // ✅ 추가

const firebaseConfig = {
  apiKey: "AIzaSyDH5W4RtjTzBkRa0wlPW9isIxv3jlAHRB8",
  authDomain: "talktotext-37f54.firebaseapp.com",
  projectId: "talktotext-37f54",
  storageBucket: "talktotext-37f54.appspot.com",  // ❗️ 수정: `.app` → `.app**spot.com**`
  messagingSenderId: "682893808651",
  appId: "1:682893808651:web:d6ba5b055ef8308506230e",
  measurementId: "G-MQ2Q6LCELZ"
};

// 중복 초기화 방지
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);    // ✅ 추가
const storage = getStorage(app); // ✅ 추가

let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, db, storage, analytics };
