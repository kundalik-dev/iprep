# iPrep — Phased Build Plan
# Bottom-Up: adapter-utils → Claude Adapter → CLI → Backend → Frontend → npm

**Created:** 2026-04-14  
**Stack:** Node.js + Express + React + Vite + SQLite + Prisma + Claude Code CLI

---

## Reading This Document

Each phase has:
- **Goal** — what you're building and why it comes in this order
- **Deliverable** — the thing you can demo/test when the phase is done
- **Files to create** — exact file list
- **Feature checklist** — granular tasks inside the phase
- **Done when** — how you verify the phase is complete before moving on

Phases are ordered so each one builds on the last. Never skip a phase — if Phase 2 (Claude adapter) isn't working, Phase 5 (backend) will be broken in subtle ways.

---

## Phase 0 — Monorepo Scaffold
**Duration: 0.5 day**

### Goal
Create the skeleton everything else lives in. No code logic yet — just folder structure, workspace config, and package.json files. Getting this right now saves hours of path debugging later.

### Deliverable
`pnpm install` works, all workspaces resolve, no errors.

### Files to Create

```
iprep/
├── package.json                       # Root: workspaces config, pnpm
├── pnpm-workspace.yaml                # Declares packages/* and apps/*
├── .gitignore                         # node_modules, dist, *.db, .env, ~/.iprep
├── .env.example                       # Template env vars
│
├── packages/
│   ├── shared/
│   │   ├── package.json               # name: @iprep/shared
│   │   ├── src/
│   │   │   ├── constants/
│   │   │   │   ├── tutors.js          # DEFAULT_TUTORS list
│   │   │   │   ├── api.js             # API_ENDPOINTS map
│   │   │   │   └── config.js          # DEFAULT_PORT, APP_NAME, HOME_DIR
│   │   │   ├── utils/
│   │   │   │   ├── logger.js          # Shared logger (timestamps, levels)
│   │   │   │   └── validators.js      # Input validators (tutorId, userId, etc.)
│   │   │   └── index.js               # Export everything
│   │   └── index.js
│   │
│   ├── adapter-utils/
│   │   ├── package.json               # name: @iprep/adapter-utils (placeholder)
│   │   └── src/
│   │       └── index.js               # Empty placeholder
│   │
│   └── document-converter/
│       ├── package.json               # name: @iprep/document-converter (placeholder)
│       └── src/
│           └── index.js               # Empty placeholder
│
├── apps/
│   ├── server/
│   │   ├── package.json               # name: @iprep/server (placeholder)
│   │   └── src/
│   │       └── index.js               # Empty placeholder
│   │
│   ├── web/
│   │   ├── package.json               # name: @iprep/web (placeholder)
│   │   └── src/
│   │       └── main.jsx               # Empty placeholder
│   │
│   └── cli/
│       ├── package.json               # name: @iprep/cli, "bin": {"iprep": "./bin/iprep.js"}
│       └── bin/
│           └── iprep.js               # #!/usr/bin/env node (placeholder)
│
└── tutors/
    ├── english-coach/                 # Empty dirs for now
    ├── interview-prep/
    └── client-communication/
```

### Feature Checklist

- [ ] Root `package.json` with `"workspaces": ["packages/*", "apps/*"]`
- [ ] `pnpm-workspace.yaml` defining both package groups
- [ ] Each package has its own `package.json` with correct `name` field
- [ ] `@iprep/shared` constants: `DEFAULT_PORT=3000`, `IPREP_HOME=~/.iprep`, `APP_NAME=iprep`
- [ ] `@iprep/shared` logger: `log.info()`, `log.error()`, `log.warn()`, `log.debug()` with timestamps
- [ ] `@iprep/shared` validators: `isValidTutorId(id)`, `isValidMessage(msg)`, `isNonEmpty(str)`
- [ ] `.gitignore` covers: `node_modules/`, `dist/`, `*.db`, `.env`, `~/.iprep/`
- [ ] `pnpm install` runs clean with zero errors
- [ ] Can import `@iprep/shared` from any other workspace package

### Done When
```bash
pnpm install               # No errors
node -e "require('@iprep/shared')"   # No import errors
```

---

## Phase 1 — adapter-utils (Generic Process Spawner)
**Duration: 2 days**

### Goal
Build a generic, reusable library that knows how to spawn any CLI as a child process, communicate via stdin/stdout, and handle errors. This is the engine that powers everything. It knows nothing about Claude specifically — that's Phase 2.

This package is what you open source. Community can use it to build Gemini, Ollama, or GPT-CLI adapters.

### Deliverable
Can spawn any process, send a message, and receive the response back as a structured object. Test it with `echo` or a simple Python script before hooking up Claude.

### Files to Create

```
packages/adapter-utils/
├── package.json
└── src/
    ├── process-spawner.js        # CORE: spawns a CLI, manages stdin/stdout lifecycle
    ├── session-manager.js        # Tracks active processes by session ID
    ├── response-parser.js        # Base parser: splits stdout into lines, handles JSON
    ├── error-handler.js          # Standardized error types: SpawnError, TimeoutError, ParseError
    ├── stream-reader.js          # Reads stdout line by line, emits events
    └── index.js                  # Exports: ProcessSpawner, SessionManager, errors
```

### Feature Checklist

**process-spawner.js**
- [ ] `ProcessSpawner` class that takes `{ command, args, env, cwd, timeout }` config
- [ ] `spawn()` — starts the child process, returns promise that resolves when ready
- [ ] `send(text)` — writes text to stdin, returns promise that resolves with response
- [ ] `kill()` — gracefully terminates process (SIGTERM then SIGKILL after 3s)
- [ ] `isAlive()` — returns boolean, checks if process is still running
- [ ] EventEmitter: emits `message`, `error`, `exit`, `ready` events
- [ ] Handles process crash: emits `error` event, cleans up internal state
- [ ] Handles stdout encoding (UTF-8)
- [ ] Configurable timeout per `send()` call (default: 60s)
- [ ] Cross-platform: works on macOS, Linux, Windows

**session-manager.js**
- [ ] `SessionManager` class — singleton, manages all active spawner instances
- [ ] `getOrCreate(sessionId, config)` — returns existing spawner or creates new one
- [ ] `get(sessionId)` — returns spawner or null
- [ ] `destroy(sessionId)` — kills process and removes from map
- [ ] `destroyAll()` — kills all processes (called on server shutdown)
- [ ] `list()` — returns all active session IDs and process pids
- [ ] Auto-cleanup: removes dead sessions from map when process exits

