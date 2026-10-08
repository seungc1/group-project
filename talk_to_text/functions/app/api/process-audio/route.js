import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('Audio processing request received');
    
    const { audioUrl, docId } = await request.json();
    
    if (!audioUrl) {
      console.error('No audio URL provided');
      return NextResponse.json(
        { success: false, error: '음성 파일 URL이 필요합니다' },
        { status: 400 }
      );
    }

    if (!docId) {
      console.error('No document ID provided');
      return NextResponse.json(
        { success: false, error: '문서 ID가 필요합니다' },
        { status: 400 }
      );
    }

    console.log('Sending request to Python server:', audioUrl, docId);
    
    // Python 서버로 요청 전달
    const response = await fetch('http://127.0.0.1:5000/process-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audioUrl, docId })
    });
    
    console.log('Python server response status:', response.status);
    
    const result = await response.json();
    console.log('Python server response:', result);
    
    if (!response.ok) {
      throw new Error(result.error || '음성 처리 중 오류가 발생했습니다');
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in process-audio API route:', error);
    
    // Python 서버 연결 실패 확인
    if (error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Python 서버가 실행되지 않았습니다. 서버를 실행해주세요.' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '서버 처리 중 오류가 발생했습니다'
      },
      { status: 500 }
    );
  }
} 