/**
 * 회의 요약 수정 버튼 컴포넌트
 * @param {string} meetingId - 회의 문서 ID
 */
export default function EditSummaryButton({ meetingId }) {
    const router = useRouter();
  
    const handleClick = () => {
      router.push(`/aiChat/${meetingId}`);
    };
  
    return (
      <button
        className={styles.downloadLink} // 기존 downloadLink와 동일한 스타일 적용
        onClick={handleClick}
      >
        ✏️ 수정하기
      </button>
    );
  }