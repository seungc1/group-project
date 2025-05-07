/**
 * 회의록 생성을 위한 폼 컴포넌트
 * 음성 파일 업로드, 회의 정보 입력, 처리 및 저장 기능을 제공
 */
'use client';

import { useRouter } from 'next/navigation';
import { submitMeeting } from '@/app/actions/meetingActions';
import FileUpload from '../../../common/inputs/FileUpload';
import LoadingButton from '../../../common/buttons/LoadingButton';
import styles from './styles.module.css';
import { useState } from 'react';

export default function MeetingForm() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);

  async function handleSubmit(formData) {
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    try {
      const result = await submitMeeting(formData);
      if (result.success) {
        router.push('/meetings');
      }
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <form action={handleSubmit} className={styles.form}>
      <div className={styles.formSection}>
        <div className={styles.formGroup}>
          <label>프로젝트 이름:</label>
          <input
            type="text"
            name="projectId"
            placeholder="프로젝트 ID를 입력하세요"
            required
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>회의 이름:</label>
        <input
          type="text"
          name="title"
          placeholder="회의 제목을 입력하세요"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>참석자 수:</label>
        <input
          type="number"
          name="participants"
          placeholder="참석자 수를 입력하세요"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>참석자 이름 (쉼표로 구분):</label>
        <input
          type="text"
          name="participantNames"
          placeholder="참석자 이름을 쉼표로 구분하여 입력하세요"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>회의록 목록:</label>
        <textarea
          name="meetingMinutesList"
          placeholder="회의록 목록을 입력하세요 (예: 1. 프로젝트 현황 보고&#13;&#10;2. 일정 조율&#13;&#10;3. 다음 단계 논의)"
          rows="5"
          className={styles.textArea}
        />
      </div>

      <FileUpload
        onFileSelect={setSelectedFile}
        selectedFile={selectedFile}
      />

      <LoadingButton type="submit" text="회의록 저장" />
    </form>
  );
} 