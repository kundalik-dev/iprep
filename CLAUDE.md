# iPrep — Claude Code Context

> Read this file first. It gives you everything needed to contribute to iPrep without re-asking the user for context.

---

## What Is iPrep?

iPrep is an **AI-powered interview preparation platform** — a voice-based tool where users practice job interviews with AI tutors. The AI tutor speaks, listens, asks questions, and gives feedback after each session.

**Target user:** Job seekers in India preparing for technical + behavioral interviews.
**Business model:** Free (local, self-hosted) → ₹149/month Pro → ₹499/month Cloud.
**Distribution:** npm package (`iprep`) — install globally, run locally.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vite 5 + React 18 + TypeScript (strict) + React Router v6 |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Backend | Express 4 + TypeScript + WebSockets (`ws`) |
| ORM | Prisma (SQLite local → Postgres cloud) |
| Voice Agent | Deepgram Voice Agent API (BYOK) |
| LLM Analysis | Gemini Free → Claude CLI → Gemini CLI → Ollama → APIs (fallback chain) |
| Validation | Zod — shared schemas in `@iprep/shared` (used by both server + frontend) |
| Monorepo | pnpm workspaces |
| CLI | Commander + Inquirer + Chalk + Ora |

---

## Project Structure (Current)

```
iprep/                              ← pnpm workspace root
├── CLAUDE.md                       ← you are here
├── apps/
│   ├── frontend/                   @iprep/frontend — Vite + React SPA
│   ├── server/                     @iprep/server — Express HTTP + WebSocket
│   └── cli/                        @iprep/cli — user-facing CLI (iprep command)
│
├── packages/
│   ├── shared/                     @iprep/shared — Zod schemas + TS types (source of truth)
│   ├── db/                         @iprep/db — Prisma schema + query functions
│   └── llm/
│       ├── providers/              LLM/STT/TTS/Agent provider implementations
│       ├── adapters/               Claude, Gemini, OpenAI adapter wrappers
│       └── adapter-utils/          Generic process spawner (spawn any CLI)
│
├── docs/
│   ├── architecture/
│   │   ├── ARCHITECTURE.md         Full system architecture (layers, decisions, schema)
│   │   ├── PLAN.md                 Phased build plan — CHECK THIS for what to build next
│   │   └── BUILD-PLAN.md           Detailed checklist per phase
│   ├── project-rules/
│   │   ├── AI_RULES.md             Rules for AI-assisted code
│   │   ├── NAMING_CONVENTIONS.md   Naming rules (camelCase, PascalCase, etc.)
│   │   └── github-rules/           Git workflow docs
│   └── feature/                    Per-feature task breakdowns
│
└── tests/                          Test files
```

---

## Current Build Status

**Phase: 0 — Monorepo Scaffold (IN PROGRESS) → Phase 8 — Shared Schemas (DONE)**

The project is in the planning/documentation stage. Source code directories exist but are empty. No `package.json` files, no `pnpm-workspace.yaml` yet.

### What to Build Next (in order)

| Phase | Focus | Status |
|---|---|---|
| **0** | Monorepo scaffold — `package.json`, `pnpm-workspace.yaml`, placeholder packages | 🟡 In Progress |
| **1** | `packages/llm/adapter-utils` — generic CLI process spawner | 🔴 Not started |
| **2** | `packages/llm/adapters/claude` — Claude-specific adapter | 🔴 Not started |
| **3** | `apps/cli` — `iprep init`, `iprep doctor`, `iprep status` commands | 🔴 Not started |
| **4** | `packages/db` — Prisma schema + query functions | 🔴 Not started |
| **5** | `apps/server` — Express REST API + WebSocket + analysis engine | 🔴 Not started |
| **6** | `packages/llm/providers` — all LLM/STT/TTS provider implementations | 🔴 Not started |
| **7** | `apps/frontend` — full voice interview React UI | 🔴 Not started |
| **8** | `packages/shared` — finalize Zod schemas for all layers | 🟢 Done |
| **9** | Build pipeline — `vite build` → serve from Express → npm publish | 🔴 Not started |
| **10** | Polish, error handling, Razorpay billing, export, backup | 🔴 Not started |

> See `docs/architecture/PLAN.md` for full phase details and "Done When" tests.

---

## Key Architecture Decisions

