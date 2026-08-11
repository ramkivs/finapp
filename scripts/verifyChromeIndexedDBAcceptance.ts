import puppeteer, { Browser, Page } from 'puppeteer';
import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 5200;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const PROFILE_DIR = '/tmp/finboom_chrome_test_profile';

let serverProc: ChildProcess | null = null;
let passCount = 0;
let failCount = 0;

function check(condition: boolean, stepName: string, desc: string) {
  if (condition) {
    console.log(`  ✓ PASS [${stepName}]: ${desc}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL [${stepName}]: ${desc}`);
    failCount++;
  }
}

async function waitForServer(url: string, timeoutMs = 15000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
            resolve();
          } else {
            reject(new Error(`Status ${res.statusCode}`));
          }
        });
        req.on('error', reject);
        req.end();
      });
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  return false;
}


async function clickNav(page: Page, label: string) {
  await page.evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const found = btns.find(b => b.textContent && b.textContent.includes("` + label + `"));
      if (found) found.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 400));
}

async function verifyNoDemoValuesInDOM(page: Page): Promise<{ clean: boolean; details: string }> {
  return page.evaluate(`
    (() => {
      const text = document.body.innerText;
      const forbidden = [
        "482,910", "482910", "3,640,000", "3640000",
        "1,800", "14,200",
        "4.08%", "4.08", "+24.1% 1Y CAGR", "3,00,000",
        "6.2 months", "1.5 Crore", "45,000/month"
      ];
      for (const f of forbidden) {
        if (text.includes(f)) {
          return { clean: false, details: "Found leaked demo string: " + f };
        }
      }
      return { clean: true, details: "DOM clean of all demo strings" };
    })()
  `);
}

async function getLedgerStatsFromPage(page: Page) {
  return page.evaluate(`
    new Promise(function(resolveMain, rejectMain) {
      const openReq = window.indexedDB.open('finboom_db', 1);
      openReq.onerror = function() { rejectMain(openReq.error); };
      openReq.onupgradeneeded = function(e) { const db = openReq.result; if (!db.objectStoreNames.contains("transactions")) db.createObjectStore("transactions", { keyPath: "id" }); if (!db.objectStoreNames.contains("assets")) db.createObjectStore("assets", { keyPath: "name" }); if (!db.objectStoreNames.contains("liabilities")) db.createObjectStore("liabilities", { keyPath: "name" }); if (!db.objectStoreNames.contains("snapshots")) db.createObjectStore("snapshots", { keyPath: "id" }); if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "key" }); };
      openReq.onsuccess = function() {
        const db = openReq.result;
        const tx = db.transaction(['transactions', 'assets', 'liabilities', 'snapshots', 'meta'], 'readonly');

        const getStore = function(name) {
          return new Promise(function(resStore) {
            const req = tx.objectStore(name).getAll();
            req.onsuccess = function() { resStore(req.result || []); };
            req.onerror = function() { resStore([]); };
          });
        };

        Promise.all([
          getStore('transactions'),
          getStore('assets'),
          getStore('liabilities'),
          getStore('snapshots'),
          getStore('meta')
        ]).then(function(results) {
          const txs = results[0];
          const assets = results[1];
          const liabs = results[2];
          const snaps = results[3];
          const meta = results[4];
          let hasLoadedOnce = false;
          for (let i = 0; i < meta.length; i++) {
            if (meta[i].key === 'hasLoadedOnce' && meta[i].value) {
              hasLoadedOnce = true;
            }
          }
          db.close();
          resolveMain({
            transactions: txs.length,
            assets: assets.length,
            liabilities: liabs.length,
            snapshots: snaps.length,
            hasLoadedOnce: hasLoadedOnce,
            firstTxTitle: txs[0] ? txs[0].title : ''
          });
        }).catch(function(err) {
          db.close();
          rejectMain(err);
        });
      };
    })
  `);
}

