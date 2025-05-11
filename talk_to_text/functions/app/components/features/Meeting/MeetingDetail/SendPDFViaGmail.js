import { createMeetingPDF } from '@/lib/createMeetingPDF';

// PDF Blob → base64 (줄바꿈 포함)
function blobToBase64WithLineBreaks(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      const formatted = base64.replace(/(.{76})/g, '$1\n'); // 76자마다 줄바꿈
      resolve(formatted);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// MIME 메시지 생성 함수
function createMIMEEmail({ to, from, subject, message, filename, base64PDF }) {
  const boundary = 'boundary123';
  const encodedSubject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    message,
    ``,
    `--${boundary}`,
    `Content-Type: application/pdf; name="${filename}"`,
    `Content-Disposition: attachment; filename="${filename}"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    base64PDF,
    `--${boundary}--`,
    ``,
  ].join('\r\n');
}

// Base64url 인코딩 (MIME 메시지 전체에 적용)
function toBase64Url(str) {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  utf8Bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// 최종 PDF 생성 → MIME → Gmail Draft
export async function sendPDFViaGmail(textContent) {
  try {
    // 1. PDF 생성 및 arraybuffer → Blob 변환
    const pdfDoc = createMeetingPDF(textContent);
    const arrayBuffer = pdfDoc.output('arraybuffer');
    const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });

    // 2. base64 변환 (76자 줄바꿈 포함)
    const base64PDF = await blobToBase64WithLineBreaks(pdfBlob);

    // 3. MIME 메시지 구성
    const mimeMessage = createMIMEEmail({
      to: '', // 실제 이메일 주소 필요 시 여기에
      from: 'me',
      subject: '회의 요약 보고서',
      message: '첨부된 PDF 파일을 확인해주세요.',
      filename: 'meeting-summary.pdf',
      base64PDF,
    });

    // 4. Gmail API용 raw 포맷 변환 (Base64url 인코딩)
    const raw = toBase64Url(mimeMessage);

    // 5. Gmail Draft 생성
    const result = await gapi.client.gmail.users.drafts.create({
      userId: 'me',
      resource: {
        message: {
          raw,
        },
      },
    });

    console.log('✅ 초안 생성 성공:', result);
  } catch (err) {
    console.error('❌ 초안 생성 실패:', err);
  }
}
