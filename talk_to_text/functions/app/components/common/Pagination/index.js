import React from 'react';
import styles from './styles.module.css';

export default function Pagination({ currentPage, totalPages, onPageChange, className = '' }) {
  if (totalPages <= 1) return null;
  return (
    <div className={`${styles.paginationContainer} ${className}`}>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={
            currentPage === i + 1
              ? `${styles.pageButton} ${styles.activePageButton}`
              : styles.pageButton
          }
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
} 