**response-parser.js**
- [ ] `BaseResponseParser` class
- [ ] `parseLine(line)` — tries JSON.parse, falls back to raw string
- [ ] `isComplete(data)` — abstract method (subclasses implement)
- [ ] `extractText(data)` — abstract method (subclasses implement)
- [ ] Buffer incomplete lines across chunks

**stream-reader.js**
- [ ] `StreamReader` class wrapping a readable stream
- [ ] Emits `line` event for each complete line
- [ ] Handles chunks that split across multiple lines
- [ ] Handles empty lines (skip)

**error-handler.js**
- [ ] `SpawnError` — process couldn't be started (command not found, permission denied)
- [ ] `TimeoutError` — process didn't respond within timeout
- [ ] `ParseError` — couldn't parse response from stdout
- [ ] `ProcessDeadError` — tried to send to a process that already exited
- [ ] Each error has: `code`, `message`, `originalError`, `retryable` boolean

### Done When
```javascript
// Test script: packages/adapter-utils/test-manual.js
const { ProcessSpawner } = require('./src');

const spawner = new ProcessSpawner({ command: 'cat', args: [] });
await spawner.spawn();
const response = await spawner.send('hello world\n');
console.log(response); // should echo "hello world"
await spawner.kill();
```
Manual test passes. Process spawns, receives input, echoes back, kills cleanly.

---

## Phase 2 — Claude Code Adapter
**Duration: 2 days**

### Goal
Wrap `adapter-utils` with Claude-specific knowledge. Knows exactly what flags to pass to the `claude` CLI, how to parse Claude's JSON output format, how to handle auth errors, and how to maintain session continuity between messages.

### Deliverable
Can send a message to Claude and get a real response back. No backend needed yet — test directly from a script.

### Files to Create

```
packages/adapter-utils/src/
├── adapters/
│   └── claude/
│       ├── claude-spawner.js     # Extends ProcessSpawner with Claude-specific config
│       ├── claude-parser.js      # Parses Claude's stream-json output format
│       ├── claude-session.js     # Manages --resume session IDs
│       ├── claude-errors.js      # Claude-specific errors (AuthRequired, MaxTurns)
│       ├── prompt-builder.js     # Builds the full prompt from parts
│       └── index.js              # Export: ClaudeAdapter (main class to use)
```

### Feature Checklist

