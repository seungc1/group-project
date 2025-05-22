"use client";
/**
 * 회의록 생성 페이지 컴포넌트
 * - 회의록 생성을 위한 폼을 포함하는 페이지
 * - Header와 MeetingForm 컴포넌트로 구성
 */

import Header from '@/components/ui/layout/Header';
import ProjectForm from '@/components/features/Project/ProjectForm';
import styles from './styles.module.css';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * 회의록 생성 페이지 메인 컴포넌트
 * @returns {JSX.Element} 회의록 생성 페이지 UI
 */
export default function CreateProject() {
  return (
    <>
      <Header title="프로젝트 생성" />
      <main className={styles.mainContent}>
        <ProjectForm />
      </main>
    </>
  );
}