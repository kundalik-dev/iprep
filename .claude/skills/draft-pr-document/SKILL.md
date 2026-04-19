---
name: draft-pr-document
description: Draft a pull request document from the current (or specified) branch's commits and file changes, then save it to docs/pr-docs/ using the project PR template. Use when the user says "draft PR doc", "create PR document", "write PR file", "generate PR", or "make a PR".
argument-hint: '[branch-name] (optional — defaults to current branch)'
allowed-tools: Bash
  Read
  Glob
  Write
---

# Draft PR Document

You are drafting a pull request document for iPrep. Follow every step in order.

---

## Step 1: Resolve the Branch

1. Run `git branch --show-current` to get the active branch name.
2. If the branch is `main`, `dev_branch`, or any non-feature branch **and** the user did not supply a branch name as an argument, ask:
   > "Which branch should I generate the PR for? (e.g. feat/my-feature)"
3. Accepted branch prefixes: `feat/`, `fix/`, `docs/`, `chore/`.  
   If the branch has none of these, warn the user but continue.

---

## Step 2: Collect Commit & Diff Data

Run these commands in order. Save the output — you will use it to fill the template.

```bash
# All commits on this branch not yet in main
git log main..HEAD --oneline --no-merges

# All commits not yet in dev_branch (fallback if no main divergence)
git log dev_branch..HEAD --oneline --no-merges
```

If both return empty, try:

```bash
git log origin/main..HEAD --oneline --no-merges
```

Then get the full diff summary:

```bash
# Files changed with change type (A=added, M=modified, D=deleted)
git diff main...HEAD --name-status

# Stat overview (lines added/removed)
git diff main...HEAD --stat
```

If `main` is unavailable as a base, substitute `dev_branch`.

---

## Step 3: Read the PR Template

Read the template at `docs/template/PULL_REQUEST_TEMPLATE.md`.  
Also read the example at `docs/template/DEMO_PR_FILE.md` to calibrate tone and detail level.

---

## Step 4: Determine the Output File Number and Name

1. List all files in `docs/pr-docs/` using Glob pattern `docs/pr-docs/*.md`.
2. Find the highest leading number (e.g., `03-` → next is `04`). If folder is empty, start at `01`.
3. Derive a short kebab-case slug from the branch name:
   - Strip the prefix (`feat/`, `fix/`, `docs/`, `chore/`)
   - Convert to kebab-case
   - Example: `feat/user-auth-flow` → `user-auth-flow`
4. Final filename: `NN-slug.md` (e.g., `02-user-auth-flow.md`)

---

## Step 5: Draft the PR Document

Fill every section using what you learned from the commits and diff. Rules:

### Title

- Generate a concise, human-readable PR title (max 72 characters)
- Format: `[Prefix] Short description of what this PR does`
  - Prefix matches branch type: `feat:`, `fix:`, `docs:`, `chore:`
  - Example: `feat: add user authentication flow`
- Place this as `# Title` at the very top of the PR body, before `## Thinking Path`

### Thinking Path

- Start with: "iPrep is a Multi-tutor AI chatbot for interview prep & self help"
- Narrow through: subsystem → problem → why this PR exists → what it does → benefit
- Use blockquote `>` style, 5–8 bullet points
- Base this on the commit messages and changed files

### What Changed

- One bullet per logical unit of change
- Include the file path when relevant (e.g., `apps/cli/src/commands/onboard.js`)
- Group related changes under one bullet if they are trivially linked

### Verification

- Write concrete steps a reviewer can follow to confirm the change works
- Include commands where applicable (`npm run dev`, `pnpm test`, specific CLI commands)
- If the diff touches UI files, note that screenshots are needed

### Risks

- Assess each changed file for migration, breaking-change, or behavioral risk
- If genuinely low risk, write "Low risk — [reason]"

### Model Used

- Fill in: `Claude Sonnet 4.6 (via Claude Code CLI) — 200k context window`
- If the user tells you a different model was used, use that instead

### Checklist

- Pre-tick `[x]` for:
  - Thinking path (you just wrote it)
  - Model used (you just filled it)
  - Documentation (if any `.md` files were changed)
  - Risks (you just documented them)
- Leave unchecked: tests run, screenshots, Greptile comments

---

## Step 6: Write the File

Write the file to `docs/pr-docs/NN-slug.md` using this exact structure:

```
---
name: [Human-readable PR title derived from branch/commits]
description: [One sentence: what this PR does and why]
branch: [full branch name]
base: main
date: [today's date YYYY-MM-DD]
---

# [PR Title]

## Thinking Path
[...]

## What Changed
[...]

## Verification
[...]

## Risks
[...]

## Model Used
[...]

## Checklist
[...]
```

Do **not** include HTML comments from the template in the output — replace them with actual content.

---

## Step 7: Report Back

After writing the file tell the user:

1. The file path that was created (e.g., `docs/pr-docs/02-user-auth-flow.md`)
2. A one-line summary of what the PR covers
3. Any sections that need human input (e.g., screenshots, test results)
4. The exact PR body text — formatted and ready to paste into GitHub

---

## Error Handling

| Situation                                         | Action                                                 |
| ------------------------------------------------- | ------------------------------------------------------ |
| No commits found on branch                        | Ask user to confirm branch name; show `git log` output |
| Branch diverged from both `main` and `dev_branch` | Use `HEAD~N` as base; note this in the file            |
| User on `main` or `dev_branch` directly           | Ask which branch to use before proceeding              |
| `docs/pr-docs/` does not exist                    | Create it, then write the file                         |
