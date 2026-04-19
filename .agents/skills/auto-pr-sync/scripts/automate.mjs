// import { execSync } from 'child_process';
// import { createRequire } from 'module';
// import { fileURLToPath } from 'url';
// import { dirname, resolve } from 'path';
// import readline from 'readline';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Use the shared Playwright install from iprep/tests/playwrigh-tests
// const require = createRequire(import.meta.url);
// const playwrightPath = resolve(__dirname, '../../../../tests/playwrigh-tests/node_modules/playwright');
// const { chromium } = require(playwrightPath);

// const BASE_BRANCH = 'dev_branch';

// function runCmd(cmd) {
//   console.log(`Running: ${cmd}`);
//   try {
//     execSync(cmd, { stdio: 'inherit' });
//   } catch {
//     console.error(`Command failed: ${cmd}`);
//     process.exit(1);
//   }
// }

// async function prompt(question) {
//   const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
//   return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans); }));
// }

// async function main() {
//   const args = process.argv.slice(2);
//   const getArg = (name) => {
//     const idx = args.indexOf(name);
//     return idx !== -1 ? args[idx + 1] : null;
//   };

//   const branch = getArg('--branch');
//   const msg = getArg('--msg') || `Automated PR update for ${branch}`;
//   const prTitle = getArg('--pr-title') || msg;
//   const prBody = getArg('--pr-body') || '';
//   let repo = getArg('--repo');

//   if (!branch) {
//     console.error('Missing --branch argument');
//     process.exit(1);
//   }

//   if (!repo) {
//     try {
//       const remote = execSync('git config --get remote.origin.url').toString().trim();
//       const match = remote.match(/github\.com[:/](.+?)(?:\.git)?$/);
//       if (match) {
//         repo = match[1];
//       } else {
//         throw new Error('Could not parse repo from remote URL');
//       }
//     } catch {
//       console.error("Could not auto-detect repo. Provide --repo 'user/repo'");
//       process.exit(1);
//     }
//   }

//   // ─── Step 1: Git – checkout, commit, push ─────────────────────────────────
//   console.log(`\n--- Step 1: Git – publish ${branch} (base will be ${BASE_BRANCH}) ---`);

//   try {
//     execSync(`git show-ref --verify --quiet refs/heads/${branch}`);
//     runCmd(`git checkout ${branch}`);
//   } catch {
//     runCmd(`git checkout -b ${branch}`);
//   }

//   const status = execSync('git status --porcelain').toString().trim();
//   if (status) {
//     runCmd('git add .');
//     runCmd(`git commit -m "${msg}"`);
//   } else {
//     console.log('No local changes to commit.');
//   }

//   runCmd(`git push -u origin ${branch}`);

//   // ─── Step 2: Playwright – create PR → check conflicts → merge ─────────────
//   console.log(`\n--- Step 2: Playwright – create PR into ${BASE_BRANCH} ---`);

//   const browser = await chromium.launchPersistentContext('./playwright-session', {
//     headless: false,
//   });
//   const page = browser.pages()[0] || await browser.newPage();

//   // Ensure the user is logged in
//   await page.goto('https://github.com');
//   const loggedIn = await page.evaluate(() => !!document.querySelector('meta[name="user-login"]'));
//   if (!loggedIn) {
//     console.log('\n=== ACTION REQUIRED: Log into GitHub in the browser window ===\n');
//     await page.goto('https://github.com/login');
//     await page.waitForSelector('meta[name="user-login"]', { timeout: 0 });
//     console.log('Login successful! Continuing...');
//   }

//   // Navigate to PR creation page targeting dev_branch as base
//   const prUrl = `https://github.com/${repo}/compare/${BASE_BRANCH}...${branch}?expand=1`;
//   console.log(`Opening: ${prUrl}`);
//   await page.goto(prUrl);

//   // Fill PR title
//   try {
//     await page.waitForSelector('#pull_request_title', { timeout: 10000 });
//     await page.fill('#pull_request_title', prTitle);
//     console.log(`PR title: "${prTitle}"`);
//   } catch {
//     console.log('PR title field not found – no diff or PR already exists.');
//   }

//   // Fill PR description / body
//   if (prBody) {
//     try {
//       const bodyField = await page.$('#pull_request_body');
//       if (bodyField) {
//         await page.fill('#pull_request_body', prBody);
//         console.log('PR description filled.');
//       }
//     } catch {
//       console.log('Could not fill PR description.');
//     }
//   }

//   // Click "Create pull request"
//   const createBtn = await page.$("button:has-text('Create pull request')");
//   if (createBtn) {
//     await createBtn.click();
//     console.log('Clicked "Create pull request".');
//     await page.waitForTimeout(3000);
//   } else {
//     console.log('No "Create pull request" button – PR may already exist or branch has no diff.');
//   }

//   // ─── Conflict check – abort merge if conflicts exist ──────────────────────
//   const conflictBanner = await page.$('text=This branch has conflicts that must be resolved').catch(() => null);
//   if (conflictBanner) {
//     console.log('\n⚠️  MERGE CONFLICTS DETECTED – auto-merge skipped.');
//     console.log('Please resolve conflicts manually and re-run, or merge via the browser.');
//     await browser.close();
//     process.exit(0);
//   }

//   // ─── Merge PR into dev_branch ──────────────────────────────────────────────
//   const mergeBtn = await page.$("button:has-text('Merge pull request')");
//   if (mergeBtn) {
//     await mergeBtn.click();
//     console.log('Clicked "Merge pull request".');
//     try {
//       await page.waitForSelector("button:has-text('Confirm merge')", { timeout: 5000 });
//       const confirmBtn = await page.$("button:has-text('Confirm merge')");
//       if (confirmBtn) {
//         await confirmBtn.click();
//         console.log(`Merge into ${BASE_BRANCH} confirmed!`);
//         await page
//           .waitForSelector("text='Pull request successfully merged and closed'", { timeout: 15000 })
//           .catch(() => console.log('Proceeding after merge...'));
//       }
//     } catch {
//       console.log('Confirm merge button not found – check browser for current state.');
//     }
//   } else {
//     console.log('Merge button not found – may require review, be already merged, or have conflicts.');
//     await prompt('Press Enter after manually resolving the state, or to skip...');
//   }

//   await browser.close();

//   // ─── Step 3: Sync local dev_branch only ───────────────────────────────────
//   console.log(`\n--- Step 3: Sync local ${BASE_BRANCH} ---`);
//   runCmd(`git checkout ${BASE_BRANCH}`);
//   runCmd(`git pull origin ${BASE_BRANCH}`);

//   console.log(`\n✅ Done! Branch "${branch}" merged into ${BASE_BRANCH} and local branch synced.`);
// }

// main().catch((err) => {
//   console.error(err);
//   process.exit(1);
// });
