'use client';

/**
 * ProjectList 컴포넌트 (기존 MeetingListItem 디자인/구조와 동일)
 * - 해당 계정의 프로젝트 목록을 MeetingListItem 스타일로 표시
 */
import { getAllProjects } from '@/lib/meetingsService';
import styles from './styles.module.css';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

function ProjectListItem({ project }) {
  const router = useRouter();
  const handleClick = () => {
    router.push(`/projects/${project.id}`);
  };
  return (
    <div className={styles.meetingItem}>
      <div className={styles.meetingContent}>
        <h3>{project.name}</h3>
        <p>설명: {project.description || '-'}</p>
        <p>생성일: {project.createdAt?.toDate ? project.createdAt.toDate().toLocaleDateString() : '-'}</p>
      </div>
      <button className={styles.viewButton} onClick={handleClick}>
        보기
      </button>
    </div>
  );
}

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 5;

  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        try {
          const projectsList = await getAllProjects(user.uid);
          setProjects(projectsList);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProjects();
  }, [user]);

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>에러 발생: {error}</div>;
  }

  if (projects.length === 0) {
    return <div className={styles.empty}>프로젝트가 없습니다.</div>;
  }

  // 페이지네이션 계산
  const indexOfLast = currentPage * projectsPerPage;
  const indexOfFirst = indexOfLast - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  return (
    <>
      <div className={styles.meetingList}>
        {currentProjects.map(project => (
          <ProjectListItem project={project} key={project.id} />
        ))}
      </div>
      {/* 페이지네이션 버튼 */}
      <div className={styles.paginationContainer}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={
              currentPage === i + 1
                ? `${styles.pageButton} ${styles.activePageButton}`
                : styles.pageButton
            }
          >
            {i + 1}
          </button>
        ))}
      </div>
    </>
  );
} 