import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { spawnSync } from 'child_process';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      console.error('[오류] 유효하지 않은 파일입니다.');
      return NextResponse.json({ error: '파일이 유효하지 않습니다.' }, { status: 400 });
    }

    // 파일 준비
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const timestamp = Date.now();
    const fileName = `converted_${timestamp}.wav`;

    const publicDir = path.join(process.cwd(), 'public', 'converted');
    const inputPath = path.join(publicDir, `input_${timestamp}`);
    const outputPath = path.join(publicDir, fileName);

    // input 임시 저장
    fs.writeFileSync(inputPath, buffer);

    // ffmpeg로 wav 변환
    const result = spawnSync('ffmpeg', [
      '-y', '-i', inputPath,
      '-ar', '16000', '-ac', '1',
      outputPath
    ]);

    // 에러 체크
    if (result.error || !fs.existsSync(outputPath)) {
      console.error('[ffmpeg 실행 실패]', result.error || result.stderr.toString());
      return NextResponse.json({ error: '오디오 변환 실패' }, { status: 500 });
    }

    // 임시 input 파일 삭제
    fs.unlinkSync(inputPath);

    // 다운로드 URL 반환
    const downloadUrl = `/converted/${fileName}`;
    return NextResponse.json({ downloadUrl });

  } catch (err) {
    console.error('[서버 오류 발생]', err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}