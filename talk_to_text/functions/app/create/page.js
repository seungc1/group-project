"use client";
/**
 * 회의록 생성 페이지 컴포넌트
 * - 회의록 생성을 위한 폼을 포함하는 페이지
 * - Header와 MeetingForm 컴포넌트로 구성
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/app/context/AuthContext';
import Header from '../components/ui/layout/Header/index';
import styles from '../components/features/Meeting/MeetingForm/styles.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * 회의록 생성 페이지 메인 컴포넌트
 * @returns {JSX.Element} 회의록 생성 페이지 UI
 */
export default function CreateProject() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [participants, setParticipants] = useState('');
  const [participantNames, setParticipantNames] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }
    if (!name || !startDate || !participants || !participantNames) {
      setError('모든 필수 항목을 입력하세요.');
      return;
    }
    setLoading(true);
    try {
      const projectId = Date.now().toString();
      await setDoc(doc(db, 'users', user.uid, 'projects', projectId), {
        projectId,
        name,
        description,
        startDate: startDate ? startDate.toISOString().slice(0, 10) : '',
        participants: Number(participants),
        participantNames: participantNames.split(',').map(n => n.trim()),
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

  if (!user) {
    return <div className={styles.error}>로그인이 필요합니다.</div>;
  }

  return (
    <>
      <Header title="프로젝트 생성" />
      <main>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>프로젝트 이름</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="프로젝트 이름을 입력하세요"
            />
          </div>
          <div className={styles.formGroup}>
            <label>프로젝트 설명</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="프로젝트 설명을 입력하세요"
            />
          </div>
          <div className={styles.formGroup}>
            <label>프로젝트 시작 날짜</label>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="날짜를 선택하세요"
              className={styles.input}
              calendarClassName={styles.datepickerCalendar}
              popperPlacement="bottom-start"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>참석자 수</label>
            <input
              type="number"
              value={participants}
              onChange={e => setParticipants(e.target.value)}
              required
              placeholder="참석자 수를 입력하세요"
            />
          </div>
          <div className={styles.formGroup}>
            <label>참석자 이름 (쉼표로 구분)</label>
            <input
              type="text"
              value={participantNames}
              onChange={e => setParticipantNames(e.target.value)}
              required
              placeholder="참석자 이름을 입력하세요"
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} style={{marginTop: '1rem', padding: '1rem', borderRadius: '0.5rem', background: '#4f46e5', color: 'white', fontWeight: 600, fontSize: '1.125rem', border: 'none', cursor: 'pointer'}}>
            {loading ? '생성 중...' : '생성'}
          </button>
        </form>
      </main>
    </>
  );
}