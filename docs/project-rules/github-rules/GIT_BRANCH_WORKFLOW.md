---
name: Git Branch Workflow Guide
description: Step-by-step commands to start, work on, and close any branch type in iPrep, including the full feat → dev_branch → main flow.
---

# Git Branch Workflow Guide

Copy-paste commands for every stage of branch work in iPrep.

---

## Before You Start Any Branch — Sync First

Always sync `main` and `dev_branch` before creating a new branch. This ensures you build on the latest code.

```bash
# 1. Pull latest main
git checkout main
git pull origin main

# 2. Sync dev_branch with main
git checkout dev_branch
git rebase main
git push origin dev_branch --force-with-lease

# 3. Go back to main — new branches always start from main
git checkout main
```

---

## Starting a New Branch

### feat/ — New Feature

```bash
# Example: adding an onboarding screen
git checkout main
git pull origin main
git checkout -b feat/onboarding-screen
```

### fix/ — Bug Fix

```bash
# Example: fixing login button crash
git checkout main
git pull origin main
git checkout -b fix/login-button-crash
```

### docs/ — Documentation Update

```bash
# Example: updating the API usage guide
git checkout main
git pull origin main
git checkout -b docs/update-api-guide
```

### chore/ — Maintenance Task

```bash
# Example: upgrading pnpm dependencies
git checkout main
git pull origin main
git checkout -b chore/upgrade-pnpm-deps
```

---

## Day-to-Day Work Loop

```bash
# Stage specific files (preferred) or all changes
git add apps/web/src/components/OnboardingScreen.tsx
# or
git add .

# Commit (follow Conventional Commits)
git commit -m "feat: add onboarding screen with step indicators"

# Push your branch to remote
git push origin feat/onboarding-screen
```

### Conventional Commit Prefixes

| Prefix      | When to use                          |
| ----------- | ------------------------------------ |
| `feat:`     | New feature                          |
| `fix:`      | Bug fix                              |
| `docs:`     | Documentation only                   |
| `chore:`    | Config, deps, tooling                |
| `refactor:` | Code restructure, no behavior change |
| `test:`     | Adding or updating tests             |

---

## Staying in Sync While You Work

If `main` or `dev_branch` receives new commits while you're working, rebase your branch to avoid drift.

```bash
# Fetch all remote changes
git fetch origin

# Rebase your branch on top of latest main
git rebase origin/main

# If conflicts appear, fix them, then:
git rebase --continue

# Force-push the rebased branch
git push origin feat/onboarding-screen --force-with-lease
```

---

## When Your Work Is Done — Open a PR

**feat/fix → dev_branch** (never directly to main)

1. Push your final commits:
   ```bash
   git push origin feat/onboarding-screen
   ```
2. Open a PR on GitHub:
   - **Base:** `dev_branch`
   - **Compare:** `feat/onboarding-screen`
3. Fill in the PR template and request a review.

**dev_branch → main** (after all features for a release are merged and tested)

1. Open a PR on GitHub:
   - **Base:** `main`
   - **Compare:** `dev_branch`
2. Confirm all tests pass and the PR template is filled.

> `docs/` and `chore/` branches may PR directly to `main` if they have no feature code.

---

## After the PR Is Merged — Clean Up

```bash
# Switch away from the merged branch
git checkout main

# Pull the updated main
git pull origin main

# Delete the local branch
git branch -d feat/onboarding-screen

# Delete the remote branch (if GitHub didn't auto-delete it)
git push origin --delete feat/onboarding-screen
```

---

## Keeping main and dev_branch in Sync After a Release

After `dev_branch` is merged into `main`, bring `dev_branch` forward so it isn't stale.

```bash
git checkout main
git pull origin main

git checkout dev_branch
git rebase main
git push origin dev_branch --force-with-lease
```

Run this after every `dev_branch → main` merge.

---

## Quick Reference Cheat Sheet

```
# Start work
git checkout main && git pull origin main
git checkout -b <prefix>/<short-description>

# Save work
git add <files>
git commit -m "<prefix>: <what and why>"
git push origin <branch>

# Stay in sync
git fetch origin && git rebase origin/main
git push origin <branch> --force-with-lease

# Done — open PR on GitHub → dev_branch (or main for docs/chore)

# Clean up after merge
git checkout main && git pull origin main
git branch -d <branch>
git push origin --delete <branch>

# Re-sync dev_branch after release
git checkout dev_branch && git rebase main
git push origin dev_branch --force-with-lease
```
