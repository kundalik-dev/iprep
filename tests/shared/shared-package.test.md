# @iprep/shared — Test Cases

Test cases for everything currently implemented in `packages/shared/src/`.
These are written as human-readable specs to be implemented with Vitest.

---

## 1. Constants (`constants/index.ts`)

### 1.1 App Identity
| # | Test | Expected |
|---|------|----------|
| 1 | `APP_NAME` equals `"iprep"` | pass |
| 2 | `APP_VERSION` matches semver pattern `x.x.x` | pass |

### 1.2 Ports
| # | Test | Expected |
|---|------|----------|
| 3 | `DEFAULT_PORT` equals `3000` | pass |
| 4 | `DEFAULT_WS_PORT` equals `3001` | pass |
| 5 | `DEFAULT_FRONTEND_PORT` equals `5173` | pass |
| 6 | All three ports are unique (no collisions) | pass |

### 1.3 Slug Arrays
| # | Test | Expected |
|---|------|----------|
| 7 | `INTERVIEW_PACKAGE_SLUGS` contains `"behavioral"`, `"technical"`, `"system-design"`, `"dsa"`, `"hr"`, `"pm"` | pass |
| 8 | `TUTOR_SLUGS` contains `"alex"`, `"priya"`, `"morgan"` | pass |
| 9 | `INTERVIEW_MODES` contains `"voice"` and `"text"` | pass |
| 10 | `SESSION_STATUSES` contains `"ACTIVE"`, `"ENDED"`, `"ANALYZING"`, `"ANALYZED"`, `"FAILED"` | pass |
| 11 | `ANALYSIS_STATUSES` contains `"PENDING"`, `"IN_PROGRESS"`, `"COMPLETED"`, `"FAILED"` | pass |
| 12 | `PROVIDER_TYPES` contains `"llm"`, `"stt"`, `"tts"`, `"agent"` | pass |
| 13 | All slug arrays are `readonly` (`as const`) — mutating throws at compile time | compile-time |

### 1.4 LLM Provider Slugs (fallback chain order)
| # | Test | Expected |
|---|------|----------|
| 14 | `LLM_PROVIDER_SLUGS[0]` is `"gemini-free"` (cheapest first) | pass |
| 15 | `LLM_PROVIDER_SLUGS` contains all 8 expected slugs | pass |
| 16 | `STT_PROVIDER_SLUGS` contains `"deepgram"` and `"openai-whisper"` | pass |
| 17 | `TTS_PROVIDER_SLUGS` contains `"deepgram"` and `"openai-tts"` | pass |
| 18 | `AGENT_PROVIDER_SLUGS` contains `"deepgram-agent"` | pass |

---

## 2. Path Resolver (`utils/dir-path.ts`)

### 2.1 IPREP_HOME
| # | Test | Expected |
|---|------|----------|
| 19 | `IPREP_HOME` ends with `.iprep` | pass |
| 20 | `IPREP_HOME` starts with `os.homedir()` | pass |
| 21 | `IPREP_HOME` uses OS path separator (no mixed slashes) | pass |

### 2.2 Static paths on `IprepPaths`
| # | Test | Expected |
|---|------|----------|
| 22 | `IprepPaths.root` equals `IPREP_HOME` | pass |
| 23 | `IprepPaths.aitutors` ends with `aitutors` | pass |
| 24 | `IprepPaths.database` ends with `database` | pass |
| 25 | `IprepPaths.dbFile` ends with `database/iprep.db` (or OS equivalent) | pass |
| 26 | `IprepPaths.docs` ends with `docs` | pass |
| 27 | `IprepPaths.skills` ends with `skills` | pass |
| 28 | `IprepPaths.avatarsDir` ends with `public/images/avatars` (or OS equivalent) | pass |
| 29 | `IprepPaths.avatarAssignments` ends with `avatar-assignments.json` | pass |
| 30 | `IprepPaths.sessions` ends with `sessions.json` | pass |
| 31 | `IprepPaths.backups` ends with `backups` | pass |
| 32 | `IprepPaths.keysFile` ends with `.keys` | pass |

