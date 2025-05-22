'use client';

import { jsPDF } from 'jspdf';
import nanumFont from './fonts/NanumGothic-Regular.js';

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

  const startY = 30;
  const cellPadding = 2;
  const col1Width = 30;
  const col2Width = 150;
  const tableWidth = col1Width + col2Width;
  const lineHeight = 10;
  let y = startY;
  const tableTopY = y;

  const headerHeight = lineHeight * 1.5;
  doc.setFontSize(16);
  doc.rect(10, y, tableWidth, headerHeight);
  doc.text('업무 회의록', 10 + tableWidth / 2, y + lineHeight, { align: 'center' });
  y += headerHeight;
  doc.setFontSize(12);

  for (let i = 0; i < groupedItems.length; i++) {
    const item = groupedItems[i];
    const next = groupedItems[i + 1];
    const isMerged = next && item.category.slice(0, 2) === next.category.slice(0, 2);

    if (isMerged) {
      const leftCatLines = doc.splitTextToSize(item.category, col1Width - 2 * cellPadding);
      const leftContentLines = doc.splitTextToSize(item.content, (col2Width / 2) - 2 * cellPadding);
      const rightCatLines = doc.splitTextToSize(next.category, col1Width - 2 * cellPadding);
      const rightContentLines = doc.splitTextToSize(next.content, (col2Width / 2) - 2 * cellPadding);
      const maxLines = Math.max(leftCatLines.length, leftContentLines.length, rightCatLines.length, rightContentLines.length);
      const rowHeight = maxLines * lineHeight;

      doc.setFillColor(220, 220, 220);
      doc.rect(10, y, col1Width, rowHeight, 'F');
      doc.rect(10, y, col1Width, rowHeight, 'S');
      leftCatLines.forEach((line, idx) => {
        doc.text(line, 10 + col1Width / 2, y + lineHeight * (idx + 1) - 2, { align: 'center' });
      });

      doc.rect(10 + col1Width, y, (col2Width / 2), rowHeight);
      leftContentLines.forEach((line, idx) => {
        doc.text(line, 10 + col1Width + cellPadding, y + lineHeight * (idx + 1) - 2);
      });

      doc.setFillColor(220, 220, 220);
      doc.rect(10 + col1Width + (col2Width / 2), y, col1Width, rowHeight, 'F');
      doc.rect(10 + col1Width + (col2Width / 2), y, col1Width, rowHeight, 'S');
      rightCatLines.forEach((line, idx) => {
        doc.text(line, 10 + col1Width + (col2Width / 2) + col1Width / 2, y + lineHeight * (idx + 1) - 2, { align: 'center' });
      });

      doc.rect(10 + col1Width * 2 + (col2Width / 2), y, (col2Width / 2 - col1Width), rowHeight);
      rightContentLines.forEach((line, idx) => {
        doc.text(line, 10 + col1Width * 2 + (col2Width / 2) + cellPadding, y + lineHeight * (idx + 1) - 2);
      });

      y += rowHeight;
      i++;
      continue;
    }

    const categoryLines = doc.splitTextToSize(item.category, col1Width - 2 * cellPadding);
    const contentLines = doc.splitTextToSize(item.content, col2Width - 2 * cellPadding);
    const maxLines = Math.max(categoryLines.length, contentLines.length);
    const rowHeight = maxLines * lineHeight;

    doc.setFillColor(220, 220, 220);
    doc.rect(10, y, col1Width, rowHeight, 'F');
    doc.rect(10, y, col1Width, rowHeight, 'S');
    categoryLines.forEach((line, idx) => {
      doc.text(line, 10 + col1Width / 2, y + lineHeight * (idx + 1) - 2, { align: 'center' });
    });

    doc.rect(10 + col1Width, y, col2Width, rowHeight);
    contentLines.forEach((line, idx) => {
      doc.text(line, 10 + col1Width + cellPadding, y + lineHeight * (idx + 1) - 2);
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
  doc.rect(10, tableTopY, tableWidth, totalTableHeight);
  doc.setLineWidth(0.2);

  if (bodyLines.length > 0) {
    doc.addPage();
    doc.setFontSize(12);
    const bodyText = bodyLines.join('\n');
    const fullBodyLines = doc.splitTextToSize(bodyText, 180);
    doc.text(fullBodyLines, 10, 10);
  }

  return doc;
}