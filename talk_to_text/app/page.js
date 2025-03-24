'use client';

import { useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

export default function Home() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');

  const handleUpload = async () => {
    if (!file) return alert('파일을 선택하세요');

    const storageRef = ref(storage, `audio/${file.name}`);
    await uploadBytes(storageRef, file);
    alert('파일 업로드 완료!');
  };

  const handleSaveText = async () => {
    if (!text) return alert('텍스트를 입력하세요');

    await setDoc(doc(db, 'transcripts', 'sample'), {
      text,
      createdAt: new Date(),
    });

    alert('텍스트 저장 완료!');
  };

  return (
    <main style={{ padding: 32 }}>
      <h1>🎙️ 음성 파일 업로드 + 텍스트 저장</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={handleUpload} style={{ marginLeft: 10 }}>
          파일 업로드
        </button>
      </div>

      <div>
        <textarea
          rows={4}
          placeholder="텍스트 입력"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <br />
        <button onClick={handleSaveText}>텍스트 저장</button>
      </div>
    </main>
  );
}