**claude-spawner.js**
- [ ] `ClaudeSpawner` extends `ProcessSpawner`
- [ ] Default args: `["--no-browser", "--output-format", "stream-json", "--verbose"]`
- [ ] Optionally adds `--resume <sessionId>` if session exists
- [ ] Optionally adds `--model <modelId>` if specified
- [ ] Validates that `claude` binary exists before spawning (`which claude`)
- [ ] Sets correct env vars (inherits user's env so their auth works)
- [ ] Adds `--dangerously-skip-permissions` for headless mode

**claude-parser.js**
- [ ] `ClaudeParser` extends `BaseResponseParser`
- [ ] Parses Claude's stream-json format: `{ type: "assistant", message: { content: [...] } }`
- [ ] Extracts text from `content[0].text` path
- [ ] Detects completion: `type === "result"` in stream
- [ ] Extracts session ID from result: `result.session_id`
- [ ] Detects auth required: looks for OAuth URL patterns in output
- [ ] Detects `error_max_turns` signal
- [ ] Collects partial text chunks as stream arrives (streaming support)
- [ ] Returns `{ text, sessionId, done, error }` from each parsed line

**claude-session.js**
- [ ] `ClaudeSessionStore` — persists session IDs to `~/.iprep/sessions.json`
- [ ] `save(isoSessionId, claudeSessionId)` — maps your session ID to Claude's
- [ ] `load(isoSessionId)` — retrieves Claude session ID for resuming
- [ ] `delete(isoSessionId)` — removes session (on conversation end/error)
- [ ] `loadAll()` — returns all stored session mappings

**prompt-builder.js**
- [ ] `PromptBuilder` class
- [ ] `setSystemPrompt(text)` — the tutor's personality
- [ ] `setUserMessage(text)` — the user's actual message
- [ ] `addDocument(name, content)` — appends a document to context
- [ ] `setConversationHistory(messages)` — prepends recent turns for context
- [ ] `build()` — returns the complete prompt string to send via stdin
- [ ] Character limit awareness: truncates docs if prompt would exceed 100k chars

**claude-errors.js**
- [ ] `AuthRequiredError` — Claude needs `claude /login`, includes the URL
- [ ] `ClaudeNotFoundError` — `claude` command doesn't exist, includes install instructions
- [ ] `MaxTurnsError` — hit Claude's turn limit
- [ ] `SessionExpiredError` — tried to resume an expired session
- [ ] All extend `Error` with proper stack traces

**index.js — ClaudeAdapter (main class)**
- [ ] `ClaudeAdapter` class — the only thing consumers need to import
- [ ] `constructor({ tutorId, sessionId })` — sets up per-tutor adapter
- [ ] `async chat({ systemPrompt, message, documents, history })` — main method
  - Gets or creates a `ClaudeSpawner` for this session via `SessionManager`
  - Builds prompt via `PromptBuilder`
  - Sends to spawner
  - Parses response via `ClaudeParser`
  - Saves new session ID via `ClaudeSessionStore`
  - Returns `{ response: string, sessionId: string }`
- [ ] `async verify()` — checks if Claude is installed and authenticated
  - Runs `claude --print - --output-format stream-json` with "Respond with hello."
  - Returns `{ ok: boolean, error?: string }`
- [ ] `async endSession(sessionId)` — kills process, deletes session

### Done When
```javascript
// Test script: packages/adapter-utils/test-claude.js
const { ClaudeAdapter } = require('./src/adapters/claude');

const adapter = new ClaudeAdapter({ tutorId: 'test', sessionId: 'session-1' });

// Verify Claude is installed
const check = await adapter.verify();
console.log('Claude ready:', check.ok);

// Send a message
const result = await adapter.chat({
  systemPrompt: 'You are a helpful tutor. Be concise.',
  message: 'What is 2+2?',
  documents: [],
  history: []
});
console.log('Response:', result.response);    // Should print "4" or similar
console.log('Session ID:', result.sessionId); // Should have a Claude session ID

// Send follow-up (tests session continuity)
const result2 = await adapter.chat({
  systemPrompt: 'You are a helpful tutor.',
  message: 'What did I just ask?',
  documents: [],
  history: []
});
console.log('Follow-up:', result2.response); // Should reference "2+2"
```

---

## Phase 3 — CLI
**Duration: 2 days**

### Goal
Build the command-line interface that users interact with. The CLI is the entry point to the entire application. It sets up the user's home directory on first run, can verify prerequisites, and later (Phase 5) will start the backend server.

Right now the CLI is a shell — commands exist but most call placeholder functions. What must actually work: `init`, `doctor`, and the home directory setup.

### Deliverable
`iprep init` sets up `~/.iprep/`, `iprep doctor` tells you if Claude is installed and authenticated, `iprep --help` shows all commands clearly.

### Files to Create

```
apps/cli/
├── bin/
│   └── iprep.js                  # #!/usr/bin/env node — entry point
├── src/
│   ├── index.js                  # Registers all commands with Commander
│   ├── commands/
│   │   ├── init.js               # iprep init — first-time setup
│   │   ├── start.js              # iprep start — starts server + opens browser (Phase 5)
│   │   ├── stop.js               # iprep stop — kills server
│   │   ├── doctor.js             # iprep doctor — checks all prerequisites
│   │   ├── create-tutor.js       # iprep create-tutor — interactive tutor creation
│   │   ├── list-tutors.js        # iprep tutors — lists all tutors with stats
│   │   ├── chat.js               # iprep chat — terminal chat (bypass UI)
│   │   ├── export.js             # iprep export -- exports conversation
│   │   ├── backup.js             # iprep backup -- zips ~/.iprep/
│   │   └── status.js             # iprep status -- shows running server info
│   ├── utils/
│   │   ├── display.js            # chalk helpers: success(), error(), warn(), info(), header()
│   │   ├── spinner.js            # ora spinner wrapper: start(), succeed(), fail()
│   │   ├── prompts.js            # inquirer prompts: askTutorName(), confirm(), select()
│   │   └── home-dir.js           # HOME DIR: create ~/.iprep/ structure, seed tutors
│   └── services/
│       └── server-manager.js     # Start/stop Express server process (Phase 5)
└── package.json
```

### Feature Checklist

**bin/iprep.js**
- [ ] Shebang line: `#!/usr/bin/env node`
- [ ] Requires Node.js 18+ check at top, exits with clear error if older
- [ ] Calls `src/index.js`

**src/index.js**
- [ ] Commander.js program with name `iprep`, version from `package.json`
- [ ] Registers: `init`, `start`, `stop`, `doctor`, `create-tutor`, `tutors`, `chat`, `export`, `backup`, `status`
- [ ] Global `--debug` flag that enables verbose logging
- [ ] Catches unhandled rejections and prints user-friendly errors

**commands/init.js — `iprep init`**
- [ ] Checks if `~/.iprep/` already exists → if yes, asks "Already initialized. Re-run setup?"
- [ ] Creates directory structure:
  ```
  ~/.iprep/
  ├── db/                     (empty, database goes here)
  ├── tutors/                 (seed from package tutors/)
  ├── logs/
  └── config.json             (default config: port, theme, claudePath)
  ```
- [ ] Copies seed tutors from npm package's `tutors/` directory to `~/.iprep/tutors/`
- [ ] Creates `~/.iprep/config.json` with defaults:
  ```json
  { "port": 3000, "openBrowser": true, "theme": "dark", "logLevel": "info" }
  ```
- [ ] Runs `iprep doctor` check at end and shows results
- [ ] Total time: shows spinner during setup, success message at end

**commands/doctor.js — `iprep doctor`**
- [ ] Check 1: Node.js version ≥ 18 ✅/❌
- [ ] Check 2: `claude` binary found in PATH ✅/❌
  - If not found: prints exact install command
- [ ] Check 3: Claude is authenticated (runs `adapter.verify()`) ✅/❌
  - If not authenticated: prints `claude /login` instruction
- [ ] Check 4: `~/.iprep/` directory exists ✅/❌
  - If not: prints `iprep init` instruction
- [ ] Check 5: Database file accessible (read/write test) ✅/❌
- [ ] Check 6: At least one tutor configured ✅/❌
- [ ] Summary: "X/6 checks passed" with color coding
- [ ] `--fix` flag: attempts to auto-fix what it can (run init, create default tutors)

**commands/create-tutor.js — `iprep create-tutor`**
- [ ] Interactive prompts: name, description, personality (formal/friendly/tough)
- [ ] Creates `~/.iprep/tutors/<slugified-name>/` directory
- [ ] Writes `settings.md`, `skills.md`, `system-prompt.md` templates from user input
- [ ] Creates `documents/` subdirectory
- [ ] Prints success: "Tutor 'X' created. Edit settings at ~/.iprep/tutors/X/settings.md"

**commands/list-tutors.js — `iprep tutors`**
- [ ] Reads all directories in `~/.iprep/tutors/`
- [ ] For each: reads `settings.md` for name/description
- [ ] Shows table: Name | Description | Document Count | Conversation Count
- [ ] Highlights currently active tutor (from config or last used)

**commands/chat.js — `iprep chat <tutorId>`**
- [ ] Terminal-based chat loop (no UI needed for testing)
- [ ] Uses `readline` for input
- [ ] Calls `ClaudeAdapter` directly (bypasses HTTP entirely — great for Phase 3 testing)
- [ ] Shows "Thinking..." spinner while waiting for Claude
- [ ] Prints responses with word-wrapped formatting
- [ ] `/exit` or Ctrl+C to quit
- [ ] `/switch <tutorId>` to change tutor mid-session
- [ ] Saves conversation to database via db package (once Phase 4 is done)

**utils/home-dir.js**
- [ ] `ensureHomeDirExists()` — idempotent, creates `~/.iprep/` structure if missing
- [ ] `getTutorsDir()` — returns `~/.iprep/tutors/`
- [ ] `getDbPath()` — returns `~/.iprep/db/iprep.db`
- [ ] `getConfigPath()` — returns `~/.iprep/config.json`
- [ ] `readConfig()` — parses config.json, returns defaults for missing keys
- [ ] `writeConfig(updates)` — merges updates into config.json
- [ ] `seedTutors()` — copies from npm package `tutors/` → `~/.iprep/tutors/` (skip existing)

**utils/display.js**
- [ ] `success(msg)` — green ✓ prefix
- [ ] `error(msg)` — red ✗ prefix
- [ ] `warn(msg)` — yellow ⚠ prefix
- [ ] `info(msg)` — blue ℹ prefix
- [ ] `header(title)` — bold, underlined section header
- [ ] `table(headers, rows)` — formatted table output

### Done When
```bash
iprep --help            # Shows all commands
iprep init              # Creates ~/.iprep/ structure, copies tutors
iprep doctor            # Shows pass/fail for all 6 checks
iprep create-tutor      # Interactive, creates ~/.iprep/tutors/my-tutor/
iprep tutors            # Lists tutors in a table
iprep chat english-coach  # Can have a terminal conversation with Claude
```

---

## Phase 4 — Database Layer
**Duration: 2 days**

### Goal
Set up Prisma ORM with SQLite, define the per-tutor schema, and build query functions that the backend will use. The database must auto-migrate on first startup — no manual `prisma migrate` step for the end user.

### Deliverable
Can create conversations, save messages, and retrieve history for any tutor. Database file auto-created at `~/.iprep/db/iprep.db` on first access.

### Files to Create

```
packages/db/
├── package.json                       # name: @iprep/db
├── prisma/
│   ├── schema.prisma                  # Data model
│   └── migrations/                    # Auto-generated migrations
└── src/
    ├── client.js                      # Prisma client singleton, points to ~/.iprep/db/iprep.db
    ├── migrate.js                     # Programmatic migration runner (for startup)
    ├── queries/
    │   ├── tutors.js                  # Tutor CRUD
    │   ├── conversations.js           # Conversation CRUD
    │   ├── messages.js                # Message CRUD
    │   ├── sessions.js                # Session management
    │   └── documents.js               # Document metadata CRUD
    └── index.js                       # Export all query modules + client
```

### Feature Checklist

**prisma/schema.prisma**
- [ ] `Tutor` model: `id` (slug), `name`, `description`, `createdAt`
- [ ] `Session` model: `id`, `userId`, `tutorId`, `claudeSessionId`, `createdAt`, `lastActiveAt`
- [ ] `Conversation` model: `id`, `userId`, `tutorId`, `sessionId`, `title`, `createdAt`, `updatedAt`
- [ ] `Message` model: `id`, `conversationId`, `tutorId`, `role` (user/assistant), `content`, `timestamp`
- [ ] `Document` model: `id`, `tutorId`, `originalName`, `storagePath`, `markdownPath`, `fileSize`, `mimeType`, `uploadedAt`
- [ ] All models use `@@index` on `tutorId` for fast per-tutor queries
- [ ] `DATABASE_URL` env variable for path override

**src/client.js**
- [ ] Creates Prisma client with dynamic `DATABASE_URL` pointing to `~/.iprep/db/iprep.db`
- [ ] Singleton: always returns same client instance
- [ ] Graceful disconnect: `client.$disconnect()` on process exit

**src/migrate.js**
- [ ] `runMigrations()` — runs `prisma migrate deploy` programmatically
- [ ] Called at server startup (Phase 5) — user never runs this manually
- [ ] Idempotent: safe to call on every startup
- [ ] Returns `{ success, migrationsApplied }` 

**queries/conversations.js**
- [ ] `createConversation({ userId, tutorId, sessionId, title })`
- [ ] `getConversation(id)` — with messages
- [ ] `listConversations({ tutorId, userId, limit, offset })` — paginated
- [ ] `updateConversationTitle(id, title)`
- [ ] `deleteConversation(id)` — cascades to messages
- [ ] `getOrCreateConversation({ userId, tutorId, sessionId })` — upsert pattern

**queries/messages.js**
- [ ] `createMessage({ conversationId, tutorId, role, content })`
- [ ] `getMessages(conversationId)` — ordered by timestamp asc
- [ ] `getRecentMessages(conversationId, limit)` — last N messages for context injection
- [ ] `deleteMessages(conversationId)` — clear conversation

**queries/sessions.js**
- [ ] `createSession({ userId, tutorId, claudeSessionId })`
- [ ] `getSession({ userId, tutorId })` — get active session for user+tutor
- [ ] `updateClaudeSessionId(sessionId, claudeSessionId)` — update when Claude gives new session
- [ ] `touchSession(sessionId)` — update `lastActiveAt`
- [ ] `deleteSession(sessionId)` — end session

**queries/tutors.js**
- [ ] `upsertTutor({ id, name, description })` — sync from filesystem on startup
- [ ] `listTutors()` — all tutors with message/document counts
- [ ] `getTutor(id)`

**queries/documents.js**
- [ ] `createDocument({ tutorId, originalName, storagePath, markdownPath, fileSize, mimeType })`
- [ ] `listDocuments(tutorId)`
- [ ] `getDocument(id)`
- [ ] `deleteDocument(id)` — also deletes files from filesystem

### Done When
```javascript
// Test script: packages/db/test-manual.js
const { conversations, messages, db } = require('./src');

await db.migrate.runMigrations();

const conv = await conversations.createConversation({
  userId: 'user-1', tutorId: 'english-coach', sessionId: 'sess-1', title: 'Test'
});
console.log('Created:', conv.id);

await messages.createMessage({
  conversationId: conv.id, tutorId: 'english-coach', role: 'user', content: 'Hello'
});

const msgs = await messages.getMessages(conv.id);
console.log('Messages:', msgs.length); // 1
```

---

## Phase 5 — Backend (Express Server)
**Duration: 3 days**

### Goal
Build the Express server that ties everything together. It uses the Claude adapter (Phase 2) to talk to Claude, the database (Phase 4) to persist history, and exposes REST endpoints the frontend (Phase 7) will call.

After this phase, you can test the full chat flow via `curl` or Postman — no UI needed yet.

### Deliverable
`POST /api/chat` receives a message, gets a response from Claude, saves it to the database, and returns the response. All other CRUD endpoints work. Server starts via `iprep start`.

### Files to Create

```
apps/server/
├── package.json
└── src/
    ├── index.js                       # Entry: starts server, runs migrations, sets up shutdown
    ├── app.js                         # Express app factory: registers middleware + routes
    ├── routes/
    │   ├── chat.js                    # POST /api/chat
    │   ├── tutors.js                  # GET /api/tutors, GET /api/tutors/:id
    │   ├── conversations.js           # GET /api/conversations, DELETE /:id
    │   ├── messages.js                # GET /api/conversations/:id/messages
    │   ├── documents.js               # GET/POST/DELETE /api/tutors/:id/documents
    │   ├── sessions.js                # POST /api/sessions/end
    │   └── health.js                  # GET /health
    ├── services/
    │   ├── chat-service.js            # Orchestrates: tutor config → Claude → DB
    │   ├── tutor-service.js           # Loads tutor .md files, syncs to DB
    │   ├── session-service.js         # Manages per-user/tutor Claude sessions
    │   ├── conversation-service.js    # Conversation CRUD orchestration
    │   └── document-service.js        # Upload, convert, store documents
    ├── middleware/
    │   ├── error-handler.js           # Global error handler (catches everything)
    │   ├── request-logger.js          # Logs method, path, duration, status
    │   └── validate.js                # Zod or manual schema validation
    └── utils/
        ├── env.js                     # Reads .env + ~/.iprep/config.json, validates
        └── tutor-loader.js            # Reads tutor .md files from ~/.iprep/tutors/
```

### Feature Checklist

**src/index.js**
- [ ] Reads port from config (default 3000)
- [ ] Calls `runMigrations()` before starting (from `@iprep/db`)
- [ ] Calls `tutor-service.syncTutors()` — syncs filesystem tutors to DB
- [ ] Starts Express server on configured port
- [ ] Logs: `"iprep server running at http://localhost:3000"`
- [ ] On `SIGTERM`/`SIGINT`: calls `sessionManager.destroyAll()`, then exits
- [ ] Serves static `dist/` folder (pre-built React — empty directory for now, filled in Phase 9)

**routes/chat.js — POST /api/chat**
- [ ] Request body: `{ userId, tutorId, message, conversationId? }`
- [ ] Validates all required fields
- [ ] Calls `ChatService.sendMessage()`
- [ ] Response: `{ response, conversationId, messageId, tutorId, sessionId }`
- [ ] Error: 400 if validation fails, 500 with message if Claude fails
- [ ] Response time header: `X-Response-Time: <ms>`

**services/chat-service.js — the orchestrator**
- [ ] `sendMessage({ userId, tutorId, message, conversationId })`:
  1. Load tutor config via `TutorService.getTutor(tutorId)`
  2. Get or create conversation via `conversations.getOrCreate()`
  3. Get recent message history (last 10) via `messages.getRecentMessages()`
  4. Get or create Claude session via `SessionService.getOrCreate(userId, tutorId)`
  5. Load tutor documents (markdown versions) via `DocumentService.getDocumentsForContext(tutorId)`
  6. Build prompt via `PromptBuilder` (system prompt + history + documents + user message)
  7. Call `ClaudeAdapter.chat()`
  8. Save user message to DB
  9. Save Claude response to DB
  10. Update session's `claudeSessionId` if changed
  11. Return `{ response, conversationId, sessionId }`
- [ ] If Claude adapter throws `AuthRequiredError`: return 503 with helpful message
- [ ] If Claude adapter throws `ClaudeNotFoundError`: return 503 with install instructions

**services/tutor-service.js**
- [ ] `syncTutors()` — reads `~/.iprep/tutors/*/`, creates/updates DB records
- [ ] `getTutor(tutorId)` — returns tutor with parsed MD files:
  ```javascript
  {
    id, name, description,
    systemPrompt: "...",   // contents of system-prompt.md
    skills: "...",         // contents of skills.md
    settings: { ... }      // parsed settings.md
  }
  ```
- [ ] `listTutors()` — all tutors with document/conversation counts
- [ ] `getTutorDir(tutorId)` — path to `~/.iprep/tutors/{tutorId}/`

**services/session-service.js**
- [ ] `getOrCreate(userId, tutorId)` — returns active session or creates new one
- [ ] `endSession(userId, tutorId)` — destroys Claude process + removes session from DB
- [ ] `getActiveSessionCount()` — for health endpoint

**routes/tutors.js**
- [ ] `GET /api/tutors` — list all tutors with stats
- [ ] `GET /api/tutors/:id` — single tutor detail

**routes/conversations.js**
- [ ] `GET /api/conversations?tutorId=&userId=` — paginated list
- [ ] `GET /api/conversations/:id` — single conversation with messages
- [ ] `DELETE /api/conversations/:id` — delete conversation + messages

**routes/documents.js**
- [ ] `GET /api/tutors/:tutorId/documents` — list documents for tutor
- [ ] `POST /api/tutors/:tutorId/documents` — upload (multipart/form-data) — Phase 8
- [ ] `DELETE /api/documents/:id` — delete document + files

**routes/health.js**
- [ ] `GET /health` — returns `{ status: "ok", uptime, activeSessionCount, version }`
- [ ] Used by `iprep status` command and monitoring

**middleware/error-handler.js**
- [ ] Catches all errors thrown in route handlers
- [ ] Maps known error types to HTTP status codes
- [ ] In dev: includes stack trace in response
- [ ] In prod: only returns `{ error: "Internal server error" }`
- [ ] Always logs full error to file

### Done When
```bash
# Start server
iprep start

# Test health
curl http://localhost:3000/health
# → { "status": "ok" }

# Test chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"u1","tutorId":"english-coach","message":"What is a noun?"}'
# → { "response": "A noun is...", "conversationId": 1 }

# Test history
curl http://localhost:3000/api/conversations?tutorId=english-coach&userId=u1
# → [{ "id": 1, "title": "...", "messageCount": 2 }]
```

---

## Phase 6 — Basic Tutors Content
**Duration: 1 day**

### Goal
Write the actual tutor configurations. These are the Markdown files that define each tutor's personality, skills, and system prompt. This is your content — done right, it's what makes iprep actually useful, not just technically working.

### Deliverable
Three complete, high-quality tutors that give noticeably different experiences.

### Files to Create

```
tutors/
├── english-coach/
│   ├── settings.md
│   ├── skills.md
│   └── system-prompt.md
│
├── interview-prep/
│   ├── settings.md
│   ├── skills.md
│   └── system-prompt.md
│
└── client-communication/
    ├── settings.md
    ├── skills.md
    └── system-prompt.md
```

### Feature Checklist

**english-coach**
- [ ] `settings.md`: Friendly, patient, encouraging tone. Difficulty: adjusts to user. Goal: fluency + grammar confidence.
- [ ] `skills.md`: Grammar correction, vocabulary building, sentence structure, idioms, pronunciation tips, writing feedback.
- [ ] `system-prompt.md`: Always correct gently. Give examples. Explain the rule, not just the correction. Ask follow-up practice questions.

**interview-prep**
- [ ] `settings.md`: Professional, challenging but fair. Simulates a real interviewer. Does not give answers away easily.
- [ ] `skills.md`: Behavioral questions (STAR method), technical screening, system design basics, salary negotiation, follow-up questions.
- [ ] `system-prompt.md`: Act as an interviewer. Ask one question at a time. After user answers, provide structured feedback. Score on clarity, structure, relevance.

**client-communication**
- [ ] `settings.md`: Business-formal tone. Focused on professional written and spoken communication.
- [ ] `skills.md`: Email writing, meeting facilitation, presenting ideas, handling difficult clients, status updates, escalations.
- [ ] `system-prompt.md`: Help user communicate professionally. Rewrite their drafts to be clearer and more professional. Explain why each change improves communication.

### Done When
```bash
iprep chat english-coach
# → Distinct personality: warm, explains grammar rules
iprep chat interview-prep  
# → Acts like a real interviewer, asks questions, gives feedback
iprep chat client-communication
# → Helps rewrite emails, gives professional communication advice
```
Each tutor feels notably different from the others.

---

## Phase 7 — Frontend (React UI)
**Duration: 4 days**

### Goal
Build the web interface. Users open `http://localhost:3000` and see a Teams-style sidebar, a chat window, and a header. This connects to the backend from Phase 5.

### Deliverable
Can switch between tutors, send messages, see responses, and see conversation history — all in the browser.

### Files to Create

```
apps/web/
├── index.html
├── vite.config.js                        # Proxy /api → localhost:3000 in dev
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── components/
    │   ├── Layout/
    │   │   ├── MainLayout.jsx            # 3-column: sidebar | chat | (future: docs panel)
    │   │   └── Header.jsx                # Tutor name, status, settings icon
    │   ├── Sidebar/
    │   │   ├── TutorSidebar.jsx          # Left icon list
    │   │   ├── TutorIcon.jsx             # Single tutor button with avatar + badge
    │   │   └── AddTutorButton.jsx        # + icon at bottom
    │   ├── Chat/
    │   │   ├── ChatWindow.jsx            # Scrollable message list
    │   │   ├── MessageBubble.jsx         # User vs assistant bubble, markdown support
    │   │   ├── MessageInput.jsx          # Text input + send button + Shift+Enter
    │   │   ├── TypingIndicator.jsx       # Animated dots while Claude is thinking
    │   │   └── EmptyState.jsx            # First message prompt per tutor
    │   └── Common/
    │       ├── Spinner.jsx
    │       ├── Toast.jsx                 # Success/error notifications
    │       └── MarkdownRenderer.jsx      # Renders Claude's markdown responses
    ├── hooks/
    │   ├── useChat.js                    # sendMessage(), messages state, loading state
    │   ├── useTutors.js                  # tutors list, activeTutor, switchTutor()
    │   └── useApi.js                     # fetch wrapper with error handling
    ├── context/
    │   └── AppContext.jsx                # userId (localStorage), activeTutorId
    ├── services/
    │   └── api.js                        # All API calls: chat(), getTutors(), getHistory()
    └── styles/
        ├── index.css                     # Global: CSS reset, fonts, variables
        ├── layout.css                    # 3-column grid layout
        ├── sidebar.css                   # Teams-style sidebar
        └── chat.css                      # Chat bubbles, input area
```

### Feature Checklist

**Layout**
- [ ] 3-column layout: narrow sidebar (60px icons) | chat area (flex-grow) | [empty for Phase 8 docs panel]
- [ ] Sidebar is fixed, chat area scrolls
- [ ] Header shows active tutor name + indicator (online/thinking)
- [ ] Responsive: on mobile, sidebar collapses to bottom tab bar

**TutorSidebar**
- [ ] Shows one icon per tutor (emoji or initials)
- [ ] Active tutor highlighted (different background)
- [ ] Hover tooltip shows tutor name
- [ ] Badge showing document count (from API)
- [ ] Click switches active tutor and clears input area

**ChatWindow**
- [ ] Renders all messages for active conversation
- [ ] User messages: right-aligned, blue bubble
- [ ] Assistant messages: left-aligned, dark bubble
- [ ] Markdown rendered in assistant messages (bold, code blocks, lists)
- [ ] Auto-scrolls to bottom on new message
- [ ] Shows `TypingIndicator` while `loading === true`
- [ ] `EmptyState` shown when no messages ("Start chatting with [Tutor Name]")

**MessageInput**
- [ ] Textarea that grows with content (max 4 rows)
- [ ] Send button (or Enter key) submits
- [ ] Shift+Enter inserts newline
- [ ] Disabled + shows spinner while response is loading
- [ ] Clears after send
- [ ] Shows character count near limit

**hooks/useChat.js**
- [ ] `sendMessage(text)` — POST /api/chat, updates messages state
- [ ] `messages` — array of `{ id, role, content, timestamp }`
- [ ] `loading` — boolean
- [ ] `error` — error string or null
- [ ] Loads history on tutor switch: GET /api/conversations?tutorId=...
- [ ] Generates `userId` once and stores in localStorage

**hooks/useTutors.js**
- [ ] `tutors` — array from GET /api/tutors
- [ ] `activeTutor` — currently selected tutor object
- [ ] `switchTutor(tutorId)` — updates active, triggers history load

**Vite proxy (vite.config.js)**
- [ ] All `/api` requests proxied to `http://localhost:3000` in dev
- [ ] No CORS issues in dev

### Done When
```
Open http://localhost:5173 (or :3000 in prod)
→ See tutor sidebar with 3 tutors
→ Click "Interview Prep" → header updates
→ Type "Tell me about yourself" → see TypingIndicator → see response appear
→ Click "English Coach" → see different empty state
→ Refresh page → conversation history reloads
```

---

## Phase 8 — Document Management
**Duration: 2 days**

### Goal
Let users upload PDFs and Word docs that Claude can reference in conversations. Each document belongs to one tutor and is converted to Markdown using markitdown.

### Deliverable
Can upload a PDF resume, have it converted to Markdown, and ask the Interview Prep tutor "What's strong about my resume?"

### Files to Create

```
packages/document-converter/
└── src/
    ├── converter.js              # markitdown wrapper: converts file → markdown string
    ├── validator.js              # Checks file type, size limits
    └── index.js

apps/server/src/services/
└── document-service.js           # Upload, convert, store, list, delete

apps/web/src/components/
└── Documents/
    ├── DocumentPanel.jsx         # Side panel showing doc list + upload area
    ├── DocumentCard.jsx          # Single document: name, size, date, delete button
    └── UploadZone.jsx            # Drag & drop or click-to-upload area
```

### Feature Checklist

**document-converter**
- [ ] Wraps `markitdown` Python library (called via `child_process.exec`)
- [ ] Supports: `.pdf`, `.docx`, `.xlsx`, `.pptx`, `.txt`, `.md`
- [ ] `convert(filePath)` → returns markdown string
- [ ] `validateFile(filePath, mimeType)` → checks extension + size (max 20MB)
- [ ] Handles conversion errors gracefully (returns partial content with warning)

**document-service.js**
- [ ] `upload({ tutorId, file })`:
  1. Validates file via `converter.validateFile()`
  2. Saves original to `~/.iprep/tutors/{tutorId}/documents/originals/`
  3. Converts to Markdown via `converter.convert()`
  4. Saves Markdown to `~/.iprep/tutors/{tutorId}/documents/markdown/`
  5. Creates DB record via `queries.documents.createDocument()`
  6. Returns document metadata
- [ ] `listDocuments(tutorId)` — from DB with file sizes
- [ ] `deleteDocument(documentId)` — removes DB record + both files
- [ ] `getDocumentsForContext(tutorId)` — returns array of `{ name, content }` for chat injection
  - Returns up to 5 most recent documents (to stay within token limits)
  - Truncates each document at 5000 chars if needed

**POST /api/tutors/:tutorId/documents**
- [ ] Accepts `multipart/form-data` with `file` field
- [ ] Uses `multer` for file upload handling
- [ ] Temp file in `os.tmpdir()`, moved after conversion
- [ ] Returns created document metadata

**DocumentPanel (frontend)**
- [ ] Toggle button in header to open/close panel
- [ ] Lists all documents for active tutor
- [ ] Each document shows: filename, file size, upload date
- [ ] Delete button with confirmation
- [ ] Upload area: drag-and-drop + click to browse
- [ ] Upload progress indicator
- [ ] Success/error toast after upload
- [ ] Panel updates immediately after upload without page refresh

### Done When
```
Upload a PDF to Interview Prep tutor
→ See it appear in document panel
→ Ask "What's my most relevant skill based on my resume?"
→ Claude references the resume content in its answer
```

---

## Phase 9 — Build Pipeline + npm Publish
**Duration: 1 day**

### Goal
Wire the frontend build into the npm package so that `iprep start` serves the React app from Express — no Vite dev server needed by the end user.

### Deliverable
`npm install -g iprep && iprep start` works. Opens browser. Full app works. No developer tools required by the end user.

### Files to Create / Modify

```
iprep/
├── scripts/
│   ├── build.sh                  # Build React → copy to server/dist
│   └── prepublish-check.sh       # Verify dist/ exists before publish
├── .npmignore                    # Exclude: frontend/src, *.test.js, docs/
└── package.json                  # Add prepublishOnly, build scripts
```

### Feature Checklist

**Build pipeline**
- [ ] `npm run build` runs: `cd apps/web && vite build && cp -r dist ../../apps/server/dist`
- [ ] `prepublishOnly` script calls `npm run build` + runs `prepublish-check.sh`
- [ ] `prepublish-check.sh` verifies `apps/server/dist/index.html` exists
- [ ] `.npmignore` excludes frontend source (but includes server/dist)

**Express static serving (add to server/index.js)**
- [ ] `app.use(express.static(path.join(__dirname, 'dist')))` before API routes
- [ ] Catch-all `app.get('*', sendIndex)` after API routes for React Router
- [ ] In dev mode (NODE_ENV=development): skip static serving, let Vite dev server handle it

**iprep start command (complete it from Phase 3 placeholder)**
- [ ] Calls `server-manager.js` which runs the server
- [ ] Wait for `:3000` to respond to `/health` before opening browser
- [ ] Opens `http://localhost:3000` in default browser
- [ ] Prints: `"iprep running at http://localhost:3000"` with chalk
- [ ] `--no-browser` flag to skip opening browser
- [ ] `--port 8080` flag to override port

**Test install**
- [ ] `npm pack` — creates tarball, inspect contents include `dist/`
- [ ] Install from tarball: `npm install -g ./iprep-1.0.0.tgz`
- [ ] `iprep start` works without any dev dependencies
- [ ] `iprep doctor` passes all checks on a clean machine

### Done When
```bash
npm install -g iprep     # installs from npm
iprep init               # sets up ~/.iprep/
iprep doctor             # all checks pass
iprep start              # browser opens, full app works
```

---

## Phase 10 — TTS + Avatar
**Duration: 2 days**

### Goal
Add the talking avatar that animates as Claude's response is read aloud. This is the key visual differentiator of iprep — users see a face, hear a voice, and feel like they're actually practicing with a tutor.

### Deliverable
After Claude responds, text is spoken aloud by the browser TTS engine. An animated avatar shows mouth movement while speaking. User can mute or stop speaking.

### Files to Create

```
apps/web/src/
├── components/
│   └── Avatar/
│       ├── Avatar.jsx              # Container: image + animated mouth overlay
│       ├── AvatarMouth.jsx         # CSS-animated mouth SVG
│       └── AvatarControls.jsx      # Mute, stop, replay buttons
├── hooks/
│   ├── useTTS.js                   # Web Speech API wrapper
│   └── useAvatarSync.js            # Syncs mouth animation to TTS events
└── assets/
    └── avatars/
        ├── english-coach.png       # Tutor face images (neutral expression)
        ├── interview-prep.png
        └── client-communication.png
```

### Feature Checklist

**useTTS.js**
- [ ] Uses browser's `window.speechSynthesis` API (zero dependencies, works offline)
- [ ] `speak(text)` — synthesizes text, returns promise resolving when done
- [ ] `stop()` — stops current speech
- [ ] `isSpeaking` — reactive boolean state
- [ ] Voice selection: prefers a natural-sounding voice, falls back to default
- [ ] Rate + pitch config from `~/.iprep/config.json` (user adjustable)
- [ ] `onBoundary` event: fires on each word boundary (used for mouth sync)
- [ ] Graceful degradation: if TTS not supported, logs warning, app still works silently

**useAvatarSync.js**
- [ ] Subscribes to TTS `onBoundary` events
- [ ] Maps speech timing to mouth animation states: `closed → open → closed`
- [ ] Returns `mouthState: 'closed' | 'half' | 'open'` that Avatar uses for animation
- [ ] Smooth transitions: CSS transitions handle interpolation

**Avatar.jsx**
- [ ] Shows tutor image (from `assets/avatars/{tutorId}.png`)
- [ ] Overlays `AvatarMouth` component positioned at mouth area
- [ ] Switches avatar image based on active tutor
- [ ] Falls back to colored circle with initials if image missing

**AvatarMouth.jsx**
- [ ] SVG mouth shape that changes based on `mouthState` prop
- [ ] CSS animation classes: `.mouth-closed`, `.mouth-half`, `.mouth-open`
- [ ] Smooth CSS transitions between states (100ms ease)
- [ ] Optional: subtle head bob animation while speaking

**AvatarControls.jsx**
- [ ] Mute toggle button (⊘ icon) — stops TTS, disables auto-play
- [ ] Stop button — stops current speech
- [ ] Replay button — re-reads last response
- [ ] Mute state persisted in localStorage

**Integration into ChatWindow**
- [ ] When new assistant message arrives: `useTTS.speak(message.content)` auto-fires
- [ ] If muted: skip auto-speak
- [ ] Click any assistant message bubble to replay its TTS
- [ ] Strip markdown before TTS: `**bold**` → `bold`, `` `code` `` → `code`

### Done When
```
Ask "What is a gerund?"
→ Claude responds in chat
→ Avatar face appears, mouth starts moving
→ Browser TTS reads the response aloud
→ Mouth stops moving when speech ends
→ Click mute → next response is silent
→ Click message bubble → re-reads that message
```

---

## Phase 11 — Polish, Export & Settings
**Duration: 1.5 days**

### Goal
Round off rough edges before shipping. Add conversation export, settings panel, and ensure error states are handled gracefully everywhere.

### Deliverable
Ready-to-publish v1.0.0. All features work reliably, errors show friendly messages, user can customize settings, and can export their conversations.

### Feature Checklist

**Export**
- [ ] `iprep export <tutorId>` — exports all conversations to Markdown files in `./exports/`
- [ ] `GET /api/conversations/:id/export?format=markdown|json` endpoint
- [ ] Export button on conversation (in frontend)
- [ ] Markdown format: includes timestamp, tutor name, all messages formatted cleanly

**Settings Panel (frontend)**
- [ ] Settings icon in header opens modal
- [ ] Options: TTS voice, TTS rate, TTS enabled/disabled, theme (dark/light)
- [ ] Changes persist to `~/.iprep/config.json` via `POST /api/settings`
- [ ] Theme switch (dark/light) applies immediately via CSS variables

**Error handling polish**
- [ ] Claude not running → friendly banner: "Claude isn't responding. Run `iprep doctor`."
- [ ] Network error → retry button in chat
- [ ] Upload too large → "File exceeds 20MB limit"
- [ ] Unknown tutor → 404 page with link back to home
- [ ] Server not started → frontend shows "Server not running. Run `iprep start`."

**iprep backup command**
- [ ] `iprep backup` — creates `~/.iprep/backups/iprep-backup-{date}.zip`
- [ ] Includes: database, tutors (configs + documents), config.json
- [ ] Excludes: node_modules, logs
- [ ] Print: "Backup saved to ~/.iprep/backups/iprep-backup-2026-04-14.zip"

**iprep restore command**
- [ ] `iprep restore <backup-file>` — extracts backup, overwrites `~/.iprep/`
- [ ] Asks confirmation before overwriting

**Final pre-publish checklist**
- [ ] `iprep doctor` passes on fresh machine
- [ ] `npm pack && npm install -g ./iprep-*.tgz` works
- [ ] App works with no `.env` file (all defaults kick in)
- [ ] No `console.log` statements left in production code (use logger)
- [ ] `README.md` in repo root: install instructions + quickstart
- [ ] CHANGELOG for v1.0.0

### Done When
```bash
# Fresh machine, nothing installed
npm install -g iprep
iprep init
iprep doctor              # all green
iprep start               # browser opens, full app
# Use the app for 10 minutes
iprep backup              # creates backup zip
iprep export english-coach  # exports conversations to markdown
```

---

## Phase Summary

| Phase | Focus | Duration | Deliverable |
|---|---|---|---|
| **0** | Monorepo scaffold | 0.5 day | `pnpm install` works, workspace resolves |
| **1** | adapter-utils | 2 days | Can spawn any process, send input, get output |
| **2** | Claude adapter | 2 days | Can chat with Claude from a script |
| **3** | CLI | 2 days | `iprep init`, `iprep doctor`, `iprep chat` work |
| **4** | Database | 2 days | Can save/load conversations per tutor |
| **5** | Backend | 3 days | `POST /api/chat` returns Claude response |
| **6** | Tutor content | 1 day | 3 distinct, high-quality tutors |
| **7** | Frontend | 4 days | Full chat UI in browser |
| **8** | Documents | 2 days | Upload PDF, Claude references it |
| **9** | Build + npm | 1 day | `npm install -g iprep && iprep start` works |
| **10** | TTS + Avatar | 2 days | Avatar speaks responses aloud |
| **11** | Polish + export | 1.5 days | v1.0.0 ready to publish |
| **Total** | | **~23 days** | Shippable open source npm package |

## Build Order Rule

Always finish the current phase's "Done When" test before starting the next phase.

The phases are ordered for a reason:
- Phases 1-2 are pure Node.js with no framework — easiest to test, easiest to debug.
- Phase 3 (CLI) lets you test Phase 2 (Claude adapter) without needing any server.
- Phase 4 (database) is needed before Phase 5 (backend) can save anything.
- Phase 5 (backend) must work via curl before you build Phase 7 (frontend).
- Phase 9 (build pipeline) is last in the infra chain — only do this after the frontend is complete.
- Phases 10-11 (TTS, polish) are additive — the core app already works without them.
