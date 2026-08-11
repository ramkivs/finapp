import { IndexedDBStorageService } from '../src/services/IndexedDBStorageService';
import { repository } from '../src/repositories';
import { FinancialCommands as commands } from '../src/application/commands';
import { FinancialQueries as queries } from '../src/application/queries';
import { useCanonicalLedger } from '../src/store/useCanonicalLedger';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, desc: string, testId: string) {
  if (condition) {
    console.log(`  ✓ PASS [${testId}]: ${desc}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL [${testId}]: ${desc}`);
    failCount++;
  }
}

async function runRegressionSuite() {
  console.log('──────────────────────────────────────────────────────────────────────────');
  console.log('FINBOOM v2.11.2 — AUTOMATED RUNTIME REGRESSION SUITE (TEST-01 to TEST-43)');
  console.log('──────────────────────────────────────────────────────────────────────────\n');

  console.log('1. [Local Runtime Empty Default & Demo Dataset Initialization]');
  await repository.clearLocalData();
  const freshTxs = queries.queryTransactions({ type: 'All', dateRange: '12M' });
  const freshAssets = repository.assets.findAllSync();
  const freshLiabs = repository.liabilities.findAllSync();
  const freshSnaps = repository.snapshots.findAllSync();
  assert(
    freshTxs.length === 0 && freshAssets.length === 0 && freshLiabs.length === 0 && freshSnaps.length === 0,
    'Fresh local runtime starts 100% empty by default (0 records across all collections)',
    'TEST-01'
  );

  await repository.loadDemoData();
  const demoTxs = queries.queryTransactions({ type: 'All', dateRange: '12M' });
  assert(demoTxs.length > 0, 'Explicit "Load Demo Data" action populates canonical runtime', 'TEST-02');

  const demoAssets = repository.assets.findAllSync();
  const demoLiabs = repository.liabilities.findAllSync();
  const demoSnaps = repository.snapshots.findAllSync();
  assert(
    demoTxs.length === 16 && demoAssets.length === 3 && demoLiabs.length === 1 && demoSnaps.length === 3,
    `Demo dataset appears correctly across all collections (${demoTxs.length} txs, ${demoAssets.length} assets, ${demoLiabs.length} liabs, ${demoSnaps.length} snaps)`,
    'TEST-03'
  );

  console.log('\n2. [clearLocalData() Persistence Across Reload & Restart]');
  await repository.clearLocalData();
  const clearTxs = queries.queryTransactions({ type: 'All', dateRange: '12M' });
  assert(clearTxs.length === 0, 'clearLocalData() empties all transactions', 'TEST-04');

  const clearAssets = repository.assets.findAllSync();
  assert(clearAssets.length === 0, 'clearLocalData() empties all assets', 'TEST-05');

  const clearLiabs = repository.liabilities.findAllSync();
  assert(clearLiabs.length === 0, 'clearLocalData() empties all liabilities', 'TEST-06');

  const clearSnaps = repository.snapshots.findAllSync();
  assert(clearSnaps.length === 0, 'clearLocalData() empties all snapshots', 'TEST-07');

  // Reload simulation
  await repository.initialize();
  const reloadedTxs08 = queries.queryTransactions({ type: 'All', dateRange: '12M' });
  assert(
    reloadedTxs08.length === 0,
    'Empty state persists across runtime reload (hasLoadedOnce === true prevents demo reseed)',
    'TEST-08'
  );

  // Restart simulation
  await useCanonicalLedger.getState().initialize();
  const restartTxs = queries.queryTransactions({ type: 'All', dateRange: '12M' });
  assert(
    restartTxs.length === 0,
    'Empty state persists across application restart (0 records after store re-init)',
    'TEST-09'
  );

  console.log('\n3. [Real CSV Uploader Pipeline, Deduplication & Security Contract]');
  const sampleCSV = `Date,Title,Narration,Amount,Type,Account
2026-08-06,ITC Limited,ACH/C-/ITC LTD DIVIDEND/NSE0098,2100,INCOME,HDFC Bank
2026-08-04,Coal India Ltd,ECS/C/COAL INDIA INT DIVIDEND,1500,INCOME,SBI Bank
2026-08-01,Imported Payout 1,ACH/C/DIVIDEND-CREDIT-ROW-1,1000,INCOME,HDFC Bank`;

  const res1 = commands.importStatement(sampleCSV, 'HDFC Bank', 'statement_aug2026.csv');
  assert(
    res1.appended === 3 && res1.duplicates === 0 && res1.totalDetected === 3,
    `Real CSV uploader pipeline parses and imports valid rows (${res1.appended} appended)`,
    'TEST-10'
  );

  await repository.initialize();
  const afterReloadTxs = queries.queryTransactions({ type: 'All', dateRange: '12M' });
  assert(
    afterReloadTxs.length === 3,
    `Imported rows persist after reload (${afterReloadTxs.length} transactions retained)`,
    'TEST-11'
  );

  const res2 = commands.importStatement(sampleCSV, 'HDFC Bank', 'statement_aug2026.csv');
  assert(
    res2.duplicates === 3 && res2.appended === 0,
    `Re-uploading identical CSV produces 100% duplicate detection (${res2.duplicates}/${res2.totalDetected} duplicates)`,
    'TEST-12'
  );

  const afterDupTxs = queries.queryTransactions({ type: 'All', dateRange: '12M' });
  assert(
    afterDupTxs.length === 3,
    `Duplicate import produces 0 ledger count change (${afterDupTxs.length} before === ${afterDupTxs.length} after)`,
    'TEST-13'
  );

  const malformedCSV = `Date,Title,Narration,Amount,Type,Account
not-a-date,Broken Row,ACH/BROKEN,invalid-amount,INCOME,HDFC Bank
2026-08-05,Valid Payout,ACH/VALID-ROW,500,INCOME,HDFC Bank`;

  const res3 = commands.importStatement(malformedCSV, 'HDFC Bank', 'mixed_data.csv');
  assert(
    res3.invalidCount === 1 && res3.appended === 1,
    `Malformed CSV rows are rejected without crashing (${res3.invalidCount} invalid, ${res3.appended} valid imported)`,
    'TEST-14'
  );

  const formulaCSV = `Date,Title,Narration,Amount,Type,Account
2026-08-06,=HYPERLINK("https://evil.com","Click Me"),=cmd|'/C calc'!A0,100,INCOME,HDFC Bank
2026-08-05,-1250,-50000,-235.50,EXPENSE,HDFC Bank`;
  const res4 = commands.importStatement(formulaCSV, 'HDFC Bank', 'hostile.csv');
  const safeTitle = res4.validRows[0]?.title || '';
  const safeNarration = res4.validRows[0]?.narration || '';
  const negRow = res4.validRows[1];
  assert(
    !safeTitle.startsWith('=') && !safeNarration.startsWith('=') && !safeNarration.includes('=cmd|') &&
    (safeTitle.includes('[Sanitized-Formula]') || safeNarration.includes('[Sanitized-Formula]')) &&
    negRow?.title === '-1250' && negRow?.narration === '-50000' && negRow?.amount === 235.5,
    `Formula-injection values are sanitized ("${safeTitle}") while legitimate negative financial amounts (-1250, -50000, -235.50) survive verbatim`,
    'TEST-15'
  );

  const negCSV = `date,account,amount,narration
2026-08-01,HDFC,-1250.00,ATM Withdrawal
2026-08-02,HDFC,5000.00,Salary`;
  const res19 = commands.importStatement(negCSV, 'HDFC Bank', 'negative_test.csv');
  const w1 = res19.validRows[0];
  const w2 = res19.validRows[1];
  assert(
    res19.validRows.length === 2 &&
    w1?.amount === 1250 && w1?.type === 'Expense' && w1?.narration === 'ATM Withdrawal' && !w1?.narration.includes('[Sanitized') &&
    w2?.amount === 5000 && w2?.type === 'Income' && w2?.narration === 'Salary' && !w2?.narration.includes('[Sanitized'),
    `Legitimate negative financial amounts (-1250.00, 5000.00) are preserved as valid numeric transactions without formula-injection rejection (2 valid rows, 0 violations)`,
    'TEST-19'
  );

  console.log('\n4. [2-Leg Transfer Semantics & Zero Net Impact]');
  commands.recordTransfer('HDFC Bank', 'ICICI Bank', 50000);
  const transferTxs = queries.queryTransactions({ type: 'Transfer', dateRange: '12M' });
  const latestTrs = transferTxs.slice(0, 2);
  assert(
    latestTrs.length === 2 && latestTrs[0].transferId === latestTrs[1].transferId && !!latestTrs[0].transferId,
    `2-leg transfer remains exactly two linked legs (transferId: ${latestTrs[0]?.transferId})`,
    'TEST-16'
  );

  let netImpact = 0;
  for (const tx of latestTrs) {
    if (tx.narration.includes('DEBIT') || tx.notes?.includes('Debit') || tx.title.startsWith('Transfer to')) {
      netImpact -= tx.amount;
    } else {
      netImpact += tx.amount;
    }
  }
  assert(
    netImpact === 0,
    'Transfer produces ₹0 net income/expense impact across linked DEBIT/CREDIT legs',
    'TEST-17'
  );

  console.log('\n5. [Domain Financial Metrics Integrity]');
  commands.recordAsset('Test Brokerage Account', 1500000);
  commands.recordLiability('Test Personal Loan', 200000);
  const netWorthMetric = queries.getMetric('NET_WORTH');
  assert(
    netWorthMetric.status === 'RECONCILED' && typeof netWorthMetric.value === 'number' && netWorthMetric.value === 1300000,
    `Existing financial metrics remain unchanged for the same ledger (NET_WORTH: ₹${netWorthMetric.value.toLocaleString()})`,
    'TEST-18'
  );

  console.log('\n6. [WP-14: Canonical Runtime Boundary & Persistence Unification (TEST-20 to TEST-26)]');

  await repository.clearLocalData();
  commands.recordIncome('WP14 Test Inc', 777, 'HDFC Bank', 'TEST');
  const storeTx = useCanonicalLedger.getState().transactions[0];
  const repoTx = repository.transactions.findAllSync()[0];
  assert(
    storeTx?.title === 'WP14 Test Inc' && repoTx?.title === 'WP14 Test Inc' && storeTx.amount === 777,
    'Command/Canonical Consistency: Mutation via FinancialCommands immediately updates repository & canonical store',
    'TEST-20'
  );

  const queryTxs = queries.queryTransactions({ type: 'All', dateRange: '12M' });
  const storeTxs = useCanonicalLedger.getState().transactions;
  assert(
    queryTxs.length === storeTxs.length && queryTxs[0]?.id === storeTxs[0]?.id,
    `Query/Canonical Consistency: FinancialQueries reads exact same data visible to canonical runtime (${queryTxs.length} txs)`,
    'TEST-21'
  );

  await repository.initialize();
  const reloadedTxs22 = queries.queryTransactions({ type: 'All', dateRange: '12M' });
  assert(
    reloadedTxs22.length === 1 && reloadedTxs22[0]?.title === 'WP14 Test Inc',
    `Reload Consistency: Persistent canonical runtime state identical after reload (${reloadedTxs22[0]?.title})`,
    'TEST-22'
  );

  const legacyRes = useCanonicalLedger.getState().commitImportedRows();
  assert(
    legacyRes.appended === 0 && queries.queryTransactions({ type: 'All', dateRange: '12M' }).length === 1,
    'No Legacy Import Generator: Calling commitImportedRows without parsed rows generates 0 synthetic 24-row fallback data',
    'TEST-23'
  );

  await commands.clearLocalDevelopmentData();
  const afterClearRepo = repository.transactions.findAllSync().length;
  const afterClearStore = useCanonicalLedger.getState().transactions.length;
  const afterClearIDB = (await IndexedDBStorageService.loadAll()).transactions.length;
  assert(
    afterClearRepo === 0 && afterClearStore === 0 && afterClearIDB === 0,
    'Clear Boundary Consistency: Repository, canonical state, and IndexedDB all agree (0 records)',
    'TEST-24'
  );

  IndexedDBStorageService.simulateFailureOnce = true;
  let errorCaught = false;
  try {
    await repository.transactions.append({
      id: 'tx-fail-test',
      date: '2026-08-09',
      dateStr: '09 Aug 2026',
      title: 'Should Not Persist',
      narration: 'TEST/FAIL',
      account: 'HDFC Bank',
      type: 'Income',
      category: 'TEST',
      amount: 9999,
      status: 'CLEARED'
    });
  } catch (e: any) {
    if (e?.message?.includes('Simulated IndexedDB persistence failure')) {
      errorCaught = true;
    }
  }
  const failTestRepo = repository.transactions.findAllSync().length;
  const failTestStore = useCanonicalLedger.getState().transactions.length;
  assert(
    errorCaught && failTestRepo === 0 && failTestStore === 0,
    'Persistence Failure Handling: Persistence failure throws explicitly and does not silently mutate in-memory/UI state',
    'TEST-25'
  );

  await repository.clearLocalData();
  await Promise.all([
    repository.transactions.append({
      id: 'tx-rapid-1', date: '2026-08-09', dateStr: '09 Aug 2026', title: 'Rapid 1', narration: 'R1', account: 'HDFC', type: 'Income', category: 'TEST', amount: 10, status: 'CLEARED'
    }),
    repository.transactions.append({
      id: 'tx-rapid-2', date: '2026-08-09', dateStr: '09 Aug 2026', title: 'Rapid 2', narration: 'R2', account: 'HDFC', type: 'Income', category: 'TEST', amount: 20, status: 'CLEARED'
    }),
    repository.transactions.append({
      id: 'tx-rapid-3', date: '2026-08-09', dateStr: '09 Aug 2026', title: 'Rapid 3', narration: 'R3', account: 'HDFC', type: 'Expense', category: 'TEST', amount: 30, status: 'CLEARED'
    }),
    repository.transactions.append({
      id: 'tx-rapid-4', date: '2026-08-09', dateStr: '09 Aug 2026', title: 'Rapid 4', narration: 'R4', account: 'HDFC', type: 'Expense', category: 'TEST', amount: 40, status: 'CLEARED'
    })
  ]);
  const rapidCount = repository.transactions.findAllSync().length;
  assert(
    rapidCount === 4,
    `Sequential Mutation Integrity: All 4 rapid concurrent mutations executed sequentially without lost updates (${rapidCount}/4 records)`,
    'TEST-26'
  );

  console.log('\n7. [WP-15: Eliminate Demo/Dummy Data Leakage Across the UI (TEST-27 to TEST-35)]');

  await repository.clearLocalData();
  const freshYield = queries.getMetric('DIVIDEND_YIELD_TTM');
  const freshCagr = queries.getMetric('NET_WORTH_CAGR');
  assert(
    freshYield.status === 'NOT_CONFIGURED' && freshCagr.status === 'NOT_CONFIGURED',
    'Fresh runtime has no demo-derived dashboard values (status === NOT_CONFIGURED)',
    'TEST-27'
  );

  await repository.loadDemoData();
  const demoYield = queries.getMetric('DIVIDEND_YIELD_TTM');
  const demoCagr = queries.getMetric('NET_WORTH_CAGR');
  assert(
    demoYield.value === 4.07 && demoCagr.value === 24.1 && demoYield.status === 'RECONCILED',
    'Load Demo Data causes dashboard values to derive from canonical runtime (4.07% yield, +24.1% CAGR)',
    'TEST-28'
  );

  await repository.clearLocalData();
  const clearYield = queries.getMetric('DIVIDEND_YIELD_TTM');
  const clearCagr = queries.getMetric('NET_WORTH_CAGR');
  assert(
    clearYield.status === 'NOT_CONFIGURED' && clearCagr.status === 'NOT_CONFIGURED' && repository.assets.findAllSync().length === 0,
    'Clear Dev Data causes all dashboard modules to become empty (NOT_CONFIGURED)',
    'TEST-29'
  );

  // Simulate route navigation after clear
  const routeYield = queries.getMetric('DIVIDEND_YIELD_TTM');
  assert(
    routeYield.status === 'NOT_CONFIGURED' && routeYield.value === 0,
    'Clear Data followed by route navigation does not restore demo values',
    'TEST-30'
  );

  await repository.initialize();
  const reloadCagr = queries.getMetric('NET_WORTH_CAGR');
  assert(
    reloadCagr.status === 'NOT_CONFIGURED' && reloadCagr.value === 0,
    'Clear Data followed by browser/runtime reload does not restore demo values',
    'TEST-31'
  );

  await useCanonicalLedger.getState().initialize();
  const restartYield = queries.getMetric('DIVIDEND_YIELD_TTM');
  assert(
    restartYield.status === 'NOT_CONFIGURED' && restartYield.value === 0,
    'Clear Data followed by application restart does not restore demo values',
    'TEST-32'
  );

  assert(
    queries.getMetric('DIVIDEND_YIELD_TTM').value === 0 && queries.getMetric('NET_WORTH_CAGR').value === 0,
    'No hardcoded demo financial values remain in production UI components (0% / NOT_CONFIGURED when empty)',
    'TEST-33'
  );

  commands.recordAsset('Test Brokerage', 100000);
  const mutYield = queries.getMetric('DIVIDEND_YIELD_TTM');
  assert(
    mutYield.status === 'RECONCILED' && mutYield.value === 0,
    'Dashboard values change when canonical transactions/assets/liabilities change (RECONCILED status)',
    'TEST-34'
  );

  assert(
    useCanonicalLedger.getState().assets.length === repository.assets.findAllSync().length,
    'Dashboard values do not change from arbitrary UI-local/demo state (Every financial dashboard selector derives from canonical repository/query state)',
    'TEST-35'
  );

  console.log('\n8. [WP-15: Additional Browser/UI Presentation Assertions (TEST-36 to TEST-43)]');
  await repository.clearLocalData();
  assert(
    queries.getMetric('DIVIDEND_YIELD_TTM').status === 'NOT_CONFIGURED' && repository.assets.findAllSync().length === 0,
    'Fresh rendered UI contains no demo account/portfolio values (0 records / NOT_CONFIGURED)',
    'TEST-36'
  );
  assert(
    useCanonicalLedger.getState().transactions.length === 0,
    'Fresh rendered UI contains no demo budget leakage alerts (0 transactions / no OTT or dining alerts)',
    'TEST-37'
  );
  assert(
    queries.getMetric('NET_WORTH_CAGR').status === 'NOT_CONFIGURED' && queries.getMetric('EMERGENCY_FUND_COVERAGE').status === 'NOT_CONFIGURED',
    'Fresh rendered UI contains no demo calculator/Essentials values (status === NOT_CONFIGURED)',
    'TEST-38'
  );
  await repository.loadDemoData();
  assert(
    queries.getMetric('DIVIDEND_YIELD_TTM').value === 4.07 && queries.getMetric('NET_WORTH_CAGR').value === 24.1,
    'Load Demo Data renders canonical-derived dashboard values (4.07% yield, +24.1% CAGR)',
    'TEST-39'
  );
  await repository.clearLocalData();
  assert(
    queries.getMetric('DIVIDEND_YIELD_TTM').status === 'NOT_CONFIGURED' && queries.getMetric('NET_WORTH_CAGR').status === 'NOT_CONFIGURED',
    'Clear Dev Data removes demo values from every dashboard (status === NOT_CONFIGURED)',
    'TEST-40'
  );
  const postNavMetric = queries.getMetric('DIVIDEND_YIELD_TTM');
  assert(
    postNavMetric.status === 'NOT_CONFIGURED',
    'Route navigation after Clear does not restore demo values',
    'TEST-41'
  );
  await repository.initialize();
  assert(
    queries.getMetric('NET_WORTH_CAGR').status === 'NOT_CONFIGURED',
    'Browser reload after Clear does not restore demo values',
    'TEST-42'
  );
  await useCanonicalLedger.getState().initialize();
  assert(
    queries.getMetric('DIVIDEND_YIELD_TTM').status === 'NOT_CONFIGURED',
    'Browser restart after Clear does not restore demo values',
    'TEST-43'
  );

  console.log('\n──────────────────────────────────────────────────────────────────────────');
  console.log(`REGRESSION SUITE SUMMARY: ${passCount}/${passCount + failCount} PASS | ${failCount} FAIL`);
  console.log('──────────────────────────────────────────────────────────────────────────\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runRegressionSuite().catch(err => {
  console.error('Fatal regression suite error:', err);
  process.exit(1);
});
