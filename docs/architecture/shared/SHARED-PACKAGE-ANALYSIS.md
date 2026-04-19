# `@iprep/shared` — Package Analysis

Comparison of the old JavaScript package (`old-code/iprep-npm/packages/shared`) against the
current TypeScript package (`iprep/packages/shared`). Use this to identify what still needs to
be ported, what has been superseded, and what to skip entirely.

---

## Old Package Overview

| Property     | Value                         |
| ------------ | ----------------------------- |
| Package name | `@iprep/shared`               |
| Version      | `1.1.4`                       |
| Language     | Plain JavaScript (ES modules) |
| Dependencies | None                          |
| Build step   | None — imported directly      |

**Entry point:** `src/index.js`

```
src/
├── index.js
├── paths.js
├── constants/
│   ├── api.js
│   ├── config.js
│   └── tutors.js
└── utils/
    ├── formatters.js
    ├── logger.js
    └── validation.js
```

---

## File-by-File Breakdown

### `src/constants/api.js`

| Export                       | Type     | Value / Notes          |
| ---------------------------- | -------- | ---------------------- |
| `API_BASE`                   | `string` | `'/api'`               |
| `ENDPOINTS.HEALTH`           | `string` | `'/health'`            |
| `ENDPOINTS.TUTORS`           | `string` | `'/api/tutors'`        |
| `ENDPOINTS.CHAT`             | `string` | `'/api/chat'`          |
| `ENDPOINTS.CONVERSATIONS`    | `string` | `'/api/conversations'` |
| `ENDPOINTS.DOCUMENTS`        | `string` | `'/api/documents'`     |
| `ENDPOINTS.EXPORT`           | `string` | `'/api/export'`        |
| `HTTP_STATUS.OK`             | `number` | `200`                  |
| `HTTP_STATUS.CREATED`        | `number` | `201`                  |
| `HTTP_STATUS.BAD_REQUEST`    | `number` | `400`                  |
| `HTTP_STATUS.UNAUTHORIZED`   | `number` | `401`                  |
| `HTTP_STATUS.NOT_FOUND`      | `number` | `404`                  |
| `HTTP_STATUS.INTERNAL_ERROR` | `number` | `500`                  |

**Status in new package:** Not yet ported. Endpoints have changed (old used `/api/chat`, new uses `/sessions`). HTTP_STATUS codes are reusable.

---

### `src/constants/config.js`

| Export                             | Type     | Value / Notes                |
| ---------------------------------- | -------- | ---------------------------- |
| `SERVER_PORT`                      | `number` | `process.env.PORT \|\| 3000` |
| `WEB_PORT`                         | `number` | `5173`                       |
| `ROLES.USER`                       | `string` | `'user'`                     |
| `ROLES.ASSISTANT`                  | `string` | `'assistant'`                |
| `ROLES.SYSTEM`                     | `string` | `'system'`                   |
| `CONVERSION_STATUS.PENDING`        | `string` | `'pending'`                  |
| `CONVERSION_STATUS.SUCCESS`        | `string` | `'success'`                  |
| `CONVERSION_STATUS.FAILED`         | `string` | `'failed'`                   |
| `LOG_LEVELS.ERROR/WARN/INFO/DEBUG` | `string` | Log level strings            |
| `MAX_DOCS_PER_TUTOR`               | `number` | `10`                         |
| `MAX_MESSAGE_LENGTH`               | `number` | `10000`                      |
| `CLAUDE_TIMEOUT_MS`                | `number` | `60000`                      |

**Status in new package:** Partially covered. `DEFAULT_PORT` (3000), `DEFAULT_FRONTEND_PORT` (5173) exist. `MAX_MESSAGE_LENGTH`, `MAX_DOCS_PER_TUTOR`, `CLAUDE_TIMEOUT_MS`, `ROLES` still need to be added to `constants/index.ts`.

---

### `src/constants/tutors.js`

| Export           | Type       | Notes                                                         |
| ---------------- | ---------- | ------------------------------------------------------------- |
| `DEFAULT_TUTORS` | `array`    | 3 tutors: English Coach, Interview Prep, Client Communication |
| `TUTOR_IDS`      | `string[]` | `['english-coach', 'interview-prep', 'client-communication']` |