### 2.3 Dynamic path functions (UUID-based)
| # | Test | Input | Expected |
|---|------|-------|----------|
| 33 | `IprepPaths.tutor(id)` returns correct path | `"abc-123"` | `<IPREP_HOME>/aitutors/abc-123` |
| 34 | `IprepPaths.documents(id)` returns correct path | `"abc-123"` | `<IPREP_HOME>/aitutors/abc-123/documents` |
| 35 | `IprepPaths.tutorSkills(id)` returns correct path | `"abc-123"` | `<IPREP_HOME>/aitutors/abc-123/skills` |
| 36 | All three functions use the same UUID segment in the path | `"abc-123"` | path contains `abc-123` exactly once per segment |
| 37 | Empty string `id` is handled — path still resolves without error | `""` | resolves (no throw) |

### 2.4 Path consistency
| # | Test | Expected |
|---|------|----------|
| 38 | `IprepPaths.database` is a parent of `IprepPaths.dbFile` | pass |
| 39 | `IprepPaths.aitutors` is a parent of `IprepPaths.tutor("any-uuid")` | pass |
| 40 | `IprepPaths.tutor(id)` is a parent of `IprepPaths.documents(id)` | pass |
| 41 | `IprepPaths.tutor(id)` is a parent of `IprepPaths.tutorSkills(id)` | pass |

---

## 3. Formatters (`utils/formatters.ts`)

### 3.1 `formatDate`
| # | Test | Input | Expected |
|---|------|-------|----------|
| 42 | Returns ISO 8601 UTC string | `new Date(0)` | `"1970-01-01T00:00:00.000Z"` |
| 43 | Accepts a Date object | `new Date("2024-01-15")` | valid ISO string |
| 44 | Accepts a timestamp number | `1700000000000` | valid ISO string |
| 45 | Accepts an ISO string | `"2024-06-01T10:00:00Z"` | valid ISO string |

### 3.2 `formatTimestamp`
| # | Test | Input | Expected |
|---|------|-------|----------|
| 46 | Returns a non-empty string | `new Date()` | truthy string |
| 47 | Result is locale-aware (not raw ISO) | `new Date(0)` | different from `formatDate(new Date(0))` |

### 3.3 `truncate`
| # | Test | Input | Expected |
|---|------|-------|----------|
| 48 | Short text is returned unchanged | `"hi"`, maxLength `100` | `"hi"` |
| 49 | Exact-length text is not truncated | 100-char string, maxLength `100` | original string |
| 50 | Over-limit text is truncated with `"..."` | 101-char string, maxLength `100` | 103-char string ending with `"..."` |
| 51 | Custom `maxLength` is respected | `"hello world"`, maxLength `5` | `"hello..."` |
| 52 | Empty string returns empty string | `""` | `""` |
| 53 | `null`/`undefined` returns the input (falsy guard) | `null` | `null` |

### 3.4 `slugify`
| # | Test | Input | Expected |
|---|------|-------|----------|
| 54 | Lowercases text | `"Hello"` | `"hello"` |
| 55 | Replaces spaces with hyphens | `"System Design"` | `"system-design"` |
| 56 | Strips special characters | `"C++ Interview!"` | `"c-interview"` |
| 57 | Collapses multiple spaces | `"foo   bar"` | `"foo-bar"` |
| 58 | Already-valid slug is unchanged | `"dsa"` | `"dsa"` |

### 3.5 `generateUserId`
| # | Test | Expected |
|---|------|----------|
| 59 | Starts with `"user_"` prefix | pass |
| 60 | Two calls return different values | pass |
| 61 | Contains exactly 2 underscores | pass |

---

## 4. Schemas (`schemas/`)

### 4.1 `EnvSchema` (`env.schema.ts`)
| # | Test | Input | Expected |
|---|------|-------|----------|
| 62 | Valid minimal input passes | `{ DATABASE_URL: "file:./dev.db" }` | parse succeeds |
| 63 | `PORT` defaults to `"3000"` when absent | `{ DATABASE_URL: "..." }` | `PORT === "3000"` |
| 64 | `NODE_ENV` defaults to `"development"` | minimal input | `NODE_ENV === "development"` |
| 65 | `ALLOWED_ORIGINS` defaults to `"http://localhost:5173"` | minimal input | pass |
| 66 | `NODE_ENV` rejects unknown value | `{ NODE_ENV: "staging", DATABASE_URL: "..." }` | ZodError |
| 67 | Missing `DATABASE_URL` fails | `{}` | ZodError |
| 68 | `OLLAMA_BASE_URL` defaults to `"http://localhost:11434"` | minimal input | pass |
| 69 | Invalid `OLLAMA_BASE_URL` (not a URL) fails | `{ OLLAMA_BASE_URL: "not-a-url", DATABASE_URL: "..." }` | ZodError |
| 70 | All API keys are optional | minimal input | parse succeeds without any key |

