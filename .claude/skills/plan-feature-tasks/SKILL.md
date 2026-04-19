---
name: plan-feature-tasks
description: Break down a feature into structured, numbered implementation task files with dependency graphs and token estimates. Use when the user says "plan tasks", "break down a feature", "create task files", "generate implementation tasks", or "create feature tasks".
argument-hint: "[feature-name or spec-file-path]"
allowed-tools:
  Read
  Grep
  Glob
  Write
  Edit
---

# Plan Feature Tasks

You are breaking down a feature into structured implementation task files. Follow this process exactly.

## Step 1: Gather Context

Before generating any files:

1. **Read the source spec** — If the user provides a spec file path or feature doc, read it fully
2. **Scan the codebase** — Check existing components, CSS tokens, contexts, hooks, API client patterns, and backend routes to inform accurate deliverables
3. **Check existing tasks** — Look in the target output folder (e.g., `docs/tasks/` or `docs/feature/`) to find the highest task number and continue from there
4. **Identify the output folder** — Ask the user or use the folder they specify. Default: `docs/tasks/`

## Step 2: Create Task Files

Create individual task files named `NN-kebab-case-name.md` (e.g., `01-drawer-framework.md`).

**Every task file MUST use this exact template:**

Read the template at `${CLAUDE_SKILL_DIR}/TASK_TEMPLATE.md` and fill in all sections.

Key rules:
- **Header metadata** is mandatory: Phase, Priority, Estimated Tokens, Depends On, Ref
- **Priority emojis**: 🔴 Critical (blocks others) | 🟡 High (core feature) | 🟢 Medium/Low
- **Deliverables** are numbered. Each one has: `**Path:**` and `**Est. tokens:**`
- **Acceptance criteria** use `- [ ]` checkboxes. Minimum 5 per task.
- **Files Changed** table at the end uses CREATE / REPLACE / MODIFY actions.

## Step 3: Create Index File

Create `00-task-index.md` in the same folder.

Read the template at `${CLAUDE_SKILL_DIR}/INDEX_TEMPLATE.md` and fill in all sections.

The index MUST include:
- Overview table with all tasks
- ASCII dependency graph
- Recommended sprint execution order with token budget per sprint
- Token estimation method table
- Files impact summary

## Token Estimation Rules

Estimate tokens for each deliverable using these rates (calibrated from this project's existing files):

| File Type             | Tokens/Line | Reference                                      |
|-----------------------|-------------|------------------------------------------------|
| TSX/JSX components    | ~25         | `ScoreCard.tsx` (94 lines ≈ 2,350 tokens)      |
| CSS files             | ~15         | `chat.css` (258 lines ≈ 3,870 tokens)          |
| Context/Hooks         | ~30         | `useSession.ts` (66 lines ≈ 1,980 tokens)      |
| Backend routes        | ~28         | `interview.ts`, `analysis.ts`                  |
| Utility/helper files  | ~22         | `api.ts` (48 lines ≈ 1,056 tokens)             |
| File modifications    | ~20         | For changed sections only                       |
| Config/JSON           | ~10         | `package.json` changes                          |

Always add **+15% overhead** for imports, error handling, and type definitions.
