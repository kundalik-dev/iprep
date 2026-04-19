# iPrep — Full System Architecture
> Stack: Vite + React + Express + Prisma + Deepgram | Phase: Local-first → Cloud | Date: April 2026

---

## Architecture Decisions (from Q&A + Business Analysis)

| Decision | Choice | Reason |
|---|---|---|
| License | AGPL v3 (+ commercial license option) | Allows self-hosting + open source community, prevents SaaS clones; dual-license for future enterprise/white-label revenue |
| Deployment | Local-first → Cloud (Option C) | Zero infra cost in Phase 1, cloud in Phase 2 |
| Language | TypeScript (strict mode) | Type-safe adapters/plugin system, better DX for open source contributors, catches provider interface mismatches at compile time |
| Frontend | Vite 5 + React 18 + React Router v6 | SPA is fine — no public SEO pages needed, voice UI is always behind setup/login, simpler build than Next.js |
| Monorepo | Single repo (frontend + backend + packages) | Shared types via @iprep/shared, single PR, single CI pipeline, no cross-repo drift |
| Validation | Zod (shared schemas) | Runtime validation at API boundaries + form validation in UI, single source of truth for shape of data |
| BYOK scope | Deepgram, Anthropic, OpenAI, Gemini | All major providers |
| Key storage | Local `.env` (Phase 1), encrypted DB (Phase 2) | Privacy-first local model |
| CLI spawn | Claude CLI, Codex CLI, Gemini CLI, Ollama | ₹0 LLM cost for existing subscribers |
| Auth | None for local, email+Stripe for cloud Pro | Ship fast in Phase 1 |
| Database | SQLite (local) / Postgres (cloud) — same Prisma schema | Single codebase, two backends |
| Analysis LLM | Gemini free > Claude CLI > Claude API > OpenAI | Cheapest first, fallback chain |

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         iPrep Platform                                  │
│                                                                         │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐   │
│  │  iprep-web   │────▶│ @iprep/server│────▶│  Provider Registry   │   │
│  │  Vite + React│◀────│ Express + WS │◀────│  (Adapter Pattern)   │   │
│  └──────────────┘     └──────┬───────┘     └──────────────────────┘   │
│                              │                        │                 │
│                    ┌─────────▼──────┐      ┌─────────▼──────────┐     │
│                    │  @iprep/db     │      │  @iprep/cli        │     │
│                    │  Prisma + SQLite│      │  Child Process     │     │
│                    │  (→ PG cloud)  │      │  Spawners          │     │
│                    └────────────────┘      └────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘

