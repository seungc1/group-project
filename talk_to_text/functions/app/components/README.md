# Components Directory Structure

## 📁 common
재사용 가능한 공통 컴포넌트들을 포함하는 디렉토리

### buttons/
- `LoadingButton`: 로딩 상태를 표시할 수 있는 버튼 컴포넌트
- `FloatingActionButton`: 화면 하단에 떠있는 액션 버튼 컴포넌트

### inputs/
- `FileUpload`: 파일 업로드를 위한 입력 컴포넌트

### modals/
- `CalendarModal`: 달력 선택을 위한 모달 컴포넌트

## 📁 features
특정 기능과 관련된 컴포넌트들을 포함하는 디렉토리

### Meeting/
- `MeetingList`: 회의록 목록을 표시하는 컴포넌트
- `MeetingDetail`: 회의록 상세 정보를 표시하는 컴포넌트
- `MeetingForm`: 회의록 생성/수정을 위한 폼 컴포넌트

### Audio/
- `AudioRecorder`: 음성 녹음 기능을 제공하는 컴포넌트
- `AudioPlayer`: 녹음된 음성을 재생하는 컴포넌트

## 📁 ui
UI 관련 컴포넌트들을 포함하는 디렉토리

### layout/
- `Header`: 페이지 상단의 헤더 컴포넌트

### navigation/
- `NavigationRail`: 사이드바 네비게이션 컴포넌트

## 컴포넌트 구조 특징
- 각 컴포넌트는 독립적인 디렉토리에 위치
- 컴포넌트별로 관련 스타일(`styles.module.css`)과 로직을 포함
- 재사용성과 유지보수성을 고려한 구조 