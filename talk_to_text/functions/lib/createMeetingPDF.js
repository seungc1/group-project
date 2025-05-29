'use client';

import { jsPDF } from 'jspdf';
import nanumFont from './fonts/NanumGothic-Regular.js';

// 폰트 등록
jsPDF.API.events.push(['addFonts', function () {
  this.addFileToVFS('NanumGothic-Regular.ttf', nanumFont);
  this.addFont('NanumGothic-Regular.ttf', 'NanumGothic', 'normal');
}]);

export function createMeetingPDF(textContent) {
  const doc = new jsPDF();

  doc.addFileToVFS('NanumGothic-Regular.ttf', nanumFont);
  doc.addFont('NanumGothic-Regular.ttf', 'NanumGothic', 'normal');
  doc.setFont('NanumGothic');
  doc.setFontSize(12);

  if (!textContent || typeof textContent !== 'string' || textContent.trim() === '') {
    doc.text('회의 요약 텍스트가 비어 있습니다.', 20, 30);
    return doc;
  }

  if (textContent.includes('<html') || textContent.includes('<!DOCTYPE html>')) {
    doc.text('잘못된 데이터 형식입니다. HTML이 감지되었습니다.', 20, 30);
    return doc;
  }

  const lines = textContent.split('\n');
  const headerRegex = /^\[(.+?)\](?::\s*(.*))?$/;
  const groupedItems = [];
  const bodyLines = [];
  let currentItem = null;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const match = headerRegex.exec(trimmed);
    if (match) {
      if (currentItem) groupedItems.push(currentItem);
      currentItem = { category: match[1], content: match[2] || '' };
    } else if (currentItem) {
      currentItem.content += (currentItem.content ? '\n' : '') + trimmed;
    } else {
      bodyLines.push(trimmed);
    }
  });
  if (currentItem) groupedItems.push(currentItem);

  // 테이블 레이아웃 설정
  const startY = 20;
  const cellPadding = 2;
  const tableWidth = 180;  // 기존 200 → 180
  const col1Width = tableWidth * 1 / 6;  // 30
  const col2Width = tableWidth * 5 / 6;  // 150
  const lineHeight = 10;
  const headerHeight = lineHeight * 1.5;
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = (pageWidth - tableWidth) / 2;

  let y = startY;
  const tableTopY = y;

  // 제목 박스
  doc.setFontSize(16);
  // 제목 박스
  doc.setFontSize(16);
  doc.setFillColor(230, 230, 230);  // 연한 회색 배경
  doc.rect(marginX, y, tableWidth, headerHeight, 'F'); // 'F'로 채움
  doc.setTextColor(0, 0, 0);  // 글자색은 검정색 유지
  doc.text('업무 회의록', marginX + tableWidth / 2, y + lineHeight, { align: 'center' });
  y += headerHeight;
  doc.setFontSize(12);

  for (let i = 0; i < groupedItems.length; i++) {
    const item = groupedItems[i];

    if (item.category.trim() === '키워드') {
      continue;
    }

    const next = groupedItems[i + 1];
    const isMerged = next &&
      next.category.trim() !== '키워드' &&
      item.category.slice(0, 2) === next.category.slice(0, 2);

    const contentText = item.category.trim() === '키워드'
      ? item.content.replace(/\n/g, '  ')
      : item.content;

    const categoryLines = doc.splitTextToSize(item.category, col1Width - 2 * cellPadding);
    const contentLines = doc.splitTextToSize(contentText, col2Width - 2 * cellPadding);
    const maxLines = Math.max(categoryLines.length, contentLines.length);
    const rowHeight = maxLines * lineHeight;

    // 좌측 셀 (카테고리)
    doc.setFillColor(220, 220, 220);
    doc.rect(marginX, y, col1Width, rowHeight, 'F');
    doc.rect(marginX, y, col1Width, rowHeight, 'S');
    categoryLines.forEach((line, idx) => {
      doc.text(line, marginX + col1Width / 2, y + lineHeight * (idx + 1) - 2, { align: 'center' });
    });

    // 우측 셀 (내용)
    doc.rect(marginX + col1Width, y, col2Width, rowHeight);
    contentLines.forEach((line, idx) => {
      doc.text(line, marginX + col1Width + cellPadding, y + lineHeight * (idx + 1) - 2);
    });

    y += rowHeight;

    if (y > 270 && i !== groupedItems.length - 1) {
      doc.addPage();
      doc.setFont('NanumGothic');
      y = 10;
    }
  }

  const totalTableHeight = y - tableTopY;
  doc.setLineWidth(0.5);
  doc.rect(marginX, tableTopY, tableWidth, totalTableHeight);
  doc.setLineWidth(0.2);

  if (bodyLines.length > 0) {
    doc.addPage();
    doc.setFontSize(12);
    const bodyText = bodyLines.join('\n');
    const fullBodyLines = doc.splitTextToSize(bodyText, pageWidth - 20);  // 10 좌우 여백
    doc.text(fullBodyLines, 10, 10);
  }

  return doc;
}
