# [Feature Name] — Task Index

**Feature:** [One-line feature description]  
**Source Spec:** [spec-file.md](relative-link)  
**Created:** YYYY-MM-DD  
**Total Estimated Tokens:** ~XX,000

---

## Task Overview

| # | Task | Phase | Priority | Est. Tokens | Depends On | Status |
|---|------|-------|----------|-------------|------------|--------|
| 01 | [Task Title](01-filename.md) | [id] | 🔴/🟡/🟢 | ~X,000 | [dep] | ⬜ TODO |
| 02 | [Task Title](02-filename.md) | [id] | 🔴/🟡/🟢 | ~X,000 | [dep] | ⬜ TODO |

---

## Dependency Graph

```
[Root dependency] ✅ COMPLETE
     │
     ▼
  Task 01: [Name] ──────── 🔴 CRITICAL PATH
     │
     ├──► Task 02: [Name] ──── 🟡 can start after 01
     │
     ├──► Task 03: [Name] ──── 🟡 can start after 01
     │
     └──► Task 04: [Name] ──── 🟢 needs 01 + 02
```

---

## Execution Order (Recommended)

### Sprint 1 — [Theme] (Tasks NN, NN)

1. **Task NN** — Title (~X,000 tokens)
2. **Task NN** — Title (~X,000 tokens)

**Sprint total:** ~XX,000 tokens

### Sprint 2 — [Theme] (Tasks NN, NN)

3. **Task NN** — Title (~X,000 tokens)

**Sprint total:** ~XX,000 tokens

---

## Token Estimation Method

| Factor | Basis |
|--------|-------|
| **JSX components** | ~25 tokens/line |
| **CSS files** | ~15 tokens/line |
| **Context/hooks** | ~30 tokens/line |
| **Backend routes** | ~28 tokens/line |
| **File modifications** | ~20 tokens/line |
| **Overhead** | +15% for imports, error handling, comments |

---

## Files Impact Summary

### New Files (Total: N)

| Category | Files |
|----------|-------|
| **Components** | `File1.jsx`, `File2.jsx` |
| **Styles** | `file.css` |
| **Hooks** | `useHook.js` |
| **Backend** | `route.js` |

### Modified Files (Total: N)

| File | Tasks |
|------|-------|
| `filename.ext` | 01, 02 |
