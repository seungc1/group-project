/**
 * 회의록 API 라우트 핸들러
 * - Firebase Firestore에서 회의록 데이터를 조회하는 API 엔드포인트
 * - GET 요청을 처리하여 회의록 목록을 반환
 */

// Next.js 서버 응답 객체 임포트
import { NextResponse } from 'next/server';
// Firebase 데이터베이스 인스턴스 임포트
import { db } from 'lib/firebase';
// Firestore 쿼리 관련 함수들 임포트
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

/**
 * 회의록 목록을 조회하는 GET API 핸들러
 * @returns {Promise<NextResponse>} 회의록 목록 또는 에러 응답
 */
export async function GET() {
  try {
    // Firestore의 meetings 컬렉션 참조 생성
    const meetingsRef = collection(db, 'meetings');
    // 생성일자 기준 내림차순 정렬 쿼리 생성
    const q = query(meetingsRef, orderBy('createAt', 'desc'));
    // 쿼리 실행 및 스냅샷 가져오기
    const querySnapshot = await getDocs(q);
    
    // 스냅샷을 회의록 객체 배열로 변환
    const meetings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 회의록 목록을 JSON 응답으로 반환
    return NextResponse.json(meetings);
  } catch (error) {
    // 에러 로깅
    console.error('Error fetching meetings:', error);
    // 에러 응답 반환
    return NextResponse.json(
      { error: '회의록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 