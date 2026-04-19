# iPrep — Implementation Plan
> Based on: ARCHITECTURE.md | Stack: Vite + React + Express + Prisma + Deepgram | Date: April 2026

---

## How to Use This Plan

- Work **top-to-bottom** — each phase depends on the one before it
- Each phase has a **"Done When"** test — do not start the next phase until it passes
- Estimated total: **~23 days**

---

## Phase 0 — Monorepo Scaffold
**Duration: 0.5 day**

Set up the workspace skeleton. No logic — just folder structure, package.json files, and pnpm workspaces.

### Files to Create

```
iprep/
├── package.json                         # Root: pnpm workspaces config
├── pnpm-workspace.yaml                  # Declares packages/* and apps/*
├── .env.example                         # Template env vars
│
├── apps/
│   ├── frontend/
│   │   ├── package.json                 # name: @iprep/frontend
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── src/
│   │       └── main.tsx                 # Placeholder entry
│   │
│   ├── server/
│   │   ├── package.json                 # name: @iprep/server
│   │   └── src/
│   │       └── index.ts                 # Placeholder entry
│   │
│   └── cli/
│       ├── package.json                 # name: @iprep/cli, "bin": {"iprep": "./bin/iprep.js"}
│       └── bin/
│           └── iprep.js                 # #!/usr/bin/env node (placeholder)
│
└── packages/
    ├── shared/
    │   ├── package.json                 # name: @iprep/shared
    │   └── src/
    │       ├── schemas/                 # Zod schemas (session, analysis, env, provider)
    │       ├── types/                   # Inferred TypeScript types
    │       ├── constants/               # DEFAULT_PORT, APP_NAME, IPREP_HOME
    │       └── index.ts
    │
    ├── db/
    │   ├── package.json                 # name: @iprep/db
    │   └── src/
    │       └── index.ts                 # Placeholder
    │
    └── llm/
        ├── package.json                 # name: @iprep/llm
        ├── providers/                   # LLM provider implementations
        ├── adapters/                    # Provider adapter wrappers
        └── adapter-utils/               # Shared spawner utilities
```

### Done When
```bash
pnpm install                             # No errors
node -e "require('@iprep/shared')"       # No import errors
```

---

## Phase 1 — LLM Adapter Utils (`packages/llm/adapter-utils`)
**Duration: 2 days**

Build a generic, reusable library to spawn any CLI as a child process. No Claude-specific logic yet — just the engine.

### Files to Create

```
packages/llm/adapter-utils/src/
├── process-spawner.ts       # Spawn a CLI, manage stdin/stdout lifecycle
├── session-manager.ts       # Track active spawner instances by session ID
├── response-parser.ts       # Base parser: lines, JSON, buffering
├── stream-reader.ts         # Reads stdout line by line, emits events
├── error-handler.ts         # SpawnError, TimeoutError, ParseError, ProcessDeadError
└── index.ts                 # Exports: ProcessSpawner, SessionManager, errors
```

### Done When
```javascript
const spawner = new ProcessSpawner({ command: 'cat', args: [] });
await spawner.spawn();
const response = await spawner.send('hello world\n');
// → echoes "hello world"
await spawner.kill();
```

---

## Phase 2 — Claude Adapter (`packages/llm/adapters`)
**Duration: 2 days**

Wrap `adapter-utils` with Claude-specific knowledge: flags, JSON output format, session IDs, auth errors.

### Files to Create

```
packages/llm/adapters/claude/
├── claude-spawner.ts        # Extends ProcessSpawner with Claude-specific args
├── claude-parser.ts         # Parses Claude stream-json output format
├── claude-session.ts        # Persists session IDs to ~/.iprep/sessions.json
├── claude-errors.ts         # AuthRequiredError, ClaudeNotFoundError, MaxTurnsError
├── prompt-builder.ts        # Builds full prompt from parts (system + history + docs + message)
└── index.ts                 # ClaudeAdapter — the only class consumers import
```

### ClaudeAdapter API
```typescript
const adapter = new ClaudeAdapter({ tutorId: 'test', sessionId: 'session-1' });
await adapter.verify();       // { ok: boolean, error?: string }
await adapter.chat({
  systemPrompt, message, documents, history
});                           // → { response: string, sessionId: string }
await adapter.endSession(id);
```

### Done When
```bash
# Script sends a message to Claude and gets a real response back
node test-claude.js
# → Claude ready: true
# → Response: "4"
# → Session ID: "abc123"
# → Follow-up references previous message (session continuity works)
```

---

## Phase 3 — CLI (`apps/cli`)
**Duration: 2 days**