### 4.2 `ScoreSchema` (`analysis.schema.ts`)
| # | Test | Input | Expected |
|---|------|-------|----------|
| 71 | Valid scores (0–10) pass | all fields `5` | pass |
| 72 | Score below 0 fails | `overall: -1` | ZodError |
| 73 | Score above 10 fails | `communication: 11` | ZodError |
| 74 | Score of exactly 0 passes | `overall: 0` | pass |
| 75 | Score of exactly 10 passes | `overall: 10` | pass |
| 76 | Missing any score field fails | omit `clarity` | ZodError |

### 4.3 `AnalysisResultSchema` (`analysis.schema.ts`)
| # | Test | Input | Expected |
|---|------|-------|----------|
| 77 | Valid full input passes | all fields populated | pass |
| 78 | Empty `sessionId` fails | `sessionId: ""` | ZodError |
| 79 | Empty `strengths` array fails | `strengths: []` | ZodError |
| 80 | Empty `improvements` array fails | `improvements: []` | ZodError |
| 81 | Empty `report` fails | `report: ""` | ZodError |
| 82 | Invalid `generatedAt` (not datetime) fails | `generatedAt: "not-a-date"` | ZodError |

### 4.4 `AnalysisStatusSchema` (`analysis.schema.ts`)
| # | Test | Input | Expected |
|---|------|-------|----------|
| 83 | Status `"PENDING"` without `result` passes | — | pass |
| 84 | Status `"COMPLETED"` with valid `result` passes | — | pass |
| 85 | Invalid status value fails | `status: "DONE"` | ZodError |
| 86 | `progress` above 100 fails | `progress: 101` | ZodError |
| 87 | `progress` below 0 fails | `progress: -1` | ZodError |
| 88 | `progress` is optional | omit it | pass |

### 4.5 `TriggerAnalysisSchema` (`analysis.schema.ts`)
| # | Test | Input | Expected |
|---|------|-------|----------|
| 89 | Valid input with `sessionId` only passes | `{ sessionId: "abc" }` | pass |
| 90 | Empty `sessionId` fails | `{ sessionId: "" }` | ZodError |
| 91 | Optional `preferredProvider` accepted | `{ sessionId: "abc", preferredProvider: "claude-cli" }` | pass |

### 4.6 `StartSessionSchema` (`session.schema.ts`)
| # | Test | Input | Expected |
|---|------|-------|----------|
| 92 | Valid input passes | `{ packageSlug: "dsa", tutorSlug: "alex", mode: "voice" }` | pass |
| 93 | `mode` defaults to `"voice"` when omitted | omit `mode` | `mode === "voice"` |
| 94 | Unknown `packageSlug` fails | `packageSlug: "crypto"` | ZodError |
| 95 | Unknown `tutorSlug` fails | `tutorSlug: "unknown"` | ZodError |
| 96 | Unknown `mode` fails | `mode: "hybrid"` | ZodError |
| 97 | Optional `provider` accepted | `{ ..., provider: "deepgram-agent" }` | pass |

### 4.7 `EndSessionSchema` (`session.schema.ts`)
| # | Test | Input | Expected |
|---|------|-------|----------|
| 98 | Valid input with `sessionId` only passes | `{ sessionId: "abc" }` | pass |
| 99 | Empty `sessionId` fails | `{ sessionId: "" }` | ZodError |
| 100 | Valid transcript array passes | `{ sessionId: "abc", transcript: [{ role: "user", content: "hi", timestamp: "2024-01-01T00:00:00Z" }] }` | pass |
| 101 | Transcript entry with invalid `role` fails | `role: "system"` | ZodError |
| 102 | Transcript entry with invalid `timestamp` fails | `timestamp: "not-a-date"` | ZodError |
| 103 | `transcript` is optional | omit it | pass |

