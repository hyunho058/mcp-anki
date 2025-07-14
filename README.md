# Anki MCP Server

이 프로젝트는 [AnkiConnect](https://foosoft.net/projects/anki-connect/) 플러그인을 통해 Anki와 연동하는 MCP 서버입니다.

## 로컬에서 실행하기 (누구나 따라할 수 있는 가이드)

### 1. 저장소 클론

```sh
git clone https://github.com/your-username/mcp-anki.git
cd mcp-anki
```

### 2. 의존성 설치

```sh
npm install
```

### 3. Anki 및 AnkiConnect 준비

- [Anki 공식 사이트](https://apps.ankiweb.net/)에서 Anki(데스크탑 버전)를 설치합니다.
- Anki를 실행합니다.
- 메뉴에서 `도구 > 애드온 > 애드온 가져오기`를 클릭하고, 코드 `2055492159`를 입력해 AnkiConnect를 설치합니다.
- 설치 후 Anki를 재시작합니다.
- Anki가 실행 중이어야 MCP 서버가 정상 동작합니다.

### 4. MCP 서버 실행

```sh
npx ts-node src/index.ts
```

- 또는 빌드 후 실행:
  ```sh
  npm run build
  node dist/index.js
  ```

### 5. (선택) Cursor IDE에서 MCP 서버 연동

- `.cursor/mcp.json` 파일에 아래와 같이 anki MCP 서버를 등록하세요:
  ```json
  {
    "mcpServers": {
      "anki": {
        "command": "npx",
        "args": [
          "ts-node",
          "/Users/your-username/path-to/mcp-anki/src/index.ts"
        ]
      }
    }
  }
  ```
- 경로는 본인 환경에 맞게 수정하세요.
- Cursor IDE의 MCP Servers 패널에서 anki 서버를 시작하고, 로그를 확인할 수 있습니다.

## 주요 기능

- 덱 목록 조회
- 노트 추가
- 카드 검색
- 카드 정보 조회

## 참고

- MCP 서버는 Anki가 실행 중이고, AnkiConnect가 활성화되어 있어야 정상적으로 동작합니다.
- AnkiConnect는 기본적으로 `localhost:8765`에서 HTTP 요청을 받습니다.
- 보안을 위해 mcp 서버와 Anki는 같은 컴퓨터에서 실행하는 것을 권장합니다.

---

추가적인 설정이나 확장 기능이 필요하다면, `src/index.ts` 파일을 참고하여 MCP Tool을 추가할 수 있습니다.
