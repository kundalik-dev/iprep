# iPrep — AI Interview Preparation

Practice interviews, land the job. A voice-based interview preparation tool with AI tutors — practice technical and behavioral interviews, get scored feedback after each session.

---

## ✨ Features

| Category                    | Details                                                                        |
| --------------------------- | ------------------------------------------------------------------------------ |
| **Voice Interviews**        | Live speech-to-speech sessions with AI tutors                                  |
| **Interview Packages**      | Behavioral · Technical · System Design · DSA · HR · PM                         |
| **Resume-Based Interviews** | Upload your resume — tutor asks questions tailored to your experience          |
| **Your Own Questions**      | Bring your own question list, notes, or study material for the session         |
| **Goal-Driven Prep**        | Set your target role, company, or position — tutor adapts focus accordingly    |
| **AI Tutors**               | Multiple tutor personas with distinct styles                                   |
| **Post-Session Analysis**   | Scored feedback: communication, technical, confidence, problem-solving         |
| **Provider-Agnostic**       | Deepgram · Claude CLI · Gemini Free · OpenAI · Ollama — no key needed to start |
| **Local-First**             | SQLite database, API keys stay on your machine, zero cloud dependency          |

---

## 📦 Using iPrep as an End User

### Prerequisite

At least one AI provider key (Deepgram recommended for voice). Run `iprep setup` after installing — it walks you through everything.

### Option A — Run Without Installing (npx)

```bash
npx iprep setup      # first-time setup
npx iprep start      # start the server + open the UI
npx iprep --help     # see all commands
```

### Option B — Install Globally (npm)

```bash
npm install -g iprep
iprep setup          # first-time setup
iprep start          # start the server + open the UI
iprep status         # check provider status
```

**Update:**

```bash
npm update -g iprep
```

**Uninstall:**

```bash
npm uninstall -g iprep
```

### Where iPrep Stores Data

All data is stored locally in your home directory — nothing goes to the cloud:

```
~/.iprep/
├── database/       # SQLite database (sessions, transcripts, analysis)
├── aitutors/       # Tutor personality configs
├── documents/      # Your uploaded resume, notes, study material
├── skills/         # Skills store
├── recordings/     # Local audio recordings
├── exports/        # Exported analysis reports
└── logs/           # Application logs
```

---

## 🚀 Quick Start (Developer)

### Prerequisites

```bash
node --version      # 18+
pnpm --version      # install: npm install -g pnpm
```

### Install and Run

```bash
# 1. Clone and install
git clone <repo-url>
cd iprep
pnpm install

# 2. Set up the database
cd packages/db && npx prisma generate && npx prisma db push && cd ../..

# 3. Start everything
pnpm dev
# → Express API on http://localhost:3000
# → Vite dev server on http://localhost:5173
```

Open **http://localhost:5173** to see the interview UI.

---

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Browser     │────▶│ @iprep/      │────▶│ Provider Registry│
│  React SPA   │◀────│ server       │◀────│ (Adapter Pattern)│
│  Vite :5173  │     │ Express :3000│     └──────────────────┘
└──────────────┘     └──────┬───────┘              │
                            │               ┌───────▼──────┐
                  ┌─────────▼──────┐        │  @iprep/llm  │
                  │  @iprep/db     │        │  CLI Spawners│
                  │  Prisma+SQLite │        └──────────────┘
                  └────────────────┘

