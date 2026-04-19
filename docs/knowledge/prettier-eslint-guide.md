# ESLint & Prettier Setup Guide

This document provides a basic overview of how formatting and linting are handled across the iPrep monorepo. We use **ESLint** to catch code quality and correctness issues and **Prettier** to automatically format code to a consistent style.

---

## 🚀 Getting Started

To utilize the formatting and linting capabilities, there are two primary commands you can execute from the root of the workspace:

- **Format Codebase:** 
  ```bash
  pnpm run format
  ```
  *(This runs Prettier across all supported files in the repository and overwrites files with the corrected format.)*

- **Lint Codebase:**
  ```bash
  pnpm run lint:root
  ```
  *(This runs ESLint specifically across the root configuration and TypeScript files checking for logical errors or unused variables.)*
  
There is also a broader script `pnpm run lint` which traverses through all workspace packages and runs their local `lint` script, ideal for the CI/CD pipeline or broad checks.

---

## 🛠️ Configuration Overview

### 1. Prettier
Prettier focuses strictly on how the code *looks*. We keep formatting simple to reduce arguments over style.
- **Config file**: `.prettierrc`
- **Key rules**: 100 character print width, single quotes, auto-adding trailing commas.
- **Ignore file**: `.prettierignore` (Excludes `node_modules`, `dist`, `.pnpm-store/`, and build outputs).

### 2. ESLint (Flat Config)
We use the modern **ESLint Flat Config** for defining rules.
- **Config file**: `eslint.config.mjs`
- **Why this format?**: ESLint v9+ moved away from the legacy `.eslintrc.json`, adopting a module-based structure.
- **Package extensions**: The root setup extends standard JavaScript recommendations, TypeScript strict warnings (`typescript-eslint`), and utilizes `eslint-config-prettier` to ensure ESLint will **never** compete with Prettier over structural styles.

---

## 💻 IDE Setup (VS Code)

To get real-time feedback and auto-formatting, configure your editor:

1. **Install Extensions**:
   - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
   - [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

2. **Workspace Settings**:
   Usually, you'd want format to trigger automatically when saving a piece of code.
   Add the following inside your VS Code `settings.json` (or `.vscode/settings.json` for the project):
   
   ```json
   {
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": "explicit"
     }
   }
   ```

---

## 📦 Monorepo Architecture

Because iPrep uses a monorepo (`apps/`, `packages/`):
- **Root-level enforcement**: The root config sets baseline rules for TypeScript and generic JavaScript.
- **Package-specific extensions**: As we build out React/Vite frontends or backend APIs, those specific packages can have their own simpler `eslint.config.mjs` files that layer environment-specific plugins (like `eslint-plugin-react`) straight onto this core root config.
