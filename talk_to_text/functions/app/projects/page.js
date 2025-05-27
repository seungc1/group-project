import styles from './styles.module.css';
import Header from '../components/ui/layout/Header/index';
import MeetingList from '../components/features/Meeting/MeetingList';

export default function ProjectsPage() {
  return (
    <>
      <Header title="전체 프로젝트" />
      <MeetingList />
    </>
  );
} 