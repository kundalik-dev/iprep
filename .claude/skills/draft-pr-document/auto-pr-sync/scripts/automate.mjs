import { execSync } from 'child_process';
import { chromium } from 'playwright';
import readline from 'readline';

function runCmd(cmd) {
  console.log(`Running: ${cmd}`);
  try {
    const output = execSync(cmd, { stdio: 'inherit' });
    return output;
  } catch (error) {
    console.error(`Command failed: ${cmd}`);
    process.exit(1);
  }
}

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(question, (ans) => {
    rl.close();
    resolve(ans);
  }));
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name) => {
    const idx = args.indexOf(name);
    return idx !== -1 ? args[idx + 1] : null;
  };

  const branch = getArg('--branch');
  const msg = getArg('--msg') || `Automated PR update for ${branch}`;
  let repo = getArg('--repo');

  if (!branch) {
    console.error("Missing --branch argument");
    process.exit(1);
  }

  if (!repo) {
    try {
      const gitRemote = execSync('git config --get remote.origin.url').toString().trim();
      const match = gitRemote.match(/github\.com[:/](.+)\.git/);
      if (match) {
        repo = match[1];
      } else {
        throw new Error("Parse failed");
      }
    } catch {
      console.warn("Could not auto-detect repo from git remote. Please provide --repo 'user/repo'");
      process.exit(1);
    }
  }

  console.log('--- Step 1: Git Branch & Publish ---');
  // Attempt to checkout branch, if it doesn't exist, create it.
  try {
    execSync(`git show-ref --verify --quiet refs/heads/${branch}`);
    runCmd(`git checkout ${branch}`);
  } catch {
    runCmd(`git checkout -b ${branch}`);
  }
  
  // Add and commit changes
  try {
    const status = execSync('git status --porcelain').toString().trim();
    if (status) {
      runCmd('git add .');
      runCmd(`git commit -m "${msg}"`);
    } else {
      console.log('No local changes to commit.');
    }
  } catch (e) {
    console.log('Commit step passed or no changes.');
  }

  runCmd(`git push -u origin ${branch}`);

  console.log('\n--- Step 2: Playwright UI Automation ---');
  console.log('Opening browser for PR creation and merging...');

  // Use a persistent context so session is saved between runs if possible
  const userDataDir = './playwright-session';
  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: false // Needs to be visible for potential 2FA
  });

  const page = browser.pages()[0] || await browser.newPage();

  // 1. Check if logged in
  await page.goto('https://github.com');
  const loggedIn = await page.evaluate(() => !!document.querySelector('meta[name="user-login"]'));

  if (!loggedIn) {
    console.log('\n======================================================');
    console.log('❗ ACTION REQUIRED: Please log into GitHub in the browser window.');
    console.log('======================================================\n');
    await page.goto('https://github.com/login');
    // Wait until login completes and we are redirected to dashboard
    await page.waitForSelector('meta[name="user-login"]', { timeout: 0 }); // wait forever for user to login
    console.log('Login successful! Proceeding...');
  }

  // 2. Navigate to PR Creation Page (Assuming base is dev_branch or main, we'll let GH default or use main)
  // Usually the URL to create a PR is: https://github.com/<repo>/compare/<base>...<compare>
  // Let's compare against main 
  const prCompareUrl = `https://github.com/${repo}/compare/main...${branch}?expand=1`;
  console.log(`Navigating to PR creation URL: ${prCompareUrl}`);
  await page.goto(prCompareUrl);

  // Wait for the Create pull request button to be visible
  try {
    await page.waitForSelector('button[class*="js-details-target btn-primary"]', { timeout: 10000 });
  } catch {
    console.log("Could not find the PR Create button. The branch might not have diffs with base, or already has a PR.");
  }

  // Click standard create PR button if exists
  const createPrBtn = await page.$("button:has-text('Create pull request')");
  if (createPrBtn) {
    await createPrBtn.click();
    console.log('Clicked "Create pull request" button.');
    // Wait for the PR to be created (the merge button appears)
    await page.waitForSelector("button:has-text('Merge pull request')", { timeout: 15000 });
  }

  // 3. Merge PR
  const mergeBtn = await page.$("button:has-text('Merge pull request')");
  if (mergeBtn) {
    await mergeBtn.click();
    console.log('Clicked "Merge pull request" button.');
    
    await page.waitForSelector("button:has-text('Confirm merge')", { timeout: 5000 });
    const confirmMergeBtn = await page.$("button:has-text('Confirm merge')");
    if (confirmMergeBtn) {
      await confirmMergeBtn.click();
      console.log('Merge confirmed!');
      await page.waitForSelector("text='Pull request successfully merged and closed'", { timeout: 15000 }).catch(() => console.log('Merge success text not explicitly found, but proceeding.'));
    }
  } else {
    console.log('Merge button not found. Could be already merged, requires reviews, or has conflicts.');
    const pause = await prompt('Press Enter when you have manually resolved the UI state, or to skip...');
  }

  await browser.close();

  console.log('\n--- Step 3: Resynchronize Local Branches ---');
  // Sync main
  runCmd('git checkout main');
  runCmd('git pull origin main');

  // Sync dev_branch
  try {
    runCmd('git checkout dev_branch');
    runCmd('git pull origin dev_branch'); // Could theoretically merge main here if dev_branch trails
  } catch (e) {
    console.log('Could not automatically sync dev_branch. The branch may not exist locally.');
  }

  console.log('\n✅ PR Automation Workflow Complete!');
}

main().catch(console.error);
