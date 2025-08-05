# Anki MCP Server

An MCP server that integrates with Anki through the [AnkiConnect](https://foosoft.net/projects/anki-connect/) plugin.

## Quick Start

### Prerequisites

- [Anki Desktop](https://apps.ankiweb.net/) installed and running
- AnkiConnect plugin installed (code: `2055492159`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hyunho058/mcp-anki.git
   cd mcp-anki
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the server:
   ```bash
   npx ts-node src/index.ts
   ```

### Cursor IDE Integration (Optional)

Add this to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "anki": {
      "command": "npx",
      "args": ["ts-node", "/path/to/mcp-anki/src/index.ts"]
    }
  }
}
```

## Features

- List decks
- Add notes/cards
- Search cards
- Get card information

## Notes

- Make sure Anki is running with AnkiConnect enabled
- The server communicates with AnkiConnect on `localhost:8765`


---


---

# Anki MCP 서버

[AnkiConnect](https://foosoft.net/projects/anki-connect/) 플러그인을 통해 Anki와 연동하는 MCP 서버입니다.

## 시작하기

### Anki 설치

- [Anki 데스크탑](https://apps.ankiweb.net/) 설치 및 실행
- AnkiConnect 플러그인 설치 (코드: `2055492159`)

### 설치

1. 저장소 클론:
   ```bash
   git clone https://github.com/hyunho058/mcp-anki.git
   cd mcp-anki
   ```

2. 의존성 설치:
   ```bash
   npm install
   ```

3. 서버 실행:
   ```bash
   npx ts-node src/index.ts
   ```

### Cursor IDE 연동 (선택사항)

`.cursor/mcp.json`에 이걸 추가하세요:

```json
{
  "mcpServers": {
    "anki": {
      "command": "npx",
      "args": ["ts-node", "/path/to/mcp-anki/src/index.ts"]
    }
  }
}
```

## 기능

- 덱 목록 조회
- 노트/카드 추가
- 카드 검색
- 카드 정보 조회

## 참고

- Anki가 실행 중이고 AnkiConnect가 활성화되어 있어야 합니다.
- 서버는 `localhost:8765`에서 AnkiConnect와 통신합니다.