Build the command-line interface. Entry point to the whole application.

### Files to Create

```
apps/cli/
├── bin/iprep.js                  # #!/usr/bin/env node
└── src/
    ├── index.ts                  # Commander program, registers all commands
    ├── commands/
    │   ├── init.ts               # iprep init — first-run setup
    │   ├── start.ts              # iprep start — starts server + opens browser (Phase 5)
    │   ├── doctor.ts             # iprep doctor — checks all prerequisites
    │   ├── setup.ts              # iprep setup — configure API keys, detect CLIs
    │   ├── status.ts             # iprep status — show provider status
    │   ├── sessions.ts           # iprep sessions — list recent sessions
    │   ├── analyze.ts            # iprep analyze <sessionId> — analyze from terminal
    │   ├── export.ts             # iprep export <sessionId> — export to PDF/MD
    │   └── keys.ts               # iprep keys — manage BYOK API keys
    └── utils/
        ├── display.ts            # chalk helpers: success(), error(), warn(), info()
        ├── spinner.ts            # ora spinner wrapper
        ├── prompts.ts            # inquirer prompts
        └── home-dir.ts           # ~/.iprep/ management (create, read, seed)
```

### Done When
```bash
iprep --help             # Shows all commands
iprep init               # Creates ~/.iprep/ structure
iprep doctor             # Shows pass/fail for: Node, Claude, auth, DB, tutors
iprep status             # Shows provider availability (Deepgram, Gemini, CLI tools)
```

---

## Phase 4 — Database (`packages/db`)
**Duration: 2 days**

Prisma ORM with SQLite (→ Postgres in Phase 2 cloud). Auto-migrates on first run — no manual step.

### Files to Create

```
packages/db/
├── prisma/
│   ├── schema.prisma             # Full schema: User, Session, Package, Tutor, Analysis
│   └── migrations/               # Auto-generated
└── src/
    ├── client.ts                 # Prisma singleton → ~/.iprep/db/iprep.db
    ├── migrate.ts                # runMigrations() — called at server startup
    ├── queries/
    │   ├── sessions.ts           # Session CRUD
    │   ├── analysis.ts           # Analysis CRUD
    │   ├── packages.ts           # Interview package CRUD
    │   ├── tutors.ts             # Tutor CRUD
    │   └── settings.ts           # User settings CRUD
    └── index.ts
```

### Prisma Schema (Key Models)
```
User → Settings, Session[], ApiKey[]
Session → Package, Analysis
Analysis → scores, strengths, improvements, report
Package → slug (behavioral|technical|dsa|hr|pm|system-design)
Tutor  → slug (alex|priya|morgan), voice, systemPrompt
```

### Done When
```javascript
await runMigrations();
const session = await sessions.create({ userId, packageId, tutorId });
const analysis = await analysis.create({ sessionId });
// reads/writes work, DB file created at ~/.iprep/db/iprep.db
```

---

## Phase 5 — Backend (`apps/server`)
**Duration: 3 days**

Express server that ties everything together: Deepgram proxy, analysis engine, REST API.

### Files to Create

```
apps/server/src/
├── index.ts                        # Entry: migrations → sync → listen
├── app.ts                          # Express app: middleware + routes
├── routes/
│   ├── interview.ts                # POST /api/interview/start, GET /:id, POST /:id/end
│   ├── analysis.ts                 # POST /api/analysis/:id, GET /api/analysis/:id
│   ├── packages.ts                 # GET /api/packages
│   ├── tutors.ts                   # GET /api/tutors
│   ├── providers.ts                # GET /api/providers/status, POST /api/providers/validate
│   ├── settings.ts                 # GET/PATCH /api/settings, POST /api/settings/keys
│   └── health.ts                   # GET /health
├── services/
│   ├── deepgram-agent-proxy.ts     # EXISTING — Deepgram WebSocket proxy
│   ├── interview-engine.ts         # Session lifecycle orchestration
│   ├── analysis-engine.ts          # LLM fallback chain: Gemini free → CLI → API
│   └── provider-registry.ts        # Which providers are live + key validation
├── ws/
│   ├── agent-ws.ts                 # WebSocket: /ws/agent (Deepgram proxy)
│   └── analysis-ws.ts              # WebSocket: /ws/analysis/:id (stream progress)
└── utils/
    ├── env.ts                      # Zod env validation (from @iprep/shared)
    └── logger.ts                   # Winston logger
```

### API Routes

