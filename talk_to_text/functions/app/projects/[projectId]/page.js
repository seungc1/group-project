'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { getMeetings, getProject } from '@/lib/meetingsService';
import Header from '@/components/ui/layout/Header';
import MeetingListItem from '@/components/features/Meeting/MeetingList/MeetingListItem';
import styles from './styles.module.css';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const meetingsPerPage = 5;
  const router = useRouter();

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!user || !projectId) return;
      
      try {
        // 프로젝트 정보 가져오기
        const projectData = await getProject(user.uid, projectId);
        setProject(projectData);
        
        // 프로젝트의 회의 목록 가져오기
        const meetingsList = await getMeetings(user.uid, projectId);
        setMeetings(meetingsList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [user, projectId]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생: {error}</div>;
  if (!project) return <div>프로젝트를 찾을 수 없습니다.</div>;

  // 페이지네이션 계산
  const indexOfLast = currentPage * meetingsPerPage;
  const indexOfFirst = indexOfLast - meetingsPerPage;
  const currentMeetings = meetings.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(meetings.length / meetingsPerPage);

  return (
    <>
      <Header title={`프로젝트: ${project.name}`} />
      <div className={styles.container}>
        <div className={styles.projectInfo}>
          <h2>{project.name || projectId}</h2>
          {project.description && (
            <p className={styles.description}>{project.description}</p>
          )}
          <button
            style={{ marginTop: 16, marginBottom: 16 }}
            onClick={() => router.push(`/projects/${projectId}/meetings/new`)}
          >
            회의 생성
          </button>
        </div>
        {meetings.length === 0 ? (
          <div className={styles.empty}>등록된 회의가 없습니다.</div>
        ) : (
          <>
            <div className={styles.meetingList}>
              {currentMeetings.map(meeting => (
                <MeetingListItem key={meeting.id} meeting={meeting} />
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
        )}
      </div>
    </>
  );
} 