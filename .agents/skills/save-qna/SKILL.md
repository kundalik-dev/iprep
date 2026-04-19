---
name: save-qna
description: Save a question and its answer to the my-knowledge docs folder. Use when user asks "/save-qna <question>" or "save this question" or "add this to my knowledge".
argument-hint: '<your question here>'
allowed-tools: Read
  Write
  Glob
  Bash
---

# Save Q&A to My Knowledge

The user asked a question. Your job is to **answer it and save it to the right file** — do NOT print the full answer in the terminal.

---

## Step 1: Read the question

The question is in `$ARGUMENTS`. If empty, ask: "What is your question?"

---

## Step 2: Detect the topic folder

Pick the best matching folder based on keywords in the question:

| Keywords in question                             | Folder     |
| ------------------------------------------------ | ---------- |
| shared, schema, zod, constants, types            | `shared`   |
| server, express, api, route, websocket           | `server`   |
| frontend, react, vite, component, ui             | `frontend` |
| cli, command, iprep init, doctor                 | `cli`      |
| db, prisma, database, sqlite, query              | `db`       |
| llm, provider, adapter, claude, gemini, deepgram | `llm`      |
| git, branch, commit, pr                          | `git`      |
| anything else                                    | `general`  |

Base path: `docs/ai-help/my-knowledge/<folder>/`

---

## Step 3: Find or create the file

1. Run `ls docs/ai-help/my-knowledge/<folder>/` to list existing files.
2. Pick the most relevant file based on the topic (e.g. `01-SHARED-PACKAGE-QNA.md` for shared questions).
3. If no file exists yet, create one named `01-<FOLDER>-QNA.md` with this frontmatter:

```md
---
name: 'Q&A on <folder> package'
description: 'Questions and answers about <folder>'
---
```

---

## Step 4: Find the next question number

Read the file and count existing `## Q<n>` headings. Next number = count + 1.

---

## Step 5: Write the short answer

Write a **short, clear answer** — aim for understanding, not completeness:

- Max 3-4 small sections
- Use a simple example if it helps
- One-line summary at the end
- Use code blocks for any code

---

## Step 6: Append to the file

Append this block at the end of the file:

```md
## Q<n> - <question title>

## Q<n> - ANS

<your short answer here>

---
```

Do NOT rewrite the whole file — only append.

---

## Step 7: Confirm to user (terminal)

Print only this — nothing else:

```
Saved → docs/ai-help/my-knowledge/<folder>/<filename>.md (Q<n>)
```
