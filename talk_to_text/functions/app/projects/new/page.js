import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/app/context/AuthContext';

export default function ProjectCreatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }
    if (!name) {
      setError('프로젝트 이름을 입력하세요.');
      return;
    }
    setLoading(true);
    try {
      const projectId = Date.now().toString();
      await setDoc(doc(db, 'users', user.uid, 'projects', projectId), {
        projectId,
        name,
        description,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        members: [user.uid]
      });
      router.push(`/projects/${projectId}`);
    } catch (err) {
      setError('프로젝트 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 32 }}>
      <h1>프로젝트 생성</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div style={{ marginBottom: 16 }}>
          <label>프로젝트 이름</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>설명</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%' }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        <button type="submit" disabled={loading}>{loading ? '생성 중...' : '생성'}</button>
      </form>
    </main>
  );
} 