/**
 * 오디오 파일 업로드를 처리하는 컴포넌트
 * @param {Function} onFileSelect - 파일 선택 시 실행되는 콜백 함수
 * @param {File} selectedFile - 현재 선택된 파일 객체
 */
'use client';

import styles from './styles.module.css';

export default function FileUpload({ onFileSelect, selectedFile }) {
  return (
    <div className={styles.formGroup}>
      <label>음성 파일:</label>
      <div className={styles.fileUpload}>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => onFileSelect(e.target.files[0])}
          className={styles.fileInput}
        />
        {selectedFile && (
          <div className={styles.selectedFile}>
            선택된 파일: {selectedFile.name}
          </div>
        )}
      </div>
    </div>
  );
} 