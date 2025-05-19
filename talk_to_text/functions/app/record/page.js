'use client';

import React, { useRef, useState } from 'react';
import styles from './record.module.css';
import Link from 'next/link'

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [fileName, setFileName] = useState(''); // 파일명 상태 추가

  const handleStartRecording = async () => {
    setIsRecording(true);
    setAudioUrl(null);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext({ sampleRate: 16000 }); // 16kHz

    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    const recordedData = [];

    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      recordedData.push(new Float32Array(input));
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    mediaRecorderRef.current = { stream, audioContext, processor, recordedData };
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    const { stream, audioContext, processor, recordedData } = mediaRecorderRef.current;

    processor.disconnect();
    stream.getTracks().forEach((track) => track.stop());
    audioContext.close();

    // Float32Array[] → Int16 WAV blob
    const merged = flattenChunks(recordedData);
    const wavBlob = encodeWAV(merged, 16000);

    const url = URL.createObjectURL(wavBlob);
    setAudioUrl(url);
  };

  const flattenChunks = (chunks) => {
    const length = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Float32Array(length);
    let offset = 0;
    for (let chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  };

  const encodeWAV = (samples, sampleRate) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    function writeString(view, offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Float32 to Int16
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>음성 녹음기</h1>
      {isRecording ? (
        <p className={styles.description}>🎙️ 열심히 회의내용 녹음 중...</p>
      ) : (
        <>
          <p className={styles.description}>회의중 음성을 녹음하고 재생해보세요.</p>
          <p className={styles.description}>음성 파일은 WAV 파일 형식으로 다운로드됩니다.</p>
        </>
      )}
      <div className={styles.controls}>
        {!isRecording ? (
          <button onClick={handleStartRecording} className={styles.button}>
            녹음 시작
          </button>
        ) : (
          <button onClick={handleStopRecording} className={styles.buttonStop}>
            녹음 종료
          </button>
        )}
      </div>

      {audioUrl && (
        <div className={styles.result}>
          <audio src={audioUrl} controls />

          {/* 녹음 파일명 입력 필드 */}
          <input
            type="text"
            placeholder="저장할 음성 파일 이름을 입력하세요!"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className={styles.inputField}
          />

          {/* 다운로드 버튼 */}
          <button
            onClick={async () => {
              const response = await fetch(audioUrl);
              const blob = await response.blob();
              const filename = fileName?.trim() ? `${fileName}.wav` : 'recording.wav';

              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(link.href);
            }}
            className={styles.downloadLink}
          >
            WAV 파일 다운로드
          </button>

          <Link href="/create" className={styles.createButton}>회의록 생성하러가기!</Link>
        </div>
      )}

    </div>
  );
}

