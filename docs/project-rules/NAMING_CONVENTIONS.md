---
name: Naming Conventions
description: Standard naming rules for variables, functions, files, folders, and markdown in iPrep.
---

# Naming Conventions

Quick reference for consistent naming across the codebase.

## Style Table

| Category | Style | Example |
|----------|-------|---------|
| Variable | `camelCase` | `userScore` |
| Boolean variable | `camelCase` with `is`/`has`/`can` prefix | `isLoggedIn` |
| Constant | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| Function / Method | `camelCase`, verb-first | `getUserById()` |
| React Component | `PascalCase` | `QuizCard` |
| TypeScript Interface | `PascalCase` with `I` prefix | `IUserSession` |
| TypeScript Type alias | `PascalCase` | `ApiResponse` |
| TypeScript Enum | `PascalCase` (members `SCREAMING_SNAKE_CASE`) | `enum Status { IN_PROGRESS }` |
| Source file (TS/JS) | `kebab-case` | `user-service.ts` |
| React component file | `PascalCase` | `QuizCard.tsx` |
| Test file | same as source + `.test` / `.spec` | `user-service.test.ts` |
| Folder / Directory | `kebab-case` | `adapter-utils/` |
| Markdown doc file | `SCREAMING_SNAKE_CASE` | `NAMING_CONVENTIONS.md` |
| Environment variable | `SCREAMING_SNAKE_CASE` | `DATABASE_URL` |

## Notes

- **Do not** use abbreviations unless they are universally known (e.g., `id`, `url`, `api`).
- **Do not** prefix variables with their type (no Hungarian notation — `strName` is wrong, `name` is right).
- Boolean variables must read like a question: `isActive`, not `active` or `activeFlag`.
- Keep names descriptive but concise. If a name needs a comment to explain it, rename it.

---

> To propose a change, open a PR and update this file + the table in [README.md](./README.md).
