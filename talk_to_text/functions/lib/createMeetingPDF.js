'use client';

import { jsPDF } from 'jspdf';
import nanumFont from '../app/components/features/Meeting/MeetingDetail/NanumGothic-Regular.js';

jsPDF.API.events.push(['addFonts', function () {
  this.addFileToVFS('NanumGothic-Regular.ttf', nanumFont);
  this.addFont('NanumGothic-Regular.ttf', 'NanumGothic', 'normal');
}]);

export function createMeetingPDF(textContent) {
  const doc = new jsPDF();

  // ✅ 폰트 등록
  doc.addFileToVFS('NanumGothic-Regular.ttf', nanumFont);
  doc.addFont('NanumGothic-Regular.ttf', 'NanumGothic', 'normal');
  doc.setFont('NanumGothic');

  // 제목 페이지
  doc.setFontSize(22);
  doc.text('회의록 요약 보고서', 105, 60, { align: 'center' });

  const today = new Date().toLocaleDateString();
  doc.setFontSize(12);
  doc.text(`작성일: ${today}`, 105, 75, { align: 'center' });

  doc.addPage();

  // ✅ textContent 유효성 검사
  if (!textContent || typeof textContent !== 'string' || textContent.trim() === '') {
    doc.setFontSize(14);
    doc.text('회의 요약 텍스트가 비어 있습니다.', 20, 30);
    return doc;
  }

  if (textContent.includes('<html') || textContent.includes('<!DOCTYPE html>')) {
    doc.setFontSize(14);
    doc.text('잘못된 데이터 형식입니다. HTML이 감지되었습니다.', 20, 30);
    return doc;
  }

  // 📄 줄 단위 분석
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

  // 회의 요약 표 출력
  if (numberedItems.length > 0) {
    doc.setFontSize(14);
    doc.text('회의록', 105, 20, { align: 'center' });

    const startY = 30;
    const cellPadding = 2;
    const col1Width = 40;
    const col2Width = 150;
    const lineHeight = 8;
    let y = startY;

    numberedItems.forEach(({ number, content }) => {
      const category = content.split(':')[0];
      const contentText = content.split(':').slice(1).join(':').trim();

      const categoryLines = doc.splitTextToSize(category, col1Width - 2 * cellPadding);
      const contentLines = doc.splitTextToSize(contentText, col2Width - 2 * cellPadding);
      const maxLines = Math.max(categoryLines.length, contentLines.length);
      const rowHeight = maxLines * lineHeight;

      // 카테고리 셀
      doc.setFillColor(220, 220, 220);
      doc.rect(10, y, col1Width, rowHeight, 'F');
      doc.setDrawColor(0, 0, 0);
      doc.rect(10, y, col1Width, rowHeight, 'S');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      categoryLines.forEach((line, index) => {
        doc.text(line, 10 + cellPadding, y + lineHeight * (index + 1) - 2);
      });

      // 본문 셀
      doc.rect(10 + col1Width, y, col2Width, rowHeight);
      contentLines.forEach((line, index) => {
        doc.text(line, 10 + col1Width + cellPadding, y + lineHeight * (index + 1) - 2);
      });

      y += rowHeight;
      if (y > 270) {
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
