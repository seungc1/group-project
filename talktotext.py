import whisper
import os

def format_timestamp(start, end):
    return f"[{int(start//60):02d}:{int(start%60):02d} → {int(end//60):02d}:{int(end%60):02d}]"

def save_segment_with_timestamps(result, output_path):
    with open(output_path, "w", encoding="utf-8") as f:
        for segment in result["segments"]:
            timestamp = format_timestamp(segment["start"], segment["end"])
            text = segment["text"].strip()
            f.write(f"{timestamp} {text}\n")
    print(f"타임스탬프 포함 텍스트 저장 완료! {output_path}")

def save_sentences_line_by_line(result, output_path):
    text = result["text"]
    sentences = text.split(".")
    formatted = "\n".join(sentence.strip() + "." for sentence in sentences if sentence.strip())
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(formatted)
    print(f"마침표 기준 줄바꿈 텍스트 저장 완료! {output_path}")

def main():
    # Whisper 모델 로드
    model = whisper.load_model("medium")
    
    # 오디오 파일 경로
    audio_file = "test_audio.wav"
    
    # STT 변환 (segments 포함)
    result = model.transcribe(audio_file, verbose=False)

    # 저장 파일 이름 기반 구성
    base_filename = os.path.splitext(audio_file)[0]
    
    # 저장 1: 타임스탬프 포함 텍스트
    timestamp_path = f"{base_filename}_with_timestamps.txt"
    save_segment_with_timestamps(result, timestamp_path)

    # 저장 2: 마침표 기준 줄바꿈 텍스트
    sentence_path = f"{base_filename}_result.txt"
    save_sentences_line_by_line(result, sentence_path)

if __name__ == "__main__":
    main()
