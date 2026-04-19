---
name: GIT Commit Info
description: Helps to understand git workflow.
---

Here is the professional breakdown of how you should move code through your branches:

### 1. The "Feature" Phase (`feat_branch`)

This is where the "messy" work happens. You create a branch for a specific task (e.g., adding a login page).

- **The Workflow:** Write code, commit often, and push to GitHub.
- **The Goal:** Get the feature working in isolation without breaking anything else.
- **Standard Practice:** Once the feature is done, you don't merge it yourself—you open a **Pull Request (PR)** to merge `feat_branch` into `dev_branch`.

### 2. The "Integration" Phase (`dev_branch`)

The `dev_branch` acts as a staging ground. This is where you combine different features to see if they play nice together.

- **The Workflow:** Merge your PRs here. This is where you run your automated tests or manually check the UI.
- **Why it's useful:** If `feat_branch_A` and `feat_branch_B` both work alone but break when combined, you catch that here _before_ it hits your users on `main`.

### 3. The "Production" Phase (`main`)

The `main` branch should only ever contain "shippable" code.

- **The Workflow:** Once `dev_branch` is confirmed stable and all tests pass, you merge `dev_branch` into `main`.
- **Standard Practice:** In a professional setting, this merge often triggers an automatic "Deployment" to your live website or app.

---

### A Typical "Day in the Life" of a Git Developer

If you are starting a new task today, your command line would look like this:

1.  **Start fresh:**
    `git checkout main` → `git pull origin main`
2.  **Create your workspace:**
    `git checkout -b feat/new-ui`
3.  **Do your work, then commit:**
    `git add .` → `git commit -m "feat: added new navigation bar"`
4.  **Sync with Dev (Industry Standard Rebase):**
    `git fetch origin` → `git rebase origin/dev_branch` _(Fixes any conflicts early)_
5.  **Merge to Dev:**
    Open a PR on GitHub from `feat/new-ui` → `dev_branch`.
6.  **Final Release:**
    Once Dev is solid, open a PR from `dev_branch` → `main`.

---

### Pro Tip: Naming Conventions

As your project [iprep](https://github.com/kundalik-dev/iprep) grows, try using prefixes for your branches to keep them organized:

- `feat/` — New features (e.g., `feat/user-profile`)
- `fix/` — Bug fixes (e.g., `fix/login-button-crash`)
- `docs/` — Documentation updates
- `chore/` — Routine tasks like updating dependencies

This is a variation of the **GitHub Flow** or **Git Flow** strategy, and it is considered a best practice because it keeps your `main` branch "sacred" (always stable and bug-free).
