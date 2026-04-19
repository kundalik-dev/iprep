---
name: auto-pr-sync
description: Automates creating a PR, merging it on GitHub using Playwright and then resyncing local main and dev branches.
---

# Auto PR & Sync Skill

Automates the workflow of creating a PR targeting `dev_branch`, checking for conflicts, merging only if clean, and syncing the local `dev_branch`. Uses the Playwright install from `iprep/tests/playwrigh-tests` — no separate playwright install needed.

## When to use
- "Run PR automation"
- "Create PR and sync branches using playwright"
- "Publish, merge and sync"

## What it does
1. Checks out / creates the feature branch, commits any staged changes, pushes to origin
2. Opens a headful Chromium browser (so you can handle 2FA / first-time login)
3. Navigates to the GitHub PR creation page with **`dev_branch` as base** (never `main`)
4. Fills in the PR **title** and optional **description**
5. **Conflict check** — if GitHub shows merge conflicts the script exits early without merging
6. Merges the PR into `dev_branch` via the GitHub UI
7. Pulls `dev_branch` locally — `main` is **not** touched

## Execution

```bash
cd "iprep/.claude/skills/auto-pr-sync/scripts"
node automate.mjs \
  --branch  "<feature-branch>" \
  --msg     "<git commit message>" \
  --pr-title "<PR title shown on GitHub>" \
  --pr-body  "<PR description (optional)>" \
  --repo    "username/repo"
```

### Arguments

| Flag         | Required | Description                                      |
|--------------|----------|--------------------------------------------------|
| `--branch`   | ✅       | Feature branch to push and PR from              |
| `--msg`      | optional | Git commit message (defaults to branch name)     |
| `--pr-title` | optional | PR title on GitHub (defaults to `--msg`)         |
| `--pr-body`  | optional | PR description / body text                       |
| `--repo`     | optional | `user/repo` — auto-detected from `git remote`    |

> **Note:** A persistent browser session is saved in `./playwright-session` so you only need to log in once. The browser is visible (headful) to support 2FA and manual overrides.

## Conflict handling
If GitHub detects merge conflicts the script prints a warning and exits **without merging**. Resolve the conflicts manually and re-run, or merge directly in the browser.
