'use client';

/**
 * ProjectList 컴포넌트 (기존 MeetingListItem 디자인/구조와 동일)
 * - 해당 계정의 프로젝트 목록을 MeetingListItem 스타일로 표시
 */
import { getAllProjects } from '@/lib/meetingsService';
import styles from './styles.module.css';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '@/components/common/Pagination';

function ProjectListItem({ project, currentPage }) {
  const router = useRouter();
  const handleClick = () => {
    router.push(`/projects/${project.id}?page=${currentPage}`);
  };
  return (
    <div className={styles.meetingItem}>
      <div className={styles.meetingContent}>
        <h3 style={{ color: '#111' }}>{project.name}</h3>
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' 또는 'desc'
  const projectsPerPage = 5;

  useEffect(() => {
    setCurrentPage(pageParam);
  }, [pageParam]);

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

  // 프로젝트 정렬 함수
  const sortProjects = (projects, order) => {
    return [...projects].sort((a, b) => {
      const dateA = new Date(a.createdAt?.toDate?.() || 0);
      const dateB = new Date(b.createdAt?.toDate?.() || 0);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  // 정렬 순서 변경
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    setProjects(prev => sortProjects(prev, newOrder));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    router.push(`/meetings?page=${page}`);
  };

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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          onClick={toggleSortOrder}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            background: '#fff',
            color: '#4f46e5',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14
          }}
        >
          {sortOrder === 'asc' ? '오래된순' : '최신순'}
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>
      <div className={styles.meetingList}>
        {currentProjects.map(project => (
          <ProjectListItem project={project} key={project.id} currentPage={currentPage} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
} 