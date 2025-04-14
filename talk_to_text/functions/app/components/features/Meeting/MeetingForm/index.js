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

export default function MeetingForm() {
  const router = useRouter();

  async function handleSubmit(formData) {
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
      <div className={styles.formGroup}>
        <label>제목:</label>
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

      <FileUpload name="file" />

      <LoadingButton type="submit" text="회의록 저장" />
    </form>
  );
} 