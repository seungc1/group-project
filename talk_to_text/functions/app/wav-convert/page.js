'use client';

import React, { useState } from 'react';
import styles from './wav_convert.module.css';

export default function AudioConvertPage() {
  const [file, setFile] = useState(null);
  const [convertedUrl, setConvertedUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setConvertedUrl(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/audio-convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('변환 실패');

      const data = await response.json();
      setConvertedUrl(data.downloadUrl);
    } catch (err) {
      alert('오디오 변환 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>오디오 파일 WAV 변환기</h1>
      <p className={styles.description}>다양한 형식의 음성 파일을 16kHz mono WAV 파일로 변환할 수 있습니다.</p>
        <p className={styles.description}>변환할 파일을 선택하고 변환 버튼을 클릭하세용!!</p>
      

      <div className={styles.buttonGroup}>
        <label className={styles.button}>
          파일 선택
          <input type="file" accept="audio/*" onChange={handleFileChange} hidden />
        </label>

        <button
          onClick={handleConvert}
          className={styles.button}
          disabled={!file || isLoading}
        >
          {isLoading ? '변환 중...' : '▶ 변환'}
        </button>

        {convertedUrl && (
          <a href={convertedUrl} download className={styles.button}>
            다운로드
          </a>
        )}
      </div>
    </main>
  );
}