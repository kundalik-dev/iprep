To make your **behind** and **ahead** counts equal (specifically, to make "behind" 0), you need to integrate the latest changes from `main` into your feature branches. **Rebase** is the best way to do this because it keeps your project history clean and linear.

Based on your [current branch list](https://github.com/kundalik-dev/iprep/branches), here are the exact commands to sync your branches.

---

### Step 1: Update your local `main`

Before rebasing, ensure your local copy of `main` is perfectly in sync with the remote GitHub version.

```bash
git checkout main
git pull origin main
```

### Step 2: Rebase `dev_branch`

Your `dev_branch` is currently **4 behind**. This will move your unique commits to the top of the new commits from `main`.

```bash
git checkout dev_branch
git rebase main
```

_Note: If there are merge conflicts, Git will pause. Fix the files, then run `git rebase --continue`._

**Push the changes:** Since rebasing rewrites history, you must use a "force" push.

```bash
git push origin dev_branch --force-with-lease
```

### Step 3: Rebase `feat_branch`

Your `feat_branch` is **6 behind**. Repeat the same process:

```bash
git checkout feat_branch
git rebase main
git push origin feat_branch --force-with-lease
```

---

### Understanding the Results

After running these commands, your branch status on GitHub will change:

| Metric     | Before | After                                                          |
| :--------- | :----- | :------------------------------------------------------------- |
| **Behind** | 4 or 6 | **0** (You have all the latest code from main)                 |
| **Ahead**  | 0      | **Unchanged** (You still have your unique work ready to merge) |

> [!IMPORTANT]
> Always use `--force-with-lease` instead of a standard `-f`. It is a safety mechanism that ensures you don't accidentally overwrite someone else's work on the remote server if they pushed code while you were rebasing.

Are you planning to merge these into `main` once they are synced, or are you keeping them separate for further development?
