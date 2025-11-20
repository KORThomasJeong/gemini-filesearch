# Gemini File Search Web App Walkthrough

이 문서는 Gemini File Search Web App을 빌드하고 실행하는 방법을 설명합니다.

## 사전 요구 사항

-   Docker가 설치되어 있어야 합니다.
-   Google Gemini API 키가 필요합니다.

## 실행 방법

### 1. Docker 이미지 빌드

프로젝트 루트 디렉토리(`/home/azureuser/filesearchserver`)에서 다음 명령어를 실행하여 Docker 이미지를 빌드합니다.

```bash
docker build -t gemini-filesearch .
```

### 2. 컨테이너 실행

API 키를 환경 변수로 전달하여 컨테이너를 실행합니다.

```bash
docker run -p 3000:3000 -e GEMINI_API_KEY=your_api_key_here gemini-filesearch
```

`your_api_key_here`를 실제 Gemini API 키로 교체하세요.

### 3. Docker Compose로 실행 (권장)

`docker-compose.yml` 파일이 포함되어 있어 더 쉽게 실행할 수 있습니다.

1.  `.env` 파일 설정:
    프로젝트 루트에 `.env` 파일이 생성되어 있습니다. 이 파일을 열어 API 키를 입력하세요.
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

2.  실행:
    ```bash
    docker-compose up --build
    ```

### 4. 웹 앱 접속

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 기능 사용 가이드

### 스토어 관리 (사이드바)
-   **스토어 생성**: 사이드바 상단의 `+` 버튼을 클릭하고 이름을 입력하여 새 스토어를 생성합니다.
-   **스토어 선택**: 목록에서 스토어를 클릭하여 선택합니다.
-   **스토어 삭제**: 스토어 이름 옆의 휴지통 아이콘을 클릭하여 삭제합니다.

### 파일 관리 (파일 브라우저)
-   **파일 업로드**: "Upload File" 버튼을 클릭하여 파일을 선택하거나, 파일을 드래그 앤 드롭합니다.
-   **파일 목록**: 업로드된 파일이 그리드 형태로 표시됩니다.
-   **파일 삭제**: 파일 카드 우측 상단의 휴지통 아이콘을 클릭하여 삭제합니다.

### 채팅 (채팅 인터페이스)
-   스토어를 선택한 상태에서 우측 채팅창을 통해 질문을 입력합니다.
-   Gemini가 해당 스토어의 파일 내용을 바탕으로 답변을 제공합니다.

## 개발 모드 실행 (로컬)

Docker 없이 로컬에서 개발하려면:

1.  **백엔드 실행**:
    ```bash
    # 루트 디렉토리에서
    npm install
    export GEMINI_API_KEY=your_key
    node server.js
    ```

2.  **프론트엔드 실행**:
    ```bash
    # client 디렉토리에서
    cd client
    npm install
    npm run dev
    ```
