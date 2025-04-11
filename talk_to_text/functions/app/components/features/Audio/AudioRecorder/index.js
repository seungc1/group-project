/**
 * 오디오 녹음을 처리하는 컴포넌트
 * @param {Function} onRecordingComplete - 녹음 완료 시 호출되는 콜백 함수
 */
import { useState, useRef } from 'react'; // React의 상태 관리와 참조를 위한 훅 임포트
import styles from './styles.module.css'; // 컴포넌트 스타일 임포트

export const AudioRecorder = ({ onRecordingComplete }) => {
  // 녹음 상태를 관리하는 상태 변수
  const [isRecording, setIsRecording] = useState(false);
  // MediaRecorder 인스턴스를 저장하기 위한 참조
  const mediaRecorderRef = useRef(null);
  // 녹음된 오디오 데이터 청크를 저장하기 위한 참조
  const chunksRef = useRef([]);

  // 녹음 시작 함수
  const startRecording = async () => {
    try {
      // 사용자의 마이크 권한을 요청하고 오디오 스트림을 가져옴
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // 새로운 MediaRecorder 인스턴스 생성
      const mediaRecorder = new MediaRecorder(stream);
      // MediaRecorder 인스턴스를 참조에 저장
      mediaRecorderRef.current = mediaRecorder;
      // 녹음 데이터 청크 배열 초기화
      chunksRef.current = [];

      // 녹음 데이터가 사용 가능할 때 호출되는 이벤트 핸들러
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      // 녹음이 중지될 때 호출되는 이벤트 핸들러
      mediaRecorder.onstop = () => {
        // 녹음된 모든 청크를 하나의 Blob으로 합침
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        // 녹음 완료 콜백 호출
        onRecordingComplete(audioBlob);
      };

      // 녹음 시작
      mediaRecorder.start();
      // 녹음 상태를 true로 설정
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // 녹음 중지 함수
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // 녹음 중지
      mediaRecorderRef.current.stop();
      // 모든 오디오 트랙 중지
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      // 녹음 상태를 false로 설정
      setIsRecording(false);
    }
  };

  return (
    <div className={styles.recorder}>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={styles.recordButton}
      >
        {isRecording ? '녹음 중지' : '녹음 시작'}
      </button>
    </div>
  );
}; 