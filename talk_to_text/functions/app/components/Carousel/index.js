import styles from './styles.module.css';

export const Carousel = () => {
  return (
    <section className={styles.carousel}>
      <div className={styles['carousel-item']}></div>
      <div className={styles['carousel-item']}></div>
      <div className={styles['carousel-item']}></div>
      <div className={styles['carousel-item']}></div>
    </section>
  );
}; 