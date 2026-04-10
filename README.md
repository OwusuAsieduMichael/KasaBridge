# KasaBridge AI

KasaBridge AI is a multilingual speech translation platform that enables real-time communication between English and five major Ghanaian languages (Twi, Ga, Ewe, Fante, Hausa). It uses AI for speech recognition, language detection, and natural language translation, delivering culturally contextualized translations with optional voice output.

This repo is a production-oriented full-stack implementation: English, Twi, Ga, Ewe, Fante, and Hausa only.

## Stack

- **Backend:** Node.js, Express, `pg` (no ORM), OpenAI (chat, Whisper, TTS)
- **Frontend:** React (Vite), functional components
- **Database:** PostgreSQL

## Project layout

```
backend/          # Express API
database/         # schema.sql
frontend/         # Vite + React
```

## Quick commands (repo root)

```bash
npm run install:all    # root (concurrently) + backend + frontend
npm run dev            # one command: API :3001 + Vite :5173 together
npm run dev:backend    # API only
npm run dev:frontend   # Vite only
npm run build:frontend # production build → frontend/dist
```

## Setup

### 1. PostgreSQL

Create a database, then apply the schema:

```bash
psql "YOUR_DATABASE_URL" -f database/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: DATABASE_URL, OPENAI_API_KEY, PORT, CORS_ORIGIN

npm install
npm run dev
```

API base: `http://localhost:3001` (default). Health: `GET /api/health`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The repo includes `frontend/.npmrc` with `legacy-peer-deps=true` to avoid strict peer resolution issues on some npm versions.

If `npm install` fails with **ENOSPC** (no space left on device), free disk space or point npm’s cache elsewhere (`npm config set cache "D:\npm-cache"`), then retry.

Vite proxies `/api` to `http://localhost:3001`. For a separate API host, set `VITE_API_BASE` in `frontend/.env` (see `frontend/.env.example`).

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/translate` | Body: `{ "text", "targetLanguage" }` → `{ sourceLanguage, translatedText }` |
| POST | `/api/speech/process` | Multipart `audio` file and optional `targetLanguage`, or JSON `{ audioBase64, mimeType?, targetLanguage? }` |
| POST | `/api/tts/speak` | Body: `{ "text", "language?" }` — returns MP3 or `{ audioBase64, mimeType }` with `?format=json` or body `format: "json"` |
| POST | `/api/ai/chat` | Body: `{ "messages": [{ "role", "content" }] }` → `{ reply }` |

`targetLanguage` / `language` values (lowercase): `english`, `twi`, `ga`, `ewe`, `fante`, `hausa`.

## Environment variables

See `backend/.env.example` and `frontend/.env.example`.

## License

Use and modify for your own deployment.