```
POST   /api/interview/start          Start new session
POST   /api/interview/:id/end        End session + queue analysis
GET    /api/interview/:id/transcript Get full transcript

POST   /api/analysis/:sessionId      Trigger analysis (async)
GET    /api/analysis/:sessionId      Get result
WS     /ws/analysis/:sessionId       Stream analysis progress

GET    /api/packages                 List interview packages
GET    /api/tutors                   List tutors
GET    /api/providers/status         Check what's installed/configured
POST   /api/providers/validate       Validate an API key

GET    /api/settings                 Get user settings
PATCH  /api/settings                 Update settings
POST   /api/settings/keys            Save BYOK key

WS     /ws/agent                     Deepgram agent proxy (EXISTING)
```

### Analysis Engine (Provider Chain)
```
cheapest first:
1. Gemini 2.0 Flash (free tier)
2. Gemini API (BYOK)
3. Claude CLI (spawn)
4. Gemini CLI (spawn)
5. Codex CLI (spawn)
6. Ollama (local)
7. Claude API (BYOK)
8. OpenAI API (BYOK)
```

### Done When
```bash
curl http://localhost:3000/health
# → { "status": "ok", "activeSessionCount": 0 }

curl -X POST http://localhost:3000/api/interview/start \
  -d '{"packageSlug":"behavioral","tutorSlug":"alex","mode":"voice"}'
# → { "sessionId": "...", "status": "ACTIVE" }
```

---

## Phase 6 — LLM Providers (`packages/llm/providers`)
**Duration: 2 days**

Implement all provider adapters using the interfaces from `@iprep/shared`.

### Files to Create

```
packages/llm/providers/
├── llm/
│   ├── ClaudeAPIProvider.ts         # BYOK — @anthropic-ai/sdk
│   ├── ClaudeCLIProvider.ts         # spawn: claude --json "..."
│   ├── GeminiAPIProvider.ts         # BYOK — @google/generative-ai
│   ├── GeminiCLIProvider.ts         # spawn: gemini "..."
│   ├── GeminiFreeProvider.ts        # Free tier — Google AI Studio REST
│   ├── OpenAIProvider.ts            # BYOK — openai sdk
│   ├── CodexCLIProvider.ts          # spawn: codex "..."
│   └── OllamaProvider.ts            # Local — Ollama REST :11434
│
├── stt/
│   ├── DeepgramSTTProvider.ts       # BYOK — Deepgram STT WebSocket
│   └── OpenAIWhisperProvider.ts     # BYOK — OpenAI Whisper API
│
├── tts/
│   ├── DeepgramTTSProvider.ts       # BYOK — Deepgram Aura TTS
│   └── OpenAITTSProvider.ts         # BYOK — OpenAI TTS API
│
├── agent/
│   └── DeepgramAgentProvider.ts     # Current — Deepgram Voice Agent (all-in-one)
│
├── registry.ts                      # ProviderRegistry — resolveAnalysis/STT/TTS/Agent
└── index.ts
```

### Done When
```typescript
const registry = new ProviderRegistry({ deepgramKey, geminiKey });
const llm = await registry.resolveAnalysisProvider();
// → first available in chain
const result = await llm.analyze(transcript);
// → { scores, strengths, improvements, report }
```

---

## Phase 7 — Frontend (`apps/frontend`)
**Duration: 4 days**

React SPA — voice interview UI, analysis dashboard, settings.

### Files to Create

```
apps/frontend/src/
├── main.tsx
├── App.tsx                           # Router setup
├── pages/
│   ├── Dashboard.tsx                 # Recent sessions, stats, quick start
│   ├── InterviewNew.tsx              # Package + tutor selection
│   ├── InterviewSession.tsx          # Live voice interview (WS + mic)
│   ├── InterviewAnalysis.tsx         # Post-interview feedback + scores
│   ├── History.tsx                   # All past sessions
│   └── Settings.tsx                  # API keys, provider config, theme
├── components/
│   ├── CallControls/                 # EXISTING — migrate to .tsx
│   ├── Layout/                       # EXISTING — migrate to .tsx
│   ├── Interview/
│   │   ├── PackageSelector.tsx
│   │   ├── TutorSelector.tsx
│   │   └── QuestionCard.tsx
│   ├── Analysis/
│   │   ├── ScoreCard.tsx
│   │   ├── TranscriptViewer.tsx
│   │   ├── FeedbackPanel.tsx
│   │   └── ExportButton.tsx
│   ├── Settings/
│   │   ├── KeyVault.tsx
│   │   ├── ProviderStatus.tsx
│   │   └── CLIDetector.tsx
│   └── ui/                           # shadcn/ui base components
├── hooks/
│   ├── useDeepgramAgent.ts           # EXISTING — migrate to .ts
│   ├── useProvider.ts
│   ├── useSession.ts
│   ├── useAnalysis.ts
│   └── useKeyVault.ts
├── stores/                           # Zustand stores
│   ├── sessionStore.ts
│   ├── providerStore.ts
│   └── settingsStore.ts
└── lib/
    ├── api.ts                        # Typed fetch wrapper
    └── ws.ts                         # WebSocket client manager
```

