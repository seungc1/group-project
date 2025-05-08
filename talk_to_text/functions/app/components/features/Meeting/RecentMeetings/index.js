'use client';

/**
 * 최근 프로젝트를 표시하는 컴포넌트
 * - 최근 프로젝트 2개를 표시
 */
import styles from './styles.module.css';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function RecentMeetings() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  // 최근 프로젝트 2개 불러오기
  useEffect(() => {
    const fetchRecentProjects = async () => {
      if (!user) return;
      const q = query(
        collection(db, 'users', user.uid, 'projects'),
        orderBy('createdAt', 'desc'),
        limit(2)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setProjects([]);
      }
      setLoading(false);
    };
    fetchRecentProjects();
  }, [user]);

  if (loading) return <div>로딩 중...</div>;
  if (projects.length === 0) return <div>최근 프로젝트가 없습니다.</div>;

  return (
    <div className={styles.recentMeetings}>
      <h2>최근 프로젝트</h2>
      {projects.map(project => (
        <div 
          key={project.id} 
          className={styles.projectCard}
          onClick={() => router.push(`/projects/${project.id}`)}
        >
          <h3>프로젝트: {project.name || project.id}</h3>
          <p>생성일: {project.createdAt?.toDate().toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
} 