1. **`apps/frontend` not `apps/web`** — the actual directory name, not the planned one.
2. **`packages/llm`** contains `providers/`, `adapters/`, `adapter-utils/` — not a flat `packages/providers`.
3. **Zod schemas live in `@iprep/shared`** — never define the same type in both server and frontend.
4. **Provider fallback chain** — always try cheapest first (Gemini free → CLI tools → paid APIs).
5. **Deepgram Voice Agent** is the current voice implementation — not custom STT+TTS separately.
6. **SQLite locally, Postgres on cloud** — same Prisma schema, just change datasource.
7. **BYOK (Bring Your Own Key)** — users provide API keys; iPrep never stores them in plain text.
8. **No auth in Phase 1** — local-only, no login needed.

---

## Coding Conventions

### Naming
| Thing | Style | Example |
|---|---|---|
| Variable | `camelCase` | `userScore` |
| Boolean | `camelCase` + `is/has/can` | `isLoggedIn` |
| Constant | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| Function | `camelCase`, verb-first | `getUserById()` |
| React component | `PascalCase` | `ScoreCard` |
| TS Interface | `PascalCase` + `I` prefix | `ILLMProvider` |
| TS Type alias | `PascalCase` | `AnalysisResult` |
| TS Enum | `PascalCase` (members `SCREAMING_SNAKE_CASE`) | `enum Status { IN_PROGRESS }` |
| Source file | `kebab-case` | `analysis-engine.ts` |
| React file | `PascalCase` | `ScoreCard.tsx` |
| Folder | `kebab-case` | `adapter-utils/` |

### TypeScript
- **Strict mode everywhere** — `"strict": true`, `"noUncheckedIndexedAccess": true`
- No `any` — use `unknown` and narrow it
- All API shapes defined as Zod schemas in `@iprep/shared`, types inferred via `z.infer<>`
- Prefer `interface` for objects that may be extended, `type` for unions/aliases

### Code Style
- **Write small, focused code blocks** — split large logic into smaller functions/files, not one big block
- **Comments:** add a short comment when the purpose isn't obvious from the name; never multi-line blocks; one line max
- No unused variables, no `_` prefixes
- No `console.log` in production code — use the Winston logger
- Error handling only at system boundaries (API routes, external calls)

---

## Git Workflow

```
main          ← production only, always stable
  └── dev_branch  ← integration branch, merge PRs here
        └── feat/<name>   ← one branch per feature/phase
```

### Branch Naming
- `feat/phase-0-scaffold`
- `feat/phase-1-adapter-utils`
- `fix/deepgram-proxy-timeout`
- `docs/update-architecture`
- `chore/update-dependencies`

### Commit Message Format
```
feat: add ProcessSpawner with stdin/stdout lifecycle
fix: handle Claude auth error in ClaudeAdapter
chore: add pnpm-workspace.yaml
docs: update PLAN.md with phase 6 details
```

### PR Flow
1. Work on `feat/<name>` branch
2. Open PR → `dev_branch` (never directly to `main`)
3. `dev_branch` → `main` only when stable and tested

---

## AI Contribution Rules

- AI can scaffold, explain, refactor (with review), write tests, write docs
- AI **cannot** make architectural decisions — discuss in an issue first
- AI **cannot** auto-merge or resolve conflicts
- Every AI-generated PR must note: model used, context given, lines reviewed
- Make **targeted, small changes** — no sweeping rewrites unless planned

---

## Useful Commands (once scaffold is done)

```bash
pnpm install                    # Install all workspace dependencies
pnpm -r run build               # Build all packages
pnpm --filter @iprep/server dev # Run server in dev mode
pnpm --filter @iprep/frontend dev # Run frontend (Vite) in dev mode
iprep doctor                    # Check all prerequisites
iprep start                     # Start server + open browser
```

---

## Key Files to Read for More Context

| File | What's in it |
|---|---|
| `docs/architecture/ARCHITECTURE.md` | Full system design, provider interfaces, DB schema, phase roadmap |
| `docs/architecture/PLAN.md` | Phased build plan with "Done When" tests — use this to know what to build |
| `docs/architecture/BUILD-PLAN.md` | Granular feature checklists per phase |
| `docs/project-rules/NAMING_CONVENTIONS.md` | Full naming rules |
| `docs/project-rules/AI_RULES.md` | Rules for AI contributions |
| `docs/project-rules/github-rules/GIT_COMMIT_INFO.md` | Git branch + commit workflow |
