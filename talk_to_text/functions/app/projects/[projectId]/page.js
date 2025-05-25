'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { getMeetings, getProject } from '@/lib/meetingsService';
import { useBookmarks } from '@/app/hooks/useBookmarks';
import Header from '@/components/ui/layout/Header';
import ProjectHeader from '@/components/features/Project/ProjectHeader';
import MeetingFilters from '@/components/features/Project/MeetingFilters';
import MeetingListItem from '@/components/features/Meeting/MeetingList/MeetingListItem';
import styles from './styles.module.css';
import Pagination from '@/components/common/Pagination';
import CloseButton from '@/components/common/buttons/CloseButton';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [sortOrder, setSortOrder] = useState('desc');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  
  const { bookmarkedMeetings, toggleBookmark } = useBookmarks(user, projectId);
  const meetingsPerPage = 5;

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!user || !projectId) return;
      
      try {
        const projectData = await getProject(user.uid, projectId);
        setProject(projectData);
        
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

  const sortMeetings = (meetings, order) => {
    return [...meetings].sort((a, b) => {
      const dateA = a.meetingDate?.toDate?.() || new Date(0);
      const dateB = b.meetingDate?.toDate?.() || new Date(0);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  const handleSortChange = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    setMeetings(prev => sortMeetings(prev, newOrder));
  };

  const filteredMeetings = showBookmarkedOnly
    ? meetings.filter(meeting => bookmarkedMeetings.has(meeting.id))
    : meetings;

  const indexOfLast = currentPage * meetingsPerPage;
  const indexOfFirst = indexOfLast - meetingsPerPage;
  const currentMeetings = filteredMeetings.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMeetings.length / meetingsPerPage);

  // 페이지네이션 핸들러: 상태와 URL 동기화
  const handlePageChange = (page) => {
    setCurrentPage(page);
    router.push(`/projects/${projectId}?page=${page}`);
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생: {error}</div>;
  if (!project) return <div>프로젝트를 찾을 수 없습니다.</div>;

  return (
    <>
      <Header title={`프로젝트: ${project.name}`} page={currentPage} />
      <div className={styles.container}>
        <ProjectHeader
          project={project}
          onCreateMeeting={() => router.push(`/projects/${projectId}/meetings/new`)}
          onClose={() => {
            if (currentPage && !isNaN(currentPage)) {
              router.push(`/meetings?page=${currentPage}`);
            } else {
              router.push('/meetings');
            }
          }}
        />
        
        {meetings.length === 0 ? (
          <div className={styles.empty}>등록된 회의가 없습니다.</div>
        ) : (
          <>
            <MeetingFilters
              showBookmarkedOnly={showBookmarkedOnly}
              onFilterChange={setShowBookmarkedOnly}
              bookmarkedCount={bookmarkedMeetings.size}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
            
            {filteredMeetings.length === 0 ? (
              <div className={styles.empty}>
                {showBookmarkedOnly ? '북마크된 회의가 없습니다.' : '등록된 회의가 없습니다.'}
              </div>
            ) : (
              <div className={styles.meetingList}>
                {currentMeetings.map(meeting => (
                  <div key={meeting.id} className={styles.meetingItem}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(meeting.id);
                      }}
                      className={styles.bookmarkButton}
                      title={bookmarkedMeetings.has(meeting.id) ? '북마크 해제' : '북마크 추가'}
                    >
                      {bookmarkedMeetings.has(meeting.id) ? '⭐' : '☆'}
                    </button>
                    <MeetingListItem meeting={meeting} currentPage={currentPage} projectId={projectId} />
                  </div>
                ))}
              </div>
            )}
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </>
  );
} 