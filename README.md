# Talk to Text (스마트 회의록 서비스)

> **효율적인 업무를 위한 AI 기반 회의 기록 및 요약 어시스턴트**


## 📽️ Demo Video

[![Watch the video](https://youtu.be/_rPw4lNMDEU)

## 📖 프로젝트 소개

**Talk to Text**는 회의 내용을 자동으로 기록하고 관리해주는 올인원 웹 애플리케이션입니다.

회의 음성을 텍스트로 변환(STT)하고, 핵심 내용을 요약하여 사용자가 회의록 작성 부담 없이 대화에만 집중할 수 있도록 돕습니다.

이 프로젝트는 **Next.js**와 **Firebase**를 기반으로 한 현대적인 서버리스 아키텍처로 구축되었으며, Upstage console (Solar-pro), OpenAI(gpt-3.5)의 언어 모델을 통합하여 지능적인 기능을 제공합니다.


## ✨ 주요 기능

*   **실시간 음성 녹음**: 별도의 프로그램 없이 웹 브라우저에서 바로 회의를 녹음할 수 있습니다.
*   **음성 텍스트 변환 (STT)**: 녹음된 회의 내용을 높은 정확도로 텍스트로 변환합니다.
*   **AI 회의록 요약**: Upstage console (Solar-pro), OpenAI(gpt-3.5) API를 활용하여 전체 회의 내용의 회의록 요약본, 핵심 안건, 일정/할 일 목록을 자동으로 생성합니다.
*   **AI 챗봇 어시스턴트**: 회의 내용에 대해 궁금한 점을 AI에게 질문하고 답변을 받을 수 있는 대화형 인터페이스를 제공합니다.
*   **프로젝트 및 폴더 관리**: 여러 회의를 프로젝트와 폴더별로 체계적으로 분류하고 관리할 수 있습니다.
*   **사용자 대시보드**: 최근 활동, 즐겨찾기, 프로젝트 현황 등을 한눈에 파악할 수 있는 직관적인 대시보드를 제공합니다.
*   **안전한 보안 및 인증**: Google 소셜 로그인을 지원하며, 사용자 데이터를 안전하게 보호합니다.
*   **PDF 내보내기 및 이메일 전송**: 생성된 회의록과 스크립트를 깔끔한 PDF 문서로 다운로드할 수 있습니다. 추가로 구글 메일과 연동하여 PDF 파일을 바로 메일 전송 할 수 있습니다.
*   **북마크 기능**: 중요한 회의나 다시 확인해야 할 내용을 북마크하여 빠르게 접근할 수 있습니다.
*   **Google Calendar 연동**: 회의 내용에서 일정을 추출하여 Google Calendar에 자동으로 등록합니다.
*   **Google Tasks 연동**: 회의 중 도출된 할 일(Action Items)을 Google Tasks에 자동으로 등록합니다.

## 🛠 기술 스택 (Tech Stack)

### Frontend
*   **Framework**: [Next.js 14 (App Router)](https://nextjs.org/) - 서버 사이드 렌더링(SSR) 및 최신 웹 표준 준수
*   **Language**: JavaScript / React 18
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) - 빠르고 유연한 반응형 UI 구현
*   **State Management**: React Hooks & Context API
*   **UI Libraries**: `react-calendar`, `react-datepicker` 등 커스텀 컴포넌트 활용

### Backend & Infrastructure
*   **Platform**: [Firebase](https://firebase.google.com/)
    *   **Cloud Functions**: Next.js 애플리케이션 호스팅 및 백엔드 로직 처리 (Serverless)
    *   **Firestore**: 실시간 데이터 동기화를 지원하는 NoSQL 데이터베이스
    *   **Authentication**: 안전하고 간편한 사용자 인증 시스템
    *   **Storage**: 오디오 파일 및 생성된 문서 저장
*   **Python Server (Flask)**: 고성능 AI 처리를 위한 별도 백엔드 서버
    *   **Flask**: RESTful API 서버 구축
    *   **ThreadPoolExecutor**: STT 및 화자 분리 병렬 처리

### AI & Data Processing
*   **Speech-to-Text (STT)**: [OpenAI Whisper](https://github.com/openai/whisper) - 고정밀 음성 인식 모델
*   **Speaker Diarization**: `pyannote.audio` (추정) - 화자 분리 기술 적용
*   **LLM**: [ Upstage console (Solar-pro), OpenAI(gpt-3.5)]
*   **NLP**: `scikit-learn` (TF-IDF) - 키워드 추출 알고리즘

## 🏗 아키텍처 및 상세 구현 (Architecture & Implementation)

이 서비스는 **Next.js 프론트엔드**와 **Python AI 백엔드**가 협력하는 구조로 설계되었습니다.

### 1. 오디오 처리 파이프라인 (`/process-audio`)
사용자가 녹음을 완료하면 다음과 같은 복잡한 처리 과정이 자동으로 수행됩니다.

1.  **업로드**: 클라이언트에서 Firebase Storage로 오디오 파일을 업로드합니다.
2.  **요청 전달**: Next.js API 라우트(`api/process-audio`)가 Python Flask 서버로 분석 요청을 보냅니다.
3.  **병렬 처리 (Python Server)**:
    *   **STT**: Whisper 모델이 오디오를 텍스트로 변환합니다.
    *   **Diarization**: 화자 분리 모델이 누가 언제 말했는지를 분석합니다. (예시 : 화자1, 화자2, 화자3)
    *   이 두 과정은 `ThreadPoolExecutor`를 통해 병렬로 실행되어 처리 시간을 단축합니다.
4.  **데이터 병합**: 텍스트 세그먼트와 화자 정보를 타임스탬프 기준으로 정밀하게 매핑합니다.
5.  **AI 분석**:
    *   **요약**: GPT 모델이 회의 전체 내용을 요약하고 의결 사항을 도출합니다.
    *   **키워드 추출**: TF-IDF 알고리즘을 통해 회의의 핵심 키워드를 추출합니다.
    *   **일정/할일 추출**: 텍스트에서 날짜와 명령형 문장을 분석하여 Google Calendar 및 Tasks API와 연동합니다.
6.  **저장**: 분석된 모든 데이터(스크립트, 요약, 태그 등)는 Firestore에 구조화되어 저장됩니다.

### 2. Server 모듈 상세 (`server/`)
Python 백엔드는 기능별로 모듈화되어 유지보수성을 높였습니다.

*   **`main.py`**: Flask 애플리케이션의 진입점. API 엔드포인트 정의 및 전체 파이프라인 조율.
*   **`audio/`**: 오디오 파일 다운로드 및 Whisper 모델 구동 로직.
*   **`diarization/`**: 화자 분리 알고리즘 및 세그먼트 병합 로직.
*   **`nlp/`**: 텍스트 전처리, TF-IDF 키워드 추출, 요약 프롬프트 관리.
*   **`firebase/`**: Firestore 및 Storage와의 통신을 담당하는 핸들러.
*   **`cal_module/` & `calendar_logs_project/`**: 텍스트에서 날짜 정보를 추출하고 Google Calendar 이벤트를 생성하는 로직.
*   **`task/`**: 회의록에서 '할 일'을 식별하고 Google Tasks에 등록하는 로직.

### 3. API 구조
*   **`POST /process-audio`**: 오디오 분석의 핵심 엔드포인트. (Python Server)
*   **`POST /api/gpt-edit-summary`**: 사용자의 요청에 따라 회의록 요약을 수정하는 AI 기능. (Next.js)
*   **`GET /transcripts`**: 저장된 회의록 목록을 조회하는 엔드포인트.

## 폴더 구조
```
talk_to_text/
├── functions/           # Next.js Frontend & BFF
│   ├── app/             # App Router (Pages & API Routes)
│   ├── components/      # UI Components
│   └── lib/             # Utilities
├── server/              # Python AI Backend
│   ├── audio/           # Audio Processing
│   ├── diarization/     # Speaker Diarization
│   ├── nlp/             # Natural Language Processing
│   ├── task/            # Task Extraction
│   └── main.py          # Flask App Entry
└── ...
```