Each tutor object shape:

```ts
{
  id: string; // kebab-case slug
  name: string; // display name
  description: string;
  icon: string; // emoji
  color: string; // hex color
}
```

**Status in new package:** `TUTOR_SLUGS = ['alex', 'priya', 'morgan']` exists but is a different set of tutors. The old `DEFAULT_TUTORS` array with full metadata is not ported — decide whether the new tutors need a similar metadata object.

---

### `src/paths.js`

| Export                         | Type                     | Notes                               |
| ------------------------------ | ------------------------ | ----------------------------------- |
| `IPREP_HOME`                   | `string`                 | `~/.iprep/`                         |
| `IprepPaths.root`              | `string`                 | `~/.iprep/`                         |
| `IprepPaths.aitutors`          | `string`                 | `~/.iprep/aitutors/`                |
| `IprepPaths.database`          | `string`                 | `~/.iprep/database/`                |
| `IprepPaths.dbFile`            | `string`                 | `~/.iprep/database/iprep.db`        |
| `IprepPaths.docs`              | `string`                 | `~/.iprep/docs/`                    |
| `IprepPaths.skills`            | `string`                 | `~/.iprep/skills/`                  |
| `IprepPaths.tutor(id)`         | `(id: string) => string` | `~/.iprep/aitutors/{id}/`           |
| `IprepPaths.documents(id)`     | `(id: string) => string` | `~/.iprep/aitutors/{id}/documents/` |
| `IprepPaths.tutorSkills(id)`   | `(id: string) => string` | `~/.iprep/aitutors/{id}/skills/`    |
| `IprepPaths.avatarsDir`        | `string`                 | `~/.iprep/public/images/avatars/`   |
| `IprepPaths.avatarAssignments` | `string`                 | `~/.iprep/avatar-assignments.json`  |

**Status in new package:** Partially covered. `IPREP_HOME`, `IPREP_DB_DIR`, `IPREP_DB_PATH`, `IPREP_SESSIONS_FILE`, `IPREP_BACKUPS_DIR`, `IPREP_KEYS_FILE` are defined as flat constants. The `IprepPaths` object with dynamic tutor-scoped path helpers (`tutor(id)`, `documents(id)`, `tutorSkills(id)`) is not yet ported — needed by CLI and server when accessing per-tutor directories.

---

### `src/utils/formatters.js`

| Function                     | Signature                        | Notes                                            |
| ---------------------------- | -------------------------------- | ------------------------------------------------ |
| `formatDate(date)`           | `(date) => string`               | Returns ISO 8601 UTC string                      |
| `formatTimestamp(date)`      | `(date) => string`               | Returns locale-formatted string for display      |
| `truncate(text, maxLength?)` | `(string, number=100) => string` | Appends `'...'` if over limit                    |
| `generateUserId()`           | `() => string`                   | `user_{epoch}_{6-char base-36}`                  |
| `slugify(text)`              | `(string) => string`             | Lowercase, spaces→hyphens, strips non-word chars |

**Status in new package:** **Fully ported** to `src/utils/formatters.ts` with TypeScript types added.

---

### `src/utils/logger.js`

| Export             | Type     | Notes                                  |
| ------------------ | -------- | -------------------------------------- |
| `logger` (named)   | `object` | `{ error, warn, info, debug }` methods |
| `logger` (default) | same     | Same object as default export          |

**Implementation:**

- Reads `process.env.LOG_LEVEL` (default `'info'`)
- Numeric level map: `error=0, warn=1, info=2, debug=3`
- Prefixes every log line with ISO timestamp + level: `[2024-01-01T00:00:00.000Z] [INFO]`
- Routes `error` → `console.error`, `warn` → `console.warn`, everything else → `console.log`

**Status in new package:** Not yet ported. CLAUDE.md states "No `console.log` in production code — use the Winston logger", so the new implementation should use **Winston** (not a hand-rolled logger). The old logger is a useful reference for the format and level behavior only.

---

### `src/utils/validation.js`

