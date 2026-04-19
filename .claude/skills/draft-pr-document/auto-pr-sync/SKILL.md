---
name: auto-pr-sync
description: Automates creating a PR, merging it on GitHub using Playwright and then resyncing local main and dev branches.
---

# Auto PR & Sync Skill

This skill helps the user automate their workflow of creating a PR, merging it via browser automation (Playwright), and finally synchronizing local branches (`main` and `dev_branch`).

## When to use
Use this skill when the user says:
- "Run PR automation"
- "Create PR and sync branches using playwright"
- "Publish, merge and sync"

## Execution Steps

1. **Ask for Branch Details**: Make sure you know the `branch_name` and the `commit_message`. 
2. **Check Playwright**: Before running the script, ensure `playwright` is available. If it isn't, offer to install it locally in the `scripts` directory.
3. **Run the Script**: 
   Execute the automated Node script utilizing Playwright.

   ```bash
   cd ".agents/skills/auto-pr-sync/scripts"
   npm install playwright
   node automate.mjs --branch "<branch_name>" --msg "<commit_message>" --repo "username/repo"
   ```
   *(Note: The user will need to provide their repo name and authenticate during the Playwright session or pass a GitHub Session Token if fully headless. By default the script runs headful so the user can pass 2FA).*

4. **Verify Process**: After the script finishes, confirm that you are securely on the `dev_branch` and that everything is up-to-date.
