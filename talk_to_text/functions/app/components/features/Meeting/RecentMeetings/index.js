'use client';

/**
 * 최근 회의 및 전체 노트를 표시하는 컴포넌트
 * - 최근 회의 목록을 그리드 형태로 표시
 * - 각 회의 항목은 MeetingItem 컴포넌트를 사용하여 렌더링
 */
import { getMeetings } from '@/lib/meetingsService';
import MeetingItem from '../MeetingItem';
import styles from './styles.module.css';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function RecentMeetings() {
  const [projects, setProjects] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  // 최근 프로젝트 2개 불러오기
  useEffect(() => {
    const fetchRecentProjects = async () => {
      if (!user) return;
      const q = query(
        collection(db, 'users', user.uid, 'projects'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setProjects([]);
      }
    };
    fetchRecentProjects();
  }, [user]);

  // 각 프로젝트별 meetings 불러오기
  useEffect(() => {
    const fetchMeetings = async () => {
      if (user && projects.length > 0) {
        try {
          const allMeetings = [];
          for (const project of projects) {
            const meetingsList = await getMeetings(user.uid, project.id);
            allMeetings.push({ project, meetings: meetingsList });
          }
          setMeetings(allMeetings);
        } catch (error) {
          console.error('회의 목록 조회 실패:', error);
        } finally {
          setLoading(false);
        }
      } else if (user && projects.length === 0) {
        setMeetings([]);
        setLoading(false);
      }
    };
    fetchMeetings();
  }, [user, projects]);

  if (loading) return <div>로딩 중...</div>;
  if (projects.length === 0) return <div>최근 프로젝트가 없습니다.</div>;

  return (
    <div className={styles.recentMeetings}>
      <h2>최근 회의</h2>
      {meetings.map(({ project, meetings }) => (
        <div 
          key={project.id} 
          className={styles.projectCard}
          onClick={() => router.push(`/projects/${project.id}`)}
        >
          <h3>프로젝트: {project.name || project.id}</h3>
          <div className={styles.meetingList}>
            {meetings.length === 0 ? (
              <div>최근 회의가 없습니다.</div>
            ) : (
              meetings.map(meeting => (
                <MeetingItem key={meeting.id} meeting={meeting} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 