### 4.8 `SessionResponseSchema` (`session.schema.ts`)
| # | Test | Input | Expected |
|---|------|-------|----------|
| 104 | Valid full response passes | all fields set | pass |
| 105 | `endedAt` accepts `null` | `endedAt: null` | pass |
| 106 | `endedAt` absent (optional) | omit it | pass |
| 107 | Invalid `status` fails | `status: "UNKNOWN"` | ZodError |

### 4.9 `BYOKKeySchema` (`provider.schema.ts`)
| # | Test | Input | Expected |
|---|------|-------|----------|
| 108 | Valid provider + key passes | `{ provider: "deepgram", key: "dg_abc" }` | pass |
| 109 | Unknown provider fails | `{ provider: "mistral", key: "abc" }` | ZodError |
| 110 | Empty key fails | `{ provider: "anthropic", key: "" }` | ZodError |

### 4.10 `ProviderStatusSchema` (`provider.schema.ts`)
| # | Test | Input | Expected |
|---|------|-------|----------|
| 111 | Valid status with `available: true` passes | — | pass |
| 112 | Valid status with `available: false` + `reason` passes | — | pass |
| 113 | Unknown `type` fails | `type: "vision"` | ZodError |

### 4.11 `ProviderConfigSchema` (`provider.schema.ts`)
| # | Test | Input | Expected |
|---|------|-------|----------|
| 114 | Only `deepgramApiKey` required, rest optional | `{ deepgramApiKey: "dg_key" }` | pass |
| 115 | Missing `deepgramApiKey` fails | `{}` | ZodError |
| 116 | Empty `deepgramApiKey` (whitespace) fails after trim | `{ deepgramApiKey: "   " }` | ZodError |
| 117 | `ollamaBaseUrl` defaults to `"http://localhost:11434"` | omit it | pass |
| 118 | Invalid `preferredLLMProvider` fails | `preferredLLMProvider: "gpt-4"` | ZodError |

### 4.12 `ValidateKeySchema` + `ValidateKeyResponseSchema` (`provider.schema.ts`)
| # | Test | Input | Expected |
|---|------|-------|----------|
| 119 | Valid provider + key passes | `{ provider: "gemini", key: "abc" }` | pass |
| 120 | Unknown provider in `ValidateKeySchema` fails | `provider: "ollama"` | ZodError |
| 121 | `ValidateKeyResponseSchema` with `valid: true` passes | — | pass |
| 122 | `ValidateKeyResponseSchema` with `valid: false` + `error` passes | — | pass |

---

## 5. Types (`types/index.ts`)

These are compile-time only — verified by `tsc`, not at runtime.

| # | Test | Expected |
|---|------|----------|
| 123 | `TutorSlug` only accepts `"alex" \| "priya" \| "morgan"` | compile-time |
| 124 | `InterviewMode` only accepts `"voice" \| "text"` | compile-time |
| 125 | `SessionStatus` covers all 5 states | compile-time |
| 126 | `LLMProviderSlug` covers all 8 slugs | compile-time |
| 127 | `ILLMProvider` requires `slug`, `type`, `isAvailable()`, `analyze()` | compile-time |
| 128 | `ISTTProvider` requires `slug`, `type`, `isAvailable()` | compile-time |
| 129 | `ITTSProvider` requires `slug`, `type`, `isAvailable()` | compile-time |
| 130 | `IAgentProvider` requires `slug`, `type`, `isAvailable()` | compile-time |
| 131 | `TranscriptEntry.role` only accepts `"user" \| "assistant"` | compile-time |
| 132 | `HealthResponse.status` only accepts `"ok" \| "error"` | compile-time |

---

## Notes

- All Zod schema tests should use `.parse()` for valid cases and `.safeParse()` to assert failures without throwing.
- Compile-time tests are confirmed by running `tsc --noEmit` — no special test file needed.
- Path tests should import `IprepPaths` and `IPREP_HOME` and compare using `path.join` (not string concat) to stay cross-platform.
