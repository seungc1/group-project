'use client';

import React, { useState } from 'react';
import styles from './wav_convert.module.css';
import Link from 'next/link';

export default function AudioConvertPage() {
  const [files, setFiles] = useState([]);
  const [convertedUrls, setConvertedUrls] = useState([]); // ✅ 다중 변환 URL
  const [isLoading, setIsLoading] = useState(false);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
    setConvertedUrls([]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setConvertedUrls([]);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsLoading(true);
    setConvertedUrls([]);

    try {
      const urls = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/audio-convert', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('변환 실패');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        urls.push(url);
      }

      setConvertedUrls(urls);
    } catch (error) {
      alert('오디오 변환 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>오디오 파일 WAV 변환기</h1>
        <p className={styles.description}>
          다양한 형식의 오디오 파일을 드래그하거나 선택하여 업로드하세요.<br />
          자동으로 16kHz WAV 포맷으로 변환되어 다운로드할 수 있습니다.
        </p>

        <div
          className={styles.dropZone}
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
        >
          <p>이곳에 파일을 끌어다 놓으세요!</p>
        </div>  
        <div className={styles.fileInputWrapper}>
          <input type="file" accept="audio/*" onChange={handleFileSelect} multiple />
        </div>

        {files.length > 0 && (
          <ul className={styles.fileList}>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        )}

        <div className={styles.buttonGroup}>
          <button
            onClick={handleConvert}
            className={styles.button}
            disabled={files.length === 0 || isLoading}
          >
            {isLoading ? '변환 중...' : 'WAV 파일로 변환'}
          </button>
        </div>

        {convertedUrls.length > 0 && (
          <div className={styles.downloadGroup}>
            {convertedUrls.map((url, index) => (
              <a
                key={index}
                href={url}
                download={`converted_${index + 1}.wav`}
                className={styles.downloadButton}
              >
                변환된 파일 {index + 1} 다운로드
              </a>
            ))}
          </div>
        )}

        <Link href="/create">
          <button className={styles.secondaryButton}>회의록 생성하러가기!</button>
        </Link>
      </div>
    </main>
  );
}