| Function                   | Signature              | Notes                                     |
| -------------------------- | ---------------------- | ----------------------------------------- |
| `isValidTutorId(tutorId)`  | `(unknown) => boolean` | Checks against `TUTOR_IDS` array          |
| `isValidMessage(message)`  | `(unknown) => boolean` | Non-empty string, ≤ `MAX_MESSAGE_LENGTH`  |
| `isValidUserId(userId)`    | `(unknown) => boolean` | Non-empty string check                    |
| `sanitizeMessage(message)` | `(string) => string`   | `trim()` + `slice(0, MAX_MESSAGE_LENGTH)` |

**Status in new package:** Not yet ported as runtime functions. The new package uses **Zod schemas** (`StartSessionSchema`, `EndSessionSchema`, etc.) which subsume most of this validation. However, `sanitizeMessage` and `isValidMessage` may still be useful as lightweight guards in the WebSocket message handler before full Zod parsing.

---

## Current New Package State

```
src/
├── index.ts                     ← re-exports all modules
├── constants/
│   └── index.ts                 ← ports + app identity, ports, paths, slugs, statuses
├── types/
│   └── index.ts                 ← provider interfaces + shared data shapes (TranscriptEntry, HealthResponse, ApiError)
├── schemas/
│   ├── index.ts
│   ├── session.schema.ts        ← StartSession, EndSession, SessionResponse
│   ├── analysis.schema.ts       ← Scores, AnalysisResult, AnalysisStatus, TriggerAnalysis
│   ├── provider.schema.ts       ← BYOKKey, ProviderStatus, ProviderConfig, ValidateKey
│   └── env.schema.ts            ← EnvSchema (all process.env vars)
└── utils/
    ├── index.ts
    └── formatters.ts            ← formatDate, formatTimestamp, truncate, generateUserId, slugify
```

---

## What Still Needs to Be Created

| Item                    | Where                                  | Priority | Notes                                                                  |
| ----------------------- | -------------------------------------- | -------- | ---------------------------------------------------------------------- |
| `HTTP_STATUS` constants | `constants/index.ts`                   | High     | Reusable across server routes and frontend fetch handlers              |
| `ROLES` constants       | `constants/index.ts`                   | High     | `user \| assistant \| system` — needed by transcript logic             |
| `MAX_MESSAGE_LENGTH`    | `constants/index.ts`                   | High     | Used by validation and sanitize utils                                  |
| `MAX_DOCS_PER_TUTOR`    | `constants/index.ts`                   | Medium   | Enforced in document upload route                                      |
| `CLAUDE_TIMEOUT_MS`     | `constants/index.ts`                   | Medium   | Used by ClaudeAdapter process spawner                                  |
| `IprepPaths` object     | `constants/index.ts` or new `paths.ts` | High     | CLI + server need tutor-scoped path helpers                            |
| Tutor metadata objects  | `constants/tutors.ts`                  | Medium   | New tutors (alex/priya/morgan) need id, name, description, icon, color |
| `sanitizeMessage()`     | `utils/validation.ts`                  | Medium   | Lightweight guard before Zod parse in WebSocket handler                |
| `isValidMessage()`      | `utils/validation.ts`                  | Low      | May be replaced entirely by Zod, but useful for quick pre-checks       |
| Winston logger          | `utils/logger.ts`                      | High     | Replace hand-rolled logger; keep same log level + prefix behavior      |
| API endpoint constants  | `constants/api.ts`                     | Low      | New endpoints differ from old; define after server routes are stable   |

---

## Migration Notes

- **Validation approach changed:** Old code used hand-written guard functions. New code uses Zod schemas. Port only `sanitizeMessage` as a util; replace `isValidMessage` / `isValidTutorId` / `isValidUserId` with Zod refinements in the relevant schemas.
- **Logger:** Do not copy the hand-rolled logger. Use Winston with the same ISO-timestamp + level prefix convention.
- **Tutor IDs changed:** Old tutors were `english-coach`, `interview-prep`, `client-communication`. New tutors are `alex`, `priya`, `morgan`. Do not mix.
- **Paths changed:** Old `IprepPaths.database` pointed to `~/.iprep/database/`; new constants use `~/.iprep/db/`. Keep the new path — update any CLI code that references the old location.
- **No schemas in old package:** The old package had no Zod. All schema/type work in the new package is net-new.
