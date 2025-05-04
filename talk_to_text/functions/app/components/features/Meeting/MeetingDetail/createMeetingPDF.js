'use client';

import { jsPDF } from 'jspdf';
import nanumFont from './NanumGothic-Regular.js';

jsPDF.API.events.push(['addFonts', function () {
  this.addFileToVFS('NanumGothic-Regular.ttf', nanumFont);
  this.addFont('NanumGothic-Regular.ttf', 'NanumGothic', 'normal');
}]);


export function createMeetingPDF(textContent) {
  const doc = new jsPDF();
  doc.setFont('NanumGothic');

  // 제목 페이지
  doc.setFontSize(22);
  doc.text('회의록 요약 보고서', 105, 60, { align: 'center' });

  const today = new Date().toLocaleDateString();
  doc.setFontSize(12);
  doc.text(`작성일: ${today}`, 105, 75, { align: 'center' });

  doc.addPage();

  const numberedItems = [];
  const bodyLines = [];
  const lines = textContent.split('\n');
  const numberedRegex = /^(\d+)[\.\)]\s*(.*)$/;
  let currentItem = null;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    const match = numberedRegex.exec(trimmedLine);

    if (match) {
      if (currentItem) numberedItems.push(currentItem);
      currentItem = { number: match[1], content: match[2] };
    } else {
      if (currentItem) {
        currentItem.content += '\n' + trimmedLine;
      } else if (trimmedLine !== '') {
        bodyLines.push(trimmedLine);
      }
    }
  });

  if (currentItem) numberedItems.push(currentItem);

  // 회의록 표 출력
  if (numberedItems.length > 0) {
    doc.setFontSize(14);
    doc.text('회의록', 105, 20, { align: 'center' });

    const startY = 30;
    const cellPadding = 2;
    const col1Width = 50;  // 카테고리 셀의 너비
    const col2Width = 140; // 내용 셀의 너비
    const lineHeight = 8;
    let y = startY;

    numberedItems.forEach(({ number, content }) => {
      const category = content.split(':')[0]; // 카테고리 (예: 주제, 결정사항)
      const contentText = content.split(':').slice(1).join(':').trim(); // 내용

      // 내용 텍스트 줄 맞추기
      const contentLines = doc.splitTextToSize(contentText, col2Width - 2 * cellPadding);
      const rowHeight = contentLines.length * lineHeight;

      // 카테고리 셀 배경 색상 설정 (연한 회색)
      doc.setFillColor(220, 220, 220);  // 연한 회색
      doc.rect(10, y, col1Width, rowHeight, 'F'); // 카테고리 셀 배경 채우기

      // 카테고리 셀 외곽선 다시 그리기
      doc.setDrawColor(0, 0, 0); // 검정색 외곽선
      doc.rect(10, y, col1Width, rowHeight, 'S'); // 외곽선만 그리기 (S = stroke)

      // 카테고리 텍스트 삽입
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0); // 검정 색상
      doc.text(category, 10 + cellPadding, y + lineHeight - 2);

      // 내용 셀 테두리 그리기
      doc.rect(10 + col1Width, y, col2Width, rowHeight);

      // 내용 텍스트 삽입
      doc.text(contentLines, 10 + col1Width + cellPadding, y + lineHeight - 2);

      y += rowHeight;
      if (y > 270) {  // 페이지가 넘어가면 새로운 페이지 추가
        doc.addPage();
        y = 10;
      }
    });

    doc.addPage();
  }

  // 본문 출력
  if (bodyLines.length > 0) {
    doc.setFontSize(12);
    const bodyText = bodyLines.join('\n');
    const fullBodyLines = doc.splitTextToSize(bodyText, 180);
    doc.text(fullBodyLines, 10, 10);
  }

  return doc;
}