External providers (user's own keys):
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Deepgram │  │  Claude  │  │  Gemini  │  │ OpenAI   │  │  Ollama  │
│ STT/TTS  │  │   API    │  │   API    │  │ GPT/TTS  │  │  Local   │
│  Agent   │  │  Claude  │  │  CLI     │  │  Codex   │  │  LLM     │
└──────────┘  │   CLI    │  └──────────┘  │   CLI    │  └──────────┘
              └──────────┘                └──────────┘

Future (Phase 3 — self-hosted):
┌──────────────────────────────────┐
│  iPrep Cloud (own infra)         │
│  Whisper (STT) + Piper (TTS)     │
│  Fine-tuned LLM (interview coach)│
└──────────────────────────────────┘
```

---

## Layer 1: Frontend (iprep-web)

### Stack
```
Vite 5            — Build tool + dev server (fast HMR)
React 18          — UI framework
TypeScript 5      — Strict mode, path aliases via vite-tsconfig-paths
React Router v6   — Client-side routing (SPA)
Zustand           — Lightweight client state (session, provider, settings)
Tailwind CSS      — Styling
shadcn/ui         — Accessible component library (Radix primitives)
Zod               — Form validation + parsing API responses
```

### Why Vite (not Next.js)
```
iPrep is always behind a setup/login step — no public pages that need SEO.
Landing page lives on qaplatground.com (already has traffic).
Voice UI = fully client-side (WebSocket, mic, audio) — no SSR benefit.
Simpler build, faster iteration, lower complexity for open source contributors.
Phase 2 cloud: add a simple Express-served landing page or separate static site.
```

### TypeScript Config (apps/web)
```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### Directory Structure (apps/web)
```
apps/web/src/
├── main.tsx                      # Vite entry point
├── App.tsx                       # Router setup
│
├── pages/
│   ├── Setup.tsx                 # First-run wizard (keys, preferences)
│   ├── Dashboard.tsx             # Recent sessions, stats, quick start
│   ├── InterviewNew.tsx          # Package + tutor selection
│   ├── InterviewSession.tsx      # Live voice interview (WebSocket + mic)
│   ├── InterviewAnalysis.tsx     # Post-interview feedback + scores
│   ├── History.tsx               # All past sessions
│   ├── Settings.tsx              # API keys, provider config, theme
│   └── Billing.tsx               # Subscription (Phase 2)
│
├── components/
│   ├── CallControls/             # EXISTING — migrate to .tsx
│   ├── Layout/                   # EXISTING — migrate to .tsx
│   ├── Interview/
│   │   ├── PackageSelector.tsx
│   │   ├── TutorSelector.tsx
│   │   ├── ModeSelector.tsx
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
│   └── ui/                       # shadcn/ui base components
│
├── hooks/
│   ├── useDeepgramAgent.ts       # EXISTING — migrate to .ts
│   ├── useProvider.ts
│   ├── useSession.ts
│   ├── useAnalysis.ts
│   └── useKeyVault.ts
│
├── stores/                       # Zustand stores
│   ├── sessionStore.ts
│   ├── providerStore.ts
│   ├── settingsStore.ts
│   └── authStore.ts              # Phase 2
│
├── lib/
│   ├── api.ts                    # Typed fetch wrapper
│   ├── ws.ts                     # WebSocket client manager
│   └── providers.ts              # Provider capability map
│
└── context/
    ├── VoiceCallContext.tsx      # EXISTING — migrate to .tsx
    └── ThemeContext.tsx
```

### Provider Status UI (Key UX Feature)
```
Settings → Provider Status shows:

  Voice Agent
  ✅ Deepgram Agent     (key configured — BYOK)
  ❌ Custom Agent       (Phase 3 — not yet)

  LLM Analysis
  ✅ Gemini 2.0 Flash   (free, auto-detected)
  ✅ Claude CLI         (detected: claude v1.x installed)
  ⚠️ Claude API        (key not configured)
  ❌ Codex CLI          (not installed)
  ✅ Ollama             (detected: running on :11434)

  STT
  ✅ Deepgram STT       (key configured — BYOK)
  ❌ Whisper Local      (Phase 3)

  TTS
  ✅ Deepgram Aura      (key configured — BYOK)
  ❌ Piper Local        (Phase 3)
```

---

## Layer 2: Backend (@iprep/server)

### Stack
```
Express 4         — HTTP server
TypeScript 5      — Strict mode, compiled to dist/
tsx               — Dev-time TS execution (replaces node --watch)
ws                — WebSocket server (Deepgram proxy + analysis stream)
Prisma            — ORM (generates typed client)
@iprep/db         — DB queries
@iprep/providers  — Provider registry (new package)
@iprep/shared     — Shared types/constants (source of truth for API types)
```

### TypeScript Config (server + packages)
```jsonc
// tsconfig.json (base — extended by each package)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### Directory Structure
```
iprep-npm/apps/server/src/
├── index.js               # Server entry point
├── app.js                 # Express app setup + middleware
│
├── routes/
│   ├── interview.ts       # Interview session CRUD
│   ├── analysis.ts        # Trigger + fetch analysis
│   ├── packages.ts        # List interview packages
│   ├── tutors.ts          # List tutors
│   ├── providers.ts       # Provider status + key validation
│   ├── settings.ts        # User settings
│   ├── stt.ts             # EXISTING — STT config/readiness
│   └── auth.ts            # Auth (Phase 2 only)
│
├── services/
│   ├── deepgram-agent-proxy.ts  # EXISTING — migrate to .ts
│   ├── interview-engine.ts      # Session management + orchestration
│   ├── analysis-engine.ts       # Post-session analysis orchestration
│   ├── provider-registry.ts     # Which providers are live + fallback chain
│   └── recording-manager.ts     # Save/load local audio recordings
│
├── ws/
│   ├── agent-ws.ts        # Deepgram agent WebSocket handler
│   └── analysis-ws.ts     # Streaming analysis updates to frontend
│
└── utils/
    ├── env.ts             # EXISTING — env validation + zod schema
    ├── logger.ts          # Winston logger
    └── spawner.ts         # Re-exports from @iprep/providers/cli
```

### API Routes

```
POST   /api/interview/start          Start new session
GET    /api/interview/:id            Get session details
POST   /api/interview/:id/end        End session + queue analysis
GET    /api/interview/:id/transcript Get full transcript
DELETE /api/interview/:id            Delete session

POST   /api/analysis/:sessionId      Trigger analysis (async)
GET    /api/analysis/:sessionId      Get analysis result
WS     /ws/analysis/:sessionId       Stream analysis progress

GET    /api/packages                 List all interview packages
GET    /api/packages/:id             Get package details

GET    /api/tutors                   List all tutors
GET    /api/tutors/:id               Get tutor details

POST   /api/providers/validate       Validate an API key
GET    /api/providers/status         Check what's available + installed CLIs

GET    /api/settings                 Get user settings
PATCH  /api/settings                 Update user settings
POST   /api/settings/keys            Save BYOK key (encrypted)
DELETE /api/settings/keys/:provider  Remove key

WS     /ws/agent                     EXISTING — Deepgram agent proxy
```

### Analysis Engine (Core Logic)

```javascript
// services/analysis-engine.js

// Provider resolution chain (cheapest first):
const ANALYSIS_PROVIDER_CHAIN = [
  'gemini-free',    // 1. Gemini 2.0 Flash free tier (no key needed)
  'gemini-api',     // 2. User's Gemini API key
  'claude-cli',     // 3. Spawn Claude Code CLI (if installed)
  'gemini-cli',     // 4. Spawn Gemini CLI (if installed)
  'codex-cli',      // 5. Spawn Codex CLI (if installed)
  'ollama',         // 6. Local Ollama (if running)
  'claude-api',     // 7. User's Claude API key
  'openai-api',     // 8. User's OpenAI API key
];

// Analysis output format:
{
  sessionId: "...",
  provider: "claude-cli",
  scores: {
    communication:  8,   // 1-10
    technical:      7,
    problemSolving: 8,
    confidence:     6,
    overall:        7.3
  },
  strengths: ["...", "..."],
  improvements: ["...", "..."],
  answerFeedback: [
    {
      question: "Tell me about yourself",
      userAnswer: "...",
      feedback: "...",
      score: 7
    }
  ],
  report: "## Interview Analysis\n...",  // Full markdown
  generatedAt: "2026-04-19T..."
}
```

---

## Layer 3: CLI (@iprep/cli)

### Stack
```
Commander 11      — CLI command parsing (typed options via generics)
Inquirer 8        — Interactive prompts
Chalk             — Terminal colors
Ora               — Spinners
Winston           — Logging
Open              — Launch browser
TypeScript 5      — Compiled to dist/, tsx for dev
```

### Commands
```
iprep setup                  First-run: configure API keys, detect CLIs
iprep start                  Start server + open browser
iprep start --no-browser     Start server only (headless)
iprep analyze <sessionId>    Analyze a session from terminal
iprep status                 Show provider status (what's installed/configured)
iprep sessions               List recent sessions
iprep export <sessionId>     Export analysis as PDF/MD to disk
iprep keys                   Manage BYOK API keys
iprep keys set deepgram      Set Deepgram key interactively
iprep keys set gemini
iprep keys set claude
iprep update                 Check for iprep npm updates
```

### CLI Auto-Detection (on `iprep setup` or `iprep status`)
```javascript
// Detect installed AI CLIs — enables free analysis
const detected = await detectCLIs();

// Checks for:
{
  claude:   await which('claude'),    // Claude Code CLI
  codex:    await which('codex'),     // OpenAI Codex CLI
  gemini:   await which('gemini'),    // Google Gemini CLI
  ollama:   await checkOllama(),      // Ollama HTTP API on :11434
  whisper:  await which('whisper'),   // OpenAI Whisper CLI
}

// Output:
✅ claude    found at /usr/local/bin/claude (v1.2.3)
✅ gemini    found at /usr/local/bin/gemini
❌ codex     not installed  → install: npm i -g @openai/codex
❌ ollama    not running    → install: ollama.ai
```

---

## Layer 4: Provider Adapter System (@iprep/providers)

This is the core extensibility layer. New package split from `adapter-utils`.

### Interface Contract
```typescript
// @iprep/providers/src/types.ts — shared with frontend via @iprep/shared

export type ProviderType = 'llm' | 'stt' | 'tts' | 'agent';

export interface TranscriptMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface AnalysisResult {
  provider: string;
  scores: { overall: number; communication: number; technical: number; confidence: number };
  strengths: string[];
  improvements: string[];
  answerFeedback: { question: string; answer: string; feedback: string; score: number }[];
  report: string;
}

// LLM Provider
export interface ILLMProvider {
  readonly name: string;
  readonly type: 'llm';
  isAvailable(): Promise<boolean>;
  complete(messages: TranscriptMessage[], opts?: CompletionOptions): AsyncIterable<string>;
  analyze(transcript: TranscriptMessage[], opts?: AnalysisOptions): Promise<AnalysisResult>;
}

// STT Provider
export interface ISTTProvider {
  readonly name: string;
  readonly type: 'stt';
  isAvailable(): Promise<boolean>;
  transcribe(audioStream: NodeJS.ReadableStream): AsyncIterable<{
    text: string; isFinal: boolean; confidence: number;
  }>;
}

// TTS Provider
export interface ITTSProvider {
  readonly name: string;
  readonly type: 'tts';
  isAvailable(): Promise<boolean>;
  synthesize(text: string, voice: string): AsyncIterable<Buffer>;
}

// Agent Provider (all-in-one voice agent)
export interface IAgentProvider {
  readonly name: string;
  readonly type: 'agent';
  isAvailable(): Promise<boolean>;
  createSession(config: AgentSessionConfig): AgentSession;
}
```

### Provider Implementations
```
@iprep/providers/src/
│
├── llm/
│   ├── ClaudeAPIProvider.ts       BYOK — Anthropic API (@anthropic-ai/sdk)
│   ├── ClaudeCLIProvider.ts       spawn: claude --json "..."
│   ├── GeminiAPIProvider.ts       BYOK — Google Gemini API (@google/generative-ai)
│   ├── GeminiCLIProvider.ts       spawn: gemini "..."
│   ├── GeminiFreeProvider.ts      Free tier via Google AI Studio REST
│   ├── OpenAIProvider.ts          BYOK — OpenAI API (openai sdk)
│   ├── CodexCLIProvider.ts        spawn: codex "..."
│   └── OllamaProvider.ts          Local — Ollama REST API on :11434
│
├── stt/
│   ├── DeepgramSTTProvider.ts     BYOK — Deepgram STT WebSocket
│   ├── OpenAIWhisperProvider.ts   BYOK — OpenAI Whisper API
│   └── WhisperLocalProvider.ts    Future — local whisper.cpp binary
│
├── tts/
│   ├── DeepgramTTSProvider.ts     BYOK — Deepgram Aura TTS
│   ├── OpenAITTSProvider.ts       BYOK — OpenAI TTS API
│   ├── PiperProvider.ts           Future — local Piper TTS binary
│   └── CoquiProvider.ts           Future — local Coqui TTS
│
├── agent/
│   ├── DeepgramAgentProvider.ts   Current — Deepgram Voice Agent (all-in-one)
│   └── CustomAgentProvider.ts     Future — your own hosted agent
│
├── types.ts                       All provider interfaces + shared types
├── registry.ts                    Provider resolution + typed fallback chain
└── index.ts                       Exports all providers
```

### CLI Spawner Pattern (Key Architecture)
```typescript
// llm/ClaudeCLIProvider.ts
import { spawn } from 'node:child_process';

export class ClaudeCLIProvider extends ILLMProvider {
  get name() { return 'claude-cli' }

  async isAvailable() {
    try {
      await execAsync('claude --version');
      return true;
    } catch { return false; }
  }

  async analyze(transcript, { systemPrompt, format = 'json' }) {
    const prompt = buildAnalysisPrompt(transcript, systemPrompt);

    return new Promise((resolve, reject) => {
      const proc = spawn('claude', ['--json', prompt], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let output = '';
      proc.stdout.on('data', d => output += d);
      proc.stderr.on('data', d => logger.warn('claude-cli stderr:', d.toString()));

      proc.on('close', code => {
        if (code !== 0) return reject(new Error(`claude-cli exited ${code}`));
        resolve(parseAnalysisOutput(output));
      });
    });
  }
}

// Same pattern for: GeminiCLIProvider, CodexCLIProvider, OllamaProvider
```

### Provider Registry (Fallback Chain)
```typescript
// registry.ts
import type { ILLMProvider, ISTTProvider, ITTSProvider, IAgentProvider } from './types.js';

export interface ProviderConfig {
  deepgramKey?: string;
  anthropicKey?: string;
  geminiKey?: string;
  openaiKey?: string;
}

export class ProviderRegistry {
  private config: ProviderConfig;
  private cache = new Map<string, ILLMProvider | ISTTProvider | ITTSProvider | IAgentProvider>();

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  async resolveAnalysisProvider(): Promise<ILLMProvider> {
    const chain: ILLMProvider[] = [
      new GeminiFreeProvider(),
      new GeminiAPIProvider(this.config),
      new ClaudeCLIProvider(),
      new GeminiCLIProvider(),
      new CodexCLIProvider(),
      new OllamaProvider(),
      new ClaudeAPIProvider(this.config),
      new OpenAIProvider(this.config),
    ];

    for (const provider of chain) {
      if (await provider.isAvailable()) return provider;
    }

    throw new Error('No analysis provider available. Add a key in Settings or install a CLI.');
  }

  async resolveSTT(): Promise<ISTTProvider> { ... }
  async resolveTTS(): Promise<ITTSProvider> { ... }
  async resolveAgent(): Promise<IAgentProvider> { ... }
}
```

---

## Layer 5: Database (@iprep/db)

### Prisma Schema
```prisma
// packages/db/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"           // → "postgresql" for cloud tier
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  name      String?
  tier      Tier     @default(FREE)
  createdAt DateTime @default(now())
  settings  Settings?
  sessions  Session[]
  apiKeys   ApiKey[]
}

model Settings {
  id              String @id @default(cuid())
  userId          String @unique
  user            User   @relation(fields: [userId], references: [id])
  defaultProvider String @default("deepgram-agent")
  defaultTutor    String @default("alex")
  theme           String @default("dark")
  voiceEnabled    Boolean @default(true)
  language        String @default("en")
}

model ApiKey {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  provider  String   // "deepgram" | "anthropic" | "openai" | "gemini"
  keyHash   String   // bcrypt hash (local: stored in .env, hash for reference)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  @@unique([userId, provider])
}

model Package {
  id          String      @id @default(cuid())
  slug        String      @unique  // "behavioral" | "technical" | "system-design" | "dsa" | "hr" | "pm"
  name        String
  type        PackageType
  description String
  questions   Json        // QuestionTemplate[]
  isPro       Boolean     @default(false)
  sessions    Session[]
}

model Tutor {
  id           String  @id @default(cuid())
  slug         String  @unique   // "alex" | "priya" | "morgan"
  name         String
  persona      String            // description
  systemPrompt String            // full prompt
  voice        String            // Deepgram voice ID
  avatarUrl    String?
  isPro        Boolean @default(false)
}

model Session {
  id            String        @id @default(cuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id])
  packageId     String
  package       Package       @relation(fields: [packageId], references: [id])
  tutorId       String
  status        SessionStatus @default(ACTIVE)
  mode          SessionMode   @default(VOICE)
  provider      String        // which voice/agent provider was used
  startedAt     DateTime      @default(now())
  endedAt       DateTime?
  durationSec   Int?
  recordingPath String?       // local path or cloud URL
  transcript    Json?         // Message[]
  analysis      Analysis?
  createdAt     DateTime      @default(now())
}

model Analysis {
  id            String         @id @default(cuid())
  sessionId     String         @unique
  session       Session        @relation(fields: [sessionId], references: [id])
  provider      String         // which LLM analyzed ("claude-cli", "gemini-api", ...)
  status        AnalysisStatus @default(PENDING)
  scores        Json?          // { overall, communication, technical, confidence, ... }
  strengths     Json?          // string[]
  improvements  Json?          // string[]
  answerFeedback Json?         // AnswerFeedback[]
  report        String?        // full markdown analysis
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

// ── Enums ──────────────────────────────────────────────────────────────

enum Tier          { FREE PRO CLOUD }
enum SessionStatus { ACTIVE COMPLETED ABANDONED }
enum SessionMode   { VOICE TEXT }
enum AnalysisStatus{ PENDING RUNNING COMPLETED FAILED }
enum PackageType   { BEHAVIORAL TECHNICAL SYSTEM_DESIGN DSA HR PM CUSTOM }
```

### DB Strategy per Phase
```
Phase 1 (Local):
  DATABASE_URL="file:~/.iprep/db.sqlite"
  Provider: libsql (already configured)
  Migrations: auto on first run
  Backup: user's responsibility (file copy)

Phase 2 (Cloud):
  DATABASE_URL="postgresql://..."
  Provider: postgresql (same Prisma schema, change datasource)
  Hosting: Supabase (free → paid as scale grows)
  Migrations: prisma migrate deploy on deploy

Phase 3 (Hybrid):
  Local users: SQLite locally
  Cloud users: Postgres on Supabase
  Sync: optional Turso (cloud SQLite) for local→cloud sync
        already have @libsql/client + @prisma/adapter-libsql
```

---

## Layer 6: Validation (Zod + @iprep/shared)

Zod is the single source of truth for data shapes. Schemas live in `@iprep/shared` and are imported by both `apps/web` and `apps/server` — no duplicated type definitions, no drift.

### Where Zod Is Used

```
@iprep/shared/src/schemas/
├── session.schema.ts     → validates session start/end API body + form
├── analysis.schema.ts    → validates analysis result shape from any LLM provider
├── provider.schema.ts    → validates BYOK key config + provider options
└── env.schema.ts         → validates process.env on server startup (fail fast)

apps/server — route body validation:
  POST /api/interview/start   → z.parse(req.body) with session.schema
  POST /api/settings/keys     → z.parse(req.body) with provider.schema

apps/web — form validation:
  Setup wizard               → provider.schema (key format check before saving)
  Interview start form       → session.schema (package + tutor selection)
```

### Example Schema (shared)
```typescript
// @iprep/shared/src/schemas/session.schema.ts
import { z } from 'zod';

export const StartSessionSchema = z.object({
  packageSlug: z.enum(['behavioral', 'technical', 'system-design', 'dsa', 'hr', 'pm']),
  tutorSlug:   z.string().min(1),
  mode:        z.enum(['voice', 'text']).default('voice'),
  provider:    z.string().optional(),
});

export type StartSessionInput = z.infer<typeof StartSessionSchema>;
// Used identically in Express route (server) and form submit (web)
```

### Env Validation (server startup)
```typescript
// @iprep/shared/src/schemas/env.schema.ts
import { z } from 'zod';

export const EnvSchema = z.object({
  PORT:            z.string().default('3000'),
  DATABASE_URL:    z.string().min(1),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  NODE_ENV:        z.enum(['development', 'production', 'test']).default('development'),
  // All BYOK keys optional — user provides at runtime
  DEEPGRAM_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY:    z.string().optional(),
  OPENAI_API_KEY:    z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;
// Replaces current env.js — crashes on startup if required vars missing
```

---

## Monorepo Package Map

Single repository — frontend + backend + packages together.

```
iprep/                              (pnpm workspace root — single GitHub repo)
├── apps/
│   ├── web/                        @iprep/web — Vite + React (was iprep-web)
│   ├── server/                     @iprep/server — Express HTTP + WS
│   └── cli/                        @iprep/cli — user-facing CLI
│
└── packages/
    ├── db/                         @iprep/db — Prisma schema + queries
    ├── providers/                  @iprep/providers — all LLM/STT/TTS/Agent adapters
    │   ├── src/llm/
    │   ├── src/stt/
    │   ├── src/tts/
    │   ├── src/agent/
    │   └── src/registry.ts
    ├── shared/                     @iprep/shared — Zod schemas + TS types (source of truth)
    │   ├── src/schemas/            Zod schemas shared by web + server
    │   │   ├── session.schema.ts
    │   │   ├── analysis.schema.ts
    │   │   ├── provider.schema.ts
    │   │   └── env.schema.ts
    │   └── src/types/              Inferred types from Zod schemas
    └── adapter-utils/              @iprep/adapter-utils — MIGRATE INTO providers

Why single repo:
  ✅ @iprep/shared types used by both web and server — no drift, one PR
  ✅ Single CI pipeline (pnpm -r run build + test)
  ✅ Contributor clones one repo, runs one command
  ✅ Zod schema changes propagate instantly across all packages
```

---

## Phase Roadmap

### Phase 1 — Local-First (Now → Month 3)
Goal: Ship, get 30 paying users at ₹149/month

```
✅ Already done:
  - Deepgram Agent proxy
  - Voice call UI (CallBar, StatusDock)
  - Express server + SQLite

🔨 Build next:
  - PackageSelector + TutorSelector UI
  - Interview session lifecycle (start → end → analyze)
  - @iprep/providers package (GeminiFreeProvider + ClaudeCLI first)
  - Analysis engine with fallback chain
  - AnalysisDashboard UI (ScoreCard, FeedbackPanel, TranscriptViewer)
  - iprep setup CLI wizard (key config + CLI detection)
  - Prisma schema finalization + migrations
  - Billing: Razorpay integration for ₹149/month (one route, one webhook)
  - Landing page on qaplatground.com (link to npm install)
```

### Phase 2 — Cloud Tier (Month 4-9)
Goal: Add ₹499/month managed cloud, 25+ cloud users

```
🔨 Build:
  - Auth: Supabase Auth (email + Google OAuth)
  - DB: switch to PostgreSQL (Supabase)
  - Cloud recording storage: Cloudflare R2
  - Managed API key vault (encrypted server-side)
  - Web dashboard (no install required)
  - Stripe/Razorpay subscription management
  - Multi-user isolation
  - Usage metering (voice minutes, analyses)
```

### Phase 3 — Self-Hosted AI (Month 12+)
Goal: Offer own STT/TTS/LLM, optional paid model

```
🔨 Build:
  - WhisperLocalProvider (whisper.cpp)
  - PiperProvider (Piper TTS)
  - OllamaProvider extensions (custom interview models)
  - Fine-tuned interview coaching LLM
  - iPrep Cloud agent (replaces Deepgram Agent with own infra)
  - Docker compose for self-hosted deployment
```

---

## Open Source Strategy

```
Repository structure:
  github.com/kundalik-dev/iprep      — single monorepo (web + server + cli + packages)

License: AGPL v3 (open source) + commercial license option
         → self-hosted users: free forever
         → ₹149/month Pro users: allowed (using, not reselling)
         → iPrep cloud SaaS: allowed (copyright owner is exempt)
         → competitor builds SaaS clone: must open-source all their code
           OR buy a commercial license from kundalikjadhav5545@gmail.com
         → future: white-label / enterprise deals via commercial license

npm: iprep (already registered + published)

Community:
  Discord server — support + contributions
  qaplatground.com — funnel + blog posts
  GitHub Discussions — feature requests

Contribution surface:
  - New interview packages (JSON question sets)
  - New tutor personas
  - New provider adapters (low barrier — just implement ILLMProvider)
  - UI components (React, Tailwind)
```

---

## Key Architecture Principles

1. **TypeScript strict everywhere:** All packages use strict mode. `@iprep/shared` is the single source of truth for Zod schemas + inferred types — used identically in server routes and web forms.
2. **Provider-agnostic:** Never hardcode Deepgram. Every voice/LLM call goes through registry.
3. **Cheapest path first:** Fallback chain always tries free/CLI before paid API.
4. **Local privacy:** In Phase 1, nothing leaves user's machine except API calls they configure.
5. **Same schema, two backends:** Prisma enables SQLite→Postgres switch with zero app code change.
6. **CLI spawn as feature, not hack:** Claude/Codex/Gemini/Ollama spawning is documented, tested, typed.
7. **Zero-cost floor:** iPrep must work with only free-tier credits. Paying is for convenience + platform.
8. **Adapter as plugin:** Adding a new provider = one `.ts` file implementing the interface + register in chain. No core changes.

---

*Architecture Version: 1.0 | iPrep Codex | April 2026*
