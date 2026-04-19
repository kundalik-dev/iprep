---
name: AI Rules
description: Guidelines for AI-assisted contributions to iPrep.
---

# AI Contribution Rules

These rules apply when any AI tool (Claude, Copilot, Cursor, ChatGPT, etc.) is used to generate or modify code in this project.

## General Principles

1. **Disclose AI use** — every PR that includes AI-generated code must fill in the *Model Used* section of the PR template.
2. **You own the output** — the contributor who opens the PR is responsible for reviewing, testing, and standing behind all AI-generated code.
3. **No blind apply** — do not paste AI output without reading and understanding it. If you cannot explain a line, do not commit it.
4. **Minimal scope** — ask AI to make targeted, small changes. Avoid large sweeping rewrites unless explicitly planned and reviewed.

## What AI Can Help With

| Task | Allowed |
|------|---------|
| Writing boilerplate / scaffolding | Yes |
| Explaining existing code | Yes |
| Suggesting refactors (reviewed by human) | Yes |
| Writing tests | Yes |
| Generating documentation / comments | Yes |
| Making architectural decisions | No — discuss in an issue first |
| Merging or resolving conflicts automatically | No — human must resolve |
| Modifying CI/CD pipelines without review | No |

## Required PR Fields (AI Contributions)

In `.github/PULL_REQUEST_TEMPLATE.md`, fill in:

- **Model:** provider + version (e.g., `Claude Sonnet 4.6`)
- **Context given:** a one-line summary of the prompt / task description
- **Lines reviewed:** confirm you read every AI-generated line

## Prompt Hygiene

- Include project context in your prompts (monorepo, TypeScript, pnpm).
- Reference the relevant rule files so the AI follows project conventions.
- Avoid prompts like "rewrite everything" — prefer "add X to function Y in file Z".

## For Claude Code Users

Claude Code reads `CLAUDE.md` at the project root automatically.
That file is the authoritative source for AI tool configuration.
This file (`AI_RULES.md`) is the human-readable version for all contributors.

---

> To add or change a rule, open a PR and update both this file and [README.md](./README.md).
