# Gemini File Search 웹 애플리케이션

Google Gemini API의 File Search 기능을 활용한 강력한 시맨틱 검색 및 채팅 웹 애플리케이션입니다. 문서를 업로드하고, 출처 인용 및 문맥 검색 기능이 포함된 자연어 대화를 통해 문서 내용을 쉽게 파악할 수 있습니다.

![Gemini File Search UI](https://via.placeholder.com/800x450?text=Gemini+File+Search+Preview)

## 주요 기능

- **📂 스마트 파일 관리**: 
  - 여러 개의 "스토어(Store)"를 생성하여 문서를 체계적으로 관리할 수 있습니다.
  - 드래그 앤 드롭으로 간편하게 파일을 업로드할 수 있습니다.
  - PDF, CSV, 텍스트 등 다양한 파일 형식을 지원하며 파일 아이콘이 자동으로 표시됩니다.
  - 실시간 파일 처리 상태를 확인할 수 있습니다.

- **💬 고급 채팅 인터페이스**:
  - Google Gemini 스타일의 깔끔하고 현대적인 UI를 제공합니다.
  - **RAG (검색 증강 생성)**: 업로드한 문서를 기반으로 정확한 답변을 제공합니다.
  - **출처 인용**: 답변에 인라인 인용(예: [1])과 "출처(Sources)" 섹션이 포함됩니다.
  - **출처 문맥 팝업**: 출처 버튼을 클릭하면 문서에서 검색된 원문 텍스트와 파일명을 팝업으로 확인할 수 있습니다.
  - **마크다운 지원**: 코드 블록, 리스트, 강조 등 서식 있는 텍스트를 렌더링합니다.
  - **답변 복사**: 모델의 답변을 원클릭으로 클립보드에 복사할 수 있습니다.

- **🎨 최신 UX/UI**:
  - **다크/라이트 모드**: 눈이 편안한 테마 전환을 완벽하게 지원합니다.
  - **반응형 디자인**: 데스크탑과 모바일 환경 모두에서 최적화된 화면을 제공합니다.
  - **접이식 사이드바**: 콘텐츠에 집중할 수 있도록 사이드바를 접을 수 있습니다.

- **🛠️ 기술 스택**:
  - **Frontend**: React, Vite, Tailwind CSS, Lucide Icons.
  - **Backend**: Node.js, Express.
  - **AI**: Google Gemini API (`gemini-1.5-flash` / `gemini-2.5-flash`).
  - **Deployment**: Docker & Docker Compose.

## 사전 요구 사항

- [Docker](https://www.docker.com/) 및 Docker Compose 설치.
- [Google Gemini API 키](https://aistudio.google.com/) 발급.

## 설치 및 실행 방법

1. **저장소 복제 (Clone)**
   ```bash
   git clone https://github.com/KORThomasJeong/gemini-filesearch.git
   cd gemini-filesearch
   ```

2. **환경 변수 설정**
   루트 디렉토리에 `.env` 파일을 생성하고 API 키를 입력하세요:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3000
   ```

3. **Docker Compose로 실행**
   ```bash
   docker compose up -d --build
   ```

4. **애플리케이션 접속**
   브라우저를 열고 다음 주소로 접속하세요:
   ```
   http://localhost:3000
   ```

## 사용 가이드

1. **스토어 생성**: 사이드바의 "+" 버튼을 클릭하여 새로운 문서 스토어(예: "재무 보고서")를 만듭니다.
2. **파일 업로드**: 스토어를 선택하고 PDF, 텍스트, CSV 파일을 파일 영역에 드래그 앤 드롭하여 업로드합니다.
3. **채팅 시작**: 채팅 인터페이스를 열고 업로드한 문서에 대해 질문하세요.
4. **출처 확인**: 답변 아래의 "Source" 버튼을 클릭하여 정보의 출처와 원문을 확인하세요.

## 개발 환경 설정

### 프로젝트 구조
```
gemini-filesearch/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # UI 컴포넌트 (ChatInterface, FileBrowser 등)
│   │   └── context/        # React Context (테마 등)
├── uploads/                # 업로드 임시 저장소
├── FileSearchManager.js    # Gemini API 래퍼 클래스
├── server.js               # Express 백엔드 서버
├── Dockerfile              # Docker 빌드 설정
└── docker-compose.yml      # Docker Compose 설정
```

### 로컬 실행 (Docker 없이 실행 시)

**백엔드:**
```bash
npm install
npm start
```

**프론트엔드:**
```bash
cd client
npm install
npm run dev
```

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
