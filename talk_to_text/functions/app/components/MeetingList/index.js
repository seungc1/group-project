import styles from './styles.module.css';

export const MeetingList = ({ meetings }) => {
  return (
    <section className={styles['recent-meetings']}>
      <h2>최근 회의 및 전체 노트</h2>
      <div className={styles['meeting-list']}>
        {meetings?.map((meeting, index) => (
          <div key={index} className={styles['meeting-item']}>
            <div className={styles.thumbnail}></div>
            <div className={styles.content}>
              <h3>{meeting.title}</h3>
              <p>{meeting.description}</p>
            </div>
            <button className={styles['more-button']}>⋮</button>
          </div>
        ))}
      </div>
    </section>
  );
};