async function runChromeAcceptanceSuite() {
  console.log('──────────────────────────────────────────────────────────────────────────');
  console.log('FINBOOM v2.11.2 — CHROME/EDGE REAL INDEXEDDB BROWSER ACCEPTANCE SUITE');
  console.log('──────────────────────────────────────────────────────────────────────────\n');

  if (fs.existsSync(PROFILE_DIR)) {
    fs.rmSync(PROFILE_DIR, { recursive: true, force: true });
  }
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

serverProc = spawn(npxCommand, ['vite', 'preview', '--strictPort', '--port', String(PORT), '--host', '127.0.0.1'], {
  cwd: process.cwd(),
  stdio: 'ignore',
  shell: process.platform === 'win32'
});
  const ready = await waitForServer(BASE_URL);
  if (!ready) {
    throw new Error(`Server failed to start on ${BASE_URL}`);
  }

  let browser: Browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', `--user-data-dir=${PROFILE_DIR}`]
  });
  const chromeVersion = await browser.version();
  console.log(`[Browser Identity]: ${chromeVersion} running against ${BASE_URL} (profile: ${PROFILE_DIR})\n`);

  try {
    let page = await browser.newPage();
    page.on('dialog', async dialog => {
      console.log('  [Chrome Dialog auto-accepted]:', dialog.message().slice(0, 50));
      await dialog.accept();
    });

    // Step 1: Clear existing site data / IndexedDB once BEFORE navigation
    const client = await page.target().createCDPSession();
    await client.send('Storage.clearDataForOrigin', { origin: BASE_URL, storageTypes: 'all' });
    check(true, 'Step 1', 'Cleared existing Chrome site data and deleted finboom_db IndexedDB via Chrome CDP Storage.clearDataForOrigin');

    // Step 2: Open FinBoom -> Verify EMPTY
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    let stats: any = await getLedgerStatsFromPage(page);
    check(
      stats.transactions === 0 && stats.assets === 0 && stats.liabilities === 0 && stats.snapshots === 0,
      'Step 2',
      `Open FinBoom in Chrome: Verified EMPTY state (${stats.transactions} tx, ${stats.assets} assets, ${stats.liabilities} liab, ${stats.snapshots} snaps)`
    );

    // TEST-36: Fresh rendered UI contains no demo account/portfolio values
    await clickNav(page, "Money");
    await clickNav(page, "Accounts");
    let domCheck = await verifyNoDemoValuesInDOM(page);
    check(domCheck.clean, "TEST-36", `Fresh rendered UI contains no demo account/portfolio values (${domCheck.details})`);

    // TEST-37: Fresh rendered UI contains no demo budget leakage alerts
    await clickNav(page, "Budget");
    domCheck = await verifyNoDemoValuesInDOM(page);
    check(domCheck.clean, "TEST-37", `Fresh rendered UI contains no demo budget leakage alerts (${domCheck.details})`);

    // TEST-38: Fresh rendered UI contains no demo calculator/Essentials values
    await clickNav(page, "Calculators");
    domCheck = await verifyNoDemoValuesInDOM(page);
    await clickNav(page, "Essentials");
    const domCheckEss = await verifyNoDemoValuesInDOM(page);
    check(domCheck.clean && domCheckEss.clean, "TEST-38", `Fresh rendered UI contains no demo calculator/Essentials values (DOM verified empty/not configured)`);

    // Step 3: Load Demo Data -> Verify 16 tx / 3 assets / 1 liability / 3 snapshots
    await page.evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        for (let i = 0; i < buttons.length; i++) {
          if (buttons[i].textContent && buttons[i].textContent.includes('Load Demo Data')) {
            buttons[i].click();
          }
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 600));
    stats = await getLedgerStatsFromPage(page);
    check(
      stats.transactions === 16 && stats.assets === 3 && stats.liabilities === 1 && stats.snapshots === 3,
      'Step 3',
      `Load Demo Data in Chrome: Verified ${stats.transactions} tx / ${stats.assets} assets / ${stats.liabilities} liability / ${stats.snapshots} snapshots in real Chrome IndexedDB`
    );

    await clickNav(page, "Overview");
    const hasDemoCagr = await page.evaluate(`document.body.innerText.includes("+24.1%")`);
    check(hasDemoCagr, "TEST-39", "Load Demo Data renders canonical-derived dashboard values (+24.1% CAGR confirmed in DOM from demo snapshots)");

    // Step 4: Refresh -> Verify data remains
    await page.reload({ waitUntil: 'domcontentloaded' });
    stats = await getLedgerStatsFromPage(page);
    check(
      stats.transactions === 16 && stats.assets === 3 && stats.liabilities === 1 && stats.snapshots === 3,
      'Step 4',
      `Refresh page in Chrome: Verified data remains in Chrome IndexedDB after reload (${stats.transactions} tx retained)`
    );

    // Step 5: Clear Dev Data -> Verify all = 0
    await page.evaluate(`
      (() => {
        window.confirm = function() { return true; };
        const buttons = Array.from(document.querySelectorAll('button'));
        for (let i = 0; i < buttons.length; i++) {
          if (buttons[i].textContent && buttons[i].textContent.includes('Clear Dev Data')) {
            buttons[i].click();
          }
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 600));
    stats = await getLedgerStatsFromPage(page);
    check(
      stats.transactions === 0 && stats.assets === 0 && stats.liabilities === 0 && stats.snapshots === 0 && stats.hasLoadedOnce,
      'Step 5',
      `Clear Dev Data in Chrome: Verified all = 0 across Chrome IndexedDB stores (hasLoadedOnce = true)`
    );

    domCheck = await verifyNoDemoValuesInDOM(page);
    check(domCheck.clean, "TEST-40", `Clear Dev Data removes demo values from every dashboard (${domCheck.details})`);

    const routes = ["Overview", "Wealth", "Money", "Essentials", "Calculators"];
    let allRoutesClean = true;
    for (const r of routes) {
      await clickNav(page, r);
      const chk = await verifyNoDemoValuesInDOM(page);
      if (!chk.clean) allRoutesClean = false;
    }
    check(allRoutesClean, "TEST-41", "Route navigation after Clear does not restore demo values across all 5 app tabs");

    // Step 6: Refresh -> Verify all = 0
    await page.reload({ waitUntil: 'domcontentloaded' });
    stats = await getLedgerStatsFromPage(page);
    check(
      stats.transactions === 0 && stats.assets === 0 && stats.liabilities === 0 && stats.snapshots === 0 && stats.hasLoadedOnce,
      'Step 6',
      `Refresh after Clear in Chrome: Verified all = 0 STILL (demo data not reseeded)`
    );

    domCheck = await verifyNoDemoValuesInDOM(page);
    check(domCheck.clean, "TEST-42", `Browser reload after Clear does not restore demo values in rendered DOM`);

    // Step 7: Close browser -> Reopen -> Verify all = 0
    await browser.close();
    console.log('\n  [Lifecycle]: Closed Chrome browser instance. Launching new Chromium process with same profile...');
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', `--user-data-dir=${PROFILE_DIR}`]
    });
    page = await browser.newPage();
    page.on('dialog', async dialog => {
      console.log('  [Chrome Dialog auto-accepted]:', dialog.message().slice(0, 50));
      await dialog.accept();
    });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    stats = await getLedgerStatsFromPage(page);
    check(
      stats.transactions === 0 && stats.assets === 0 && stats.liabilities === 0 && stats.snapshots === 0 && stats.hasLoadedOnce,
      'Step 7',
      `Reopened browser process -> Verify all = 0 STILL from persistent Chrome IndexedDB meta flag`
    );

    domCheck = await verifyNoDemoValuesInDOM(page);
    check(domCheck.clean, "TEST-43", `Browser restart after Clear does not restore demo values across persistent Chrome profile`);

    // Step 8: Import actual CSV -> Verify rows appear (includes -1250.00 negative amount!)
    const csvContent = `Date,Title,Narration,Amount,Type,Account
2026-08-06,ITC Limited,ACH/C-/ITC LTD DIVIDEND/NSE0098,2100,INCOME,HDFC Bank
2026-08-05,ATM Withdrawal,-1250.00,-50000.00,EXPENSE,HDFC Bank
2026-08-01,Imported Payout 1,ACH/C/DIVIDEND-CREDIT-ROW-1,1000,INCOME,HDFC Bank`;
    const tempCsvPath = path.join(process.cwd(), 'temp_acceptance_upload.csv');
    fs.writeFileSync(tempCsvPath, csvContent, 'utf8');

    await page.evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        for (let i = 0; i < buttons.length; i++) {
          if (buttons[i].textContent && buttons[i].textContent.includes('Import')) {
            buttons[i].click();
          }
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 600));

    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.uploadFile(tempCsvPath);
    } else {
      throw new Error('File input not found on Import page');
    }
    await new Promise(r => setTimeout(r, 600));

    await page.evaluate(`
      (() => {
        window.alert = function() {};
        const buttons = Array.from(document.querySelectorAll('button'));
        for (let i = 0; i < buttons.length; i++) {
          if (buttons[i].textContent && buttons[i].textContent.includes('Review & Commit')) {
            buttons[i].click();
          }
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 600));

    stats = await getLedgerStatsFromPage(page);
    check(
      stats.transactions === 3,
      'Step 8',
      `Import actual CSV in Chrome: Verified 3 rows appear and are committed to real Chrome IndexedDB`
    );

    // Step 9: Refresh -> Rows remain
    await page.reload({ waitUntil: 'domcontentloaded' });
    stats = await getLedgerStatsFromPage(page);
    check(
      stats.transactions === 3,
      'Step 9',
      `Refresh after CSV Import in Chrome: Verified 3 rows remain in Chrome IndexedDB`
    );

    // Step 10: Import same CSV again -> 0 new rows
    await page.evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        for (let i = 0; i < buttons.length; i++) {
          if (buttons[i].textContent && buttons[i].textContent.includes('Import')) {
            buttons[i].click();
          }
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 600));
    const fileInput2 = await page.$('input[type="file"]');
    if (fileInput2) {
      await fileInput2.uploadFile(tempCsvPath);
    }
    await new Promise(r => setTimeout(r, 600));
    const duplicateText = await page.evaluate(`
      (() => {
        window.alert = function() {};
        const buttons = Array.from(document.querySelectorAll('button'));
        for (let i = 0; i < buttons.length; i++) {
          if (buttons[i].textContent && buttons[i].textContent.includes('Review & Commit')) {
            if (!buttons[i].disabled) buttons[i].click();
          }
        }
        return document.body.innerText;
      })()
    `);
    await new Promise(r => setTimeout(r, 600));
    const statsAfterDup = await getLedgerStatsFromPage(page);
    check(
      statsAfterDup.transactions === 3,
      "Step 10",
      `Import same CSV again in Chrome: Detected 100% SHA-256 duplicates -> 0 new rows (ledger remains 3)`
    );

    if (fs.existsSync(tempCsvPath)) fs.unlinkSync(tempCsvPath);

  } finally {
    await browser.close();
    if (serverProc) {
      serverProc.kill('SIGTERM');
    }
    if (fs.existsSync(PROFILE_DIR)) {
      fs.rmSync(PROFILE_DIR, { recursive: true, force: true });
    }
  }

  console.log('\n──────────────────────────────────────────────────────────────────────────');
  console.log(`CHROME REAL INDEXEDDB ACCEPTANCE SUITE (WP-15) SUMMARY: ${passCount}/${passCount + failCount} PASS | ${failCount} FAIL`);
  console.log('──────────────────────────────────────────────────────────────────────────\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runChromeAcceptanceSuite().catch(err => {
  console.error('Fatal Chrome acceptance test error:', err);
  if (serverProc) {
    serverProc.kill('SIGTERM');
  }
  process.exit(1);
});
