'use client';

import Header from '@/components/ui/layout/Header';
import ProjectForm from '@/components/features/Project/ProjectForm';
import styles from './styles.module.css';

export default function ProjectCreatePage() {
  return (
    <>
      <Header title="프로젝트 생성" />
      <main className={styles.mainContent}>
        <ProjectForm />
      </main>
    </>
  );
} 