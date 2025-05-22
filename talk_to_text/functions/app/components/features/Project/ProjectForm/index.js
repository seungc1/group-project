"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/app/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/app/context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './styles.module.css';

export default function ProjectForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [participants, setParticipants] = useState('');
  const [participantNames, setParticipantNames] = useState(['']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleParticipantNameChange = (idx, value) => {
    setParticipantNames(prev => prev.map((name, i) => i === idx ? value : name));
  };
  const handleAddParticipant = () => {
    setParticipantNames(prev => [...prev, '']);
  };
  const handleRemoveParticipant = (idx) => {
    if (participantNames.length === 1) return;
    setParticipantNames(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }
    if (!name || !startDate || participantNames.filter(n => n.trim()).length === 0) {
      setError('모든 필수 항목을 입력하세요.');
      return;
    }
    setLoading(true);
    try {
      const projectId = Date.now().toString();
      let names = participantNames;
      if (typeof names === 'string') {
        try {
          names = JSON.parse(names);
        } catch {
          names = names.split(',').map(n => n.trim());
        }
      }
      names = Array.isArray(names) ? names.filter(n => n.trim()) : [];
      await setDoc(doc(db, 'users', user.uid, 'projects', projectId), {
        projectId,
        name,
        description,
        startDate: startDate ? startDate.toISOString().slice(0, 10) : '',
        participants: names.length,
        participantNames: names,
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
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label>프로젝트 이름</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          placeholder="프로젝트 이름을 입력하세요"
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <label>프로젝트 설명</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="프로젝트 설명을 입력하세요"
          className={styles.input}
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
        <label>참석자 이름</label>
        {participantNames.map((name, idx) => (
          <div key={idx} className={styles.participantInput}>
            <input
              type="text"
              value={name}
              onChange={e => handleParticipantNameChange(idx, e.target.value)}
              placeholder="참석자 이름을 입력하세요"
              required
              className={styles.input}
            />
            {participantNames.length > 1 && (
              <button 
                type="button" 
                onClick={() => handleRemoveParticipant(idx)}
                className={styles.removeButton}
              >
                -
              </button>
            )}
            {idx === participantNames.length - 1 && (
              <button 
                type="button" 
                onClick={handleAddParticipant}
                className={styles.addButton}
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <button 
        type="submit" 
        disabled={loading} 
        className={styles.submitButton}
      >
        {loading ? '생성 중...' : '생성'}
      </button>
    </form>
  );
} 