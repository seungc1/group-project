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
    <div className={styles['examples-upcoming-web']}>
      {/* 왼쪽 네비게이션 레일 */}
      <nav className={styles['navigation-rail']}>
        <div className={styles['nav-items']}>
          <div 
            className={styles['nav-item']} 
            onClick={() => router.push('/')}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.icon}>🏠</div>
            <span>홈</span>
          </div>
          <div 
            className={styles['nav-item']} 
            onClick={() => router.push('/create')}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.icon}>🎙️</div>
            <span>회의 생성</span>
          </div>
          <div className={styles['nav-item']}>
            <div className={styles.icon}>🎤</div>
            <span>음성 녹음</span>
          </div>
          <div 
            className={styles['nav-item']}
            onClick={() => router.push('/meetings')}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.icon}>📋</div>
            <span>전체 회의록</span>
          </div>
          <div className={styles['nav-item']}>
            <div className={styles.icon}>⚙️</div>
            <span>미정</span>
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className={styles['main-content']}>
        {/* 상단 헤더 */}
        <header className={styles.header}>
          <h1>Title</h1>
          <div className={styles['header-actions']}>
            <button className={styles['icon-button']}>📎</button>
            <button className={styles['icon-button']}>📅</button>
            <button className={styles['icon-button']}>⋮</button>
          </div>
        </header>

        {/* 캐러셀 섹션 */}
        <section className={styles.carousel}>
          <div className={styles['carousel-item']}></div>
          <div className={styles['carousel-item']}></div>
          <div className={styles['carousel-item']}></div>
          <div className={styles['carousel-item']}></div>
        </section>

        {/* 최근 회의 및 전체 노트 섹션 */}
        <section className={styles['recent-meetings']}>
          <h2>최근 회의 및 전체 노트?</h2>
          <div className={styles['meeting-list']}>
            <div className={styles['meeting-item']}>
              <div className={styles.thumbnail}></div>
              <div className={styles.content}>
                <h3>회의 이름</h3>
                <p>회의 간단 설명 ex) 노트 이름, 회의 날짜, 간단 요약?, 참석자</p>
              </div>
              <button className={styles['more-button']}>⋮</button>
            </div>
            <div className={styles['meeting-item']}>
              <div className={styles.thumbnail}></div>
              <div className={styles.content}>
                <h3>회의 이름</h3>
                <p>회의 간단 설명 ex) 노트 이름, 회의 날짜, 간단 요약?, 참석자</p>
              </div>
              <button className={styles['more-button']}>⋮</button>
            </div>
          </div>
        </section>

        {/* Floating Action Button */}
        <button className={styles.fab}>+</button>
      </main>
    </div>
  );
};