### Done When
```
Open http://localhost:5173
→ Select behavioral interview + tutor
→ Start voice session → mic active → Deepgram agent responds
→ End session → analysis runs → ScoreCard + FeedbackPanel appear
→ Settings page: add Deepgram key → ProviderStatus shows ✅
```

---

## Phase 8 — Shared Schemas (`packages/shared`)
**Duration: 1 day**

Finalize Zod schemas — used identically in server routes and frontend forms.

### Files to Create

```
packages/shared/src/schemas/
├── session.schema.ts         # StartSessionSchema, EndSessionSchema
├── analysis.schema.ts        # AnalysisResultSchema, ScoresSchema
├── provider.schema.ts        # BYOKKeySchema, ProviderStatusSchema
└── env.schema.ts             # EnvSchema (server startup validation)
```

### Done When
```typescript
// Same import in server route AND frontend form:
import { StartSessionSchema } from '@iprep/shared/schemas/session';
StartSessionSchema.parse(req.body);   // server
StartSessionSchema.parse(formData);   // frontend
// → no type drift between layers
```

---

## Phase 9 — Build Pipeline + npm Publish
**Duration: 1 day**

Wire the frontend build into Express so `iprep start` serves everything. Ship v1.0.0.

### Tasks

```
- pnpm run build → vite build → copy dist to apps/server/dist
- Express serves static apps/server/dist/ + catch-all for React Router
- iprep start: waits for /health → opens browser
- .npmignore: exclude frontend/src, include server/dist
- npm pack → npm install -g ./iprep-*.tgz → verify it works
```

### Done When
```bash
npm install -g iprep
iprep init
iprep doctor           # all checks green
iprep start            # browser opens, full app works from npm package
```

---

## Phase 10 — Polish & Billing
**Duration: 2 days**

Error handling, export, Razorpay billing (₹149/month), and pre-publish checklist.

### Tasks

```
- Error states: Claude not responding, network failure, key invalid
- iprep export <sessionId> → markdown/PDF
- iprep backup → ~/.iprep/backups/iprep-backup-{date}.zip
- Razorpay: one route + one webhook for ₹149/month Pro
- Pro gate: local unlimited free, cloud features gated
- No console.log in production (use Winston)
- README: install instructions + quickstart
- CHANGELOG for v1.0.0
```

### Done When
```bash
# Fresh machine
npm install -g iprep && iprep init && iprep doctor && iprep start
# Use app for 10 minutes
iprep backup && iprep export <sessionId>
# All work cleanly
```

---

## Phase Summary

| # | Focus | Duration | Key Deliverable |
|---|---|---|---|
| **0** | Monorepo scaffold | 0.5d | `pnpm install` works, workspaces resolve |
| **1** | adapter-utils | 2d | Spawn any CLI, send/receive via stdin/stdout |
| **2** | Claude adapter | 2d | Chat with Claude from a script |
| **3** | CLI | 2d | `iprep init`, `iprep doctor`, `iprep status` |
| **4** | Database | 2d | SQLite via Prisma, sessions + analysis persist |
| **5** | Backend | 3d | REST API + WS + analysis engine works via curl |
| **6** | LLM Providers | 2d | Full provider registry with fallback chain |
| **7** | Frontend | 4d | Full voice interview UI in browser |
| **8** | Shared schemas | 1d | Zod schemas used by both server + frontend |
| **9** | Build + npm | 1d | `npm install -g iprep && iprep start` works |
| **10** | Polish + billing | 2d | v1.0.0 ready, Razorpay, export, error handling |
| **Total** | | **~22.5d** | Shippable product |

---

## Build Order Rule

> Always pass the "Done When" test before moving to the next phase.

**Why this order:**
- Phases 1-2 are pure Node.js — easiest to test and debug
- Phase 3 (CLI) tests Phase 2 (Claude) without needing a server
- Phase 4 (DB) must exist before Phase 5 (server) can persist anything
- Phase 5 (backend) must work via `curl` before building Phase 7 (frontend)
- Phase 8 (schemas) finalizes the contract between layers before npm publish
- Phases 9-10 are additive — the core app already works without them

---

*Plan Version: 1.0 | iPrep Codex | April 2026*
