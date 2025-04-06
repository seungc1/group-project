'use client'; //Next.js 13+ 클라이언트 컴포넌트 선언

//상태 관리
import { useState, useEffect } from 'react'; //React의 상태 관리 훅

//firebase 설정
import { db, storage } from '@/lib/firebase'; //firebase 설정 파일에서 db와 storage 가져오기
import { collection, addDoc, serverTimestamp, updateDoc, doc, setDoc } from 'firebase/firestore'; //firestore 관련 함수
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

//라우팅
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() { //메인 컴포넌트 선어
  const router = useRouter(); //페이지 이동을 위한 라우터 객체

  //상태 관리 (useState 훅 사용)
  const [file, setFile] = useState(null); //업로드할 파일 상태
  const [title, setTitle] = useState(''); //회의 제목 상태
  const [participants, setParticipants] = useState(0); // 참석자 수 상태
  const [participantNames, setParticipantNames] = useState(''); // 참석자 이름 상태
  const [processing, setProcessing] = useState(false); // 처리 중 상태

  const formatDate = (date) => {  //날짜 형식 변환 함수
    const year = date.getFullYear(); //연도 추출
    const month = String(date.getMonth() + 1).padStart(2, '0'); //월 추출(1자리면 앞에 9 추가)
    const day = String(date.getDate()).padStart(2, '0'); // 월 추출 (1자리면 앞에 0 추가)
    return `${year}${month}${day}`; // YYYYMMDD 형식으로 반환
  };

  const handleUpload = async () => { //핵심기능
    // 입력값 검증
    if (!file) return alert('파일을 선택하세요'); //파일이 없으면 경고
    if (!title) return alert('제목을 입력하세요'); //제목이 없으면 경고
    if (!participants) return alert('참석자 수를 입력하세요'); //참석자 수가 없으면 경고
    if (!participantNames) return alert('참석자 이름을 입력하세요'); //참석자 이름이 없으면 경고

    try {
      setProcessing(true); //처리 시작 상태 설정

      // 파일명 생성 (문서 ID로도 사용)
      const currentDate = formatDate(new Date()); //현재 날짜 형식 변환
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9가-힣]/g, '_'); //제목에서 특수문자 제거
      const docId = `${currentDate}_${sanitizedTitle}_${participants}명`; //문서 ID 생성
      const fileExtension = file.name.split('.').pop(); //파일 확장자 추출
      const newFileName = `${docId}.${fileExtension}`; //새로운 파일명 생성

      // 1. 회의록 문서 생성 (ID 지정)
      //firestore에 회의록 문서 생성
      await setDoc(doc(db, 'meetings', docId), {
        title,
        participants: parseInt(participants),
        participantName: participantNames.split(',').map(name => name.trim()),
        createAt: serverTimestamp()
      });

      // 2. 음성 파일 업로드(Firebase Storage에 파일 업로드)
      const storageRef = ref(storage, `audio/${newFileName}`);
      await uploadBytes(storageRef, file);
      
      // 3. 업로드된 파일의 URL 가져오기
      const audioUrl = await getDownloadURL(storageRef);
      
      // 4. 음성 처리 요청(음성 처리 API 호출)
      const response = await fetch('/api/process-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioUrl })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '음성 처리 중 오류가 발생했습니다');
      }
      
      // 5. Firestore 문서 업데이트(음성 처리 결과를 Firestore에 저장)
      const textinfo = result.transcript.map(segment => ({
        speaker: segment.speaker,
        text: segment.text
      }));

      const updateData = {
        audioUrl,
        audioFileName: newFileName,
        textinfo    // 텍스트 정보만 저장
      };
      
      await updateDoc(doc(db, 'meetings', docId), updateData);

      alert('회의록 저장 완료!');
      
      // 6. 폼 초기화
      setFile(null);
      setTitle('');
      setParticipants(0);
      setParticipantNames('');
    } catch (error) {
      console.error('Error saving meeting:', error);
      alert(error.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false); //처리 완료 상태 설정
    }
  };

  //UI 렌더링
  return (
    <div className={styles.container}>
      {/* 왼쪽 사이드바 */}
      <nav className={styles.sidebar}>
        <div className={styles.sidebarItem}>
          <span className={styles.icon}>⭐</span>
          <span>회의 생성</span>
        </div>
        <div className={styles.sidebarItem}>
          <span className={styles.icon}>⭐</span>
          <span>회의록 목록</span>
        </div>
        <div className={styles.sidebarItem}>
          <span className={styles.icon}>⭐</span>
          <span>전체 노트</span>
        </div>
        <div className={styles.sidebarItem}>
          <span className={styles.icon}>⭐</span>
          <span>설정</span>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className={styles.mainContent}>
        {/* 상단 헤더 */}
        <header className={styles.header}>
          <h1>회의록 관리</h1>
          <div className={styles.headerActions}>
            <button className={styles.iconButton}>📎</button>
            <button className={styles.iconButton}>📅</button>
            <button className={styles.iconButton}>⋮</button>
          </div>
        </header>

        {/* 회의록 생성 섹션 */}
        <section className={styles.section}>
          <div className={styles.card}>
            <h2>회의록 생성</h2>
            <p>음성 파일을 업로드하여 회의록을 자동으로 생성합니다.</p>
            <button 
              className={styles.button}
              onClick={() => router.push('/create')}
            >
              회의록 생성하기
            </button>
          </div>

          <div className={styles.card}>
            <h2>회의록 목록</h2>
            <p>생성된 모든 회의록을 확인하고 관리합니다.</p>
            <button 
              className={styles.button}
              onClick={() => router.push('/meetings')}
            >
              회의록 목록 보기
            </button>
          </div>
        </section>

        {/* 최근 회의 및 전체 노트 섹션 */}
        <section className={styles.section}>
          <h2>최근 회의 및 전체 노트?</h2>
          <div className={styles.meetingList}>
            <div className={styles.meetingItem}>
              <div className={styles.meetingIcon}></div>
              <div className={styles.meetingContent}>
                <h3>회의 이름</h3>
                <p>회의 간단 설명 ex) 노트 이름, 회의 날짜, 간단 요약?, 참석자</p>
              </div>
              <button className={styles.moreButton}>⋮</button>
            </div>
            <div className={styles.meetingItem}>
              <div className={styles.meetingIcon}></div>
              <div className={styles.meetingContent}>
                <h3>회의 이름</h3>
                <p>회의 간단 설명 ex) 노트 이름, 회의 날짜, 간단 요약?, 참석자</p>
              </div>
              <button className={styles.moreButton}>⋮</button>
            </div>
          </div>
        </section>

        {/* Floating Action Button */}
        <button 
          className={styles.fab}
          onClick={() => router.push('/create')}
        >
          +
        </button>
      </main>
    </div>
  );
}
