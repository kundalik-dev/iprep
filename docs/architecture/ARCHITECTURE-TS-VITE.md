# iPrep Architecture (TypeScript + Vite, Live VAD)
> Target: local-first product with an optional cloud tier
> UI: React + Vite + TypeScript
> Voice: live VAD-based speech-to-speech using OpenAI Realtime (recommended)
> Date: 2026-04-19

---

## 1. Goals

- Run the product locally with minimal setup and predictable UX.
- Support live voice interviews (natural turn-taking) using VAD.
- Keep API keys off the browser whenever possible.
- Share a single codebase for UI + local backend.
- Allow a future cloud mode without rewriting everything.

Non-goals (for the first 6 months):

- SEO/SSR for the app UI (a marketing site can be separate).
- Multi-region cloud infra and complex tenancy.
- "Hard" piracy prevention for local licensing (not feasible).

---

## 2. High-Level System

Three layers:

1. UI layer: React (Vite) runs in the browser.
2. Local orchestration: Node server runs on the user machine.
3. Integrations: OpenAI Realtime + local DB + local filesystem.

The local server:

- serves the built UI assets
- exposes REST endpoints for app data
- exposes a WebSocket endpoint for realtime audio and events
- owns secrets (OpenAI key / provider keys) and talks to providers

---

## 3. Monorepo Layout (Recommended)

```
iprep/
  apps/
    web/                # Vite + React + TS (SPA)
    server/             # Node + TS (REST + WS proxy)
    cli/                # TS CLI (install/onboard/start)
  packages/
    shared/             # shared types, utils, constants
    storage/            # local DB + filesystem helpers
    providers/          # LLM/STT/TTS adapters (OpenAI, others later)
  docs/
    architecture/
```

Key principle:

- UI never needs direct access to provider secrets.

---

## 4. Live VAD Voice Architecture (OpenAI Realtime)

### Why Realtime

- Single model session handles live speech-to-speech.
- VAD reduces billing for silence and supports natural turn taking.
- Generally cheaper than per-minute "voice agent" APIs at low scale.

### Connection Pattern (Safe Default)

The browser does not connect to OpenAI directly.

Instead:

- Browser opens a WebSocket to the local server.
- Local server opens a Realtime connection to OpenAI.
- Server bridges audio + events between them.

This keeps the API key on the local machine and allows consistent logging,
rate limiting, and future provider swaps.

### Data Flow

```
Browser (mic audio) -> WS -> Local Server -> Realtime -> OpenAI
OpenAI (audio + events) -> Realtime -> Local Server -> WS -> Browser (speaker)
```

### VAD Behavior

- The client continuously streams audio frames.
- The Realtime session uses VAD so silence doesn't trigger Responses.
- The server can also implement a simple "push-to-talk" fallback mode if VAD
  behaves poorly on noisy microphones.

---

## 5. Audio Pipeline (Implementation Notes)

### Browser capture

- Use `getUserMedia({ audio: true })`.
- Downsample/encode to the format required by the Realtime transport you choose.
- Send audio in small frames (for example 20ms) over WebSocket.

### Transport choices

- WebSocket bridge (simplest, good enough for v1)
- WebRTC (lower latency, more complex; consider later if needed)

### Playback

- Receive audio frames from the server.
- Use Web Audio API (`AudioContext`) for streaming playback.

---

## 6. REST API Surface (Local Server)

Suggested endpoints:

- `GET /api/health`
- `GET /api/tutors`
- `POST /api/sessions` (create interview session)
- `GET /api/sessions/:id`
- `GET /api/sessions/:id/messages`
- `POST /api/sessions/:id/end` (finalize + store summary)

WebSocket:

- `WS /api/realtime`
  - client -> server: audio frames, client events
  - server -> client: audio frames, transcript deltas, state events

---

## 7. Storage (Local)

Store everything locally by default:

- SQLite (sessions, messages, scores, metadata)
- Filesystem (optional): recordings, exports

Recommended directory:

- `~/.iprep/`
  - `db.sqlite`
  - `recordings/`
  - `exports/`
  - `logs/`

Avoid writing secrets into the repo directory.

---

## 8. Provider Abstraction

Define narrow interfaces so local mode and cloud mode share the same UI.

Example:

- `RealtimeVoiceProvider`
  - `startSession(config)`
  - `sendAudioFrame(frame)`
  - `onEvent(handler)`
  - `close()`

Implementations:

- `OpenAIRealtimeProvider` (v1)
- future: `GeminiLiveProvider` / other providers if needed

---

## 9. Security & Safety

- Never expose provider API keys to the browser.
- If you add a hosted cloud tier later:
  - use server-side sessions and short-lived tokens
  - do not embed long-lived provider keys in the client
- Treat transcripts as sensitive user data:
  - local-only by default
  - explicit opt-in for any cloud sync
- Validate and clamp any user-provided config used in spawning processes or
  building prompts.

---

## 10. Cost Model (How to Think About It)

For live VAD voice:

- you pay mostly for audio output (assistant speaking)
- long system prompts and long conversation history increase costs

Cost controls:

- keep the system prompt compact
- periodically summarize and replace long history
- cap maximum response length and speaking time
- offer "short answer" mode for fast drills

---

## 11. Future: Cloud Mode Without a Rewrite

To add cloud later:

- keep the UI mostly unchanged
- swap the base URL from `http://localhost` to your cloud domain
- run the same API + Realtime bridge on the cloud server
- move DB/storage to managed services

The critical architectural decision is the provider abstraction and keeping
provider secrets server-side.

---

## 12. Implementation Checklist (MVP)

1. Create `apps/web` with Vite + TS + React.
2. Create `apps/server` with TS + Express.
3. Serve built `apps/web` assets from `apps/server`.
4. Add `/api/realtime` WebSocket bridge to OpenAI Realtime.
5. Store transcripts and session metadata in SQLite under `~/.iprep/`.
6. Add a simple session UI: Start, Talk, Stop, Summary.