Providers (BYOK — your own keys):
Deepgram (voice) · Claude CLI/API · Gemini Free/CLI/API · OpenAI · Ollama
```

**How analysis works:**
Session ends → analysis engine runs → scored report saved to DB → shown in UI.

---

## 📂 Project Structure (Monorepo)

```
iprep/
├── apps/
│   ├── frontend/              @iprep/frontend — Vite + React SPA
│   │   └── src/
│   │       ├── pages/         Setup, Dashboard, InterviewSession, Analysis, History, Settings
│   │       ├── components/    Interview/, Analysis/, Settings/, CallControls/, ui/
│   │       ├── hooks/         useDeepgramAgent, useProvider, useSession, useAnalysis
│   │       └── stores/        Zustand: sessionStore, providerStore, settingsStore
│   │
│   ├── server/                @iprep/server — Express HTTP + WebSocket
│   │   └── src/
│   │       ├── routes/        interview, analysis, packages, tutors, providers, settings
│   │       ├── services/      interview-engine, analysis-engine, deepgram-agent-proxy
│   │       └── ws/            agent-ws.ts, analysis-ws.ts
│   │
│   └── cli/                   @iprep/cli — Commander.js CLI
│       └── src/commands/      setup, start, analyze, status, sessions, export, keys
│
├── packages/
│   ├── shared/                @iprep/shared — Zod schemas + TS types (source of truth)
│   ├── db/                    @iprep/db — Prisma ORM + SQLite queries
│   └── llm/                   @iprep/llm — Provider adapter system
│       ├── providers/         ClaudeAPI, ClaudeCLI, GeminiAPI, GeminiFree, OpenAI, Ollama
│       ├── adapters/          Provider wrappers
│       └── adapter-utils/     Generic CLI process spawner
│
├── docs/                      Architecture, build plan, project rules
├── pnpm-workspace.yaml
└── package.json
```

---

## 📦 Tech Stack

| Layer           | Technology                                                |
| --------------- | --------------------------------------------------------- |
| **Monorepo**    | pnpm workspaces                                           |
| **Frontend**    | Vite 5 + React 18 + TypeScript (strict) + React Router v6 |
| **Styling**     | Tailwind CSS + shadcn/ui                                  |
| **State**       | Zustand                                                   |
| **Backend**     | Express 4 + TypeScript + WebSockets (`ws`)                |
| **Database**    | SQLite + Prisma ORM                                       |
| **Voice Agent** | Deepgram Voice Agent API                                  |
| **Validation**  | Zod — shared schemas in `@iprep/shared`                   |
| **CLI**         | Commander.js + Inquirer + Chalk + Ora                     |

---

## 🛠️ API Endpoints

| Method | Endpoint                        | Description                  |
| ------ | ------------------------------- | ---------------------------- |
| `GET`  | `/api/health`                   | Server health check          |
| `GET`  | `/api/tutors`                   | List all tutors              |
| `GET`  | `/api/packages`                 | List interview packages      |
| `POST` | `/api/interview/start`          | Start new interview session  |
| `GET`  | `/api/interview/:id`            | Get session details          |
| `POST` | `/api/interview/:id/end`        | End session + queue analysis |
| `GET`  | `/api/interview/:id/transcript` | Get full transcript          |
| `POST` | `/api/analysis/:sessionId`      | Trigger analysis (async)     |
| `GET`  | `/api/analysis/:sessionId`      | Get analysis result          |
| `WS`   | `/ws/agent`                     | Deepgram voice agent proxy   |
| `WS`   | `/ws/analysis/:sessionId`       | Stream analysis progress     |

---

## 🐛 Troubleshooting

### Prisma client missing

```bash
cd packages/db && npx prisma generate
```

### Database reset

```bash
rm ~/.iprep/db.sqlite
cd packages/db && npx prisma db push
```

### Port already in use

```bash
PORT=4000 pnpm --filter @iprep/server dev
```

### No analysis provider available

Run `iprep status` to see what's detected. Install Claude Code CLI or Gemini CLI for free analysis, or add an API key via `iprep keys set gemini`.

---

## 🔐 Security & Privacy

- Everything runs locally — no cloud dependency
- API keys are never exposed to the browser
- Transcripts stored locally only

---

## 🚫 Disclaimer

iPrep is an independent tool, not affiliated with Deepgram, Anthropic, Google, or OpenAI. You need your own accounts and keys to use their services. All AI responses are for practice purposes only.

---

## 📝 License

AGPL V3.0

---

**Last Updated:** 2026-04-20
