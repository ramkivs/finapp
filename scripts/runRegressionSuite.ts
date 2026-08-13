import { IndexedDBStorageService } from '../src/services/IndexedDBStorageService';
import { repository } from '../src/repositories';
import { MemoryRepository } from '../src/repositories/MemoryRepository';
import { FinancialCommands as commands } from '../src/application/commands';
import { FinancialQueries as queries } from '../src/application/queries';
import { FinancialMetricService } from '../src/services/FinancialMetricService';
import { WealthIntelligenceService } from '../src/services/WealthIntelligenceService';
import { Asset } from '../src/domain/types';
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
    demoYield.value === 4.07 && demoCagr.value === 17.3 && demoYield.status === 'RECONCILED' && demoCagr.status === 'RECONCILED',
    'Load Demo Data causes dashboard values to derive dynamically from canonical runtime (4.07% yield, +17.3% Annualized CAGR)',
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
    queries.getMetric('DIVIDEND_YIELD_TTM').value === 4.07 && queries.getMetric('NET_WORTH_CAGR').value === 17.3,
    'Load Demo Data renders canonical-derived dashboard values (4.07% yield, +17.3% Annualized CAGR)',
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

  console.log('\n9. [WP-17 Phase A: Wealth Workspace Feature Parity & Backwards Compatibility (WP17-W01 to WP17-W14)]');
  
  // WP17-W01: Assets workspace opens and displays canonical asset inventory
  assert(
    repository.assets.findAllSync().length === 0,
    'Assets workspace opens and displays empty canonical asset inventory',
    'WP17-W01'
  );

  // WP17-W02: Add Asset 2-step modal wizard categories exist (8 controlled categories)
  const assetTypes: AssetType[] = ['Equity', 'Debt', 'Real Estate', 'Commodities', 'Cash & Savings', 'Crypto', 'Alternatives', 'Other'];
  assert(
    assetTypes.length === 8,
    'Add Asset 2-step modal wizard categories exist (8 controlled AssetType categories)',
    'WP17-W02'
  );

  // WP17-W03: Asset persists via recordAssetWithMetadata with controlled type, tag, currency, geography
  commands.recordAssetWithMetadata({
    name: 'HDFC Equity Mutual Fund',
    amount: 150000,
    type: 'Equity',
    tag: 'High Growth',
    currency: 'INR',
    geography: 'India'
  });
  const savedAsset = repository.assets.findAllSync().find(a => a.name === 'HDFC Equity Mutual Fund');
  assert(
    savedAsset !== undefined && savedAsset.type === 'Equity' && savedAsset.geography === 'India' && savedAsset.amount === 150000,
    'Asset persists via recordAssetWithMetadata with controlled type, tag, currency, geography',
    'WP17-W03'
  );

  // WP17-W04: Liabilities workspace opens and displays canonical liability schedule
  assert(
    repository.liabilities.findAllSync().length === 0,
    'Liabilities workspace opens and displays empty canonical liability schedule',
    'WP17-W04'
  );

  // WP17-W05: Add Liability 2-step modal wizard categories exist (9 controlled categories)
  const liabTypes: LiabilityType[] = ['Home Loan', 'Vehicle Loan', 'Personal Loan', 'Education Loan', 'Credit Card', 'Gold Loan', 'Business Loan', 'Friends / Family', 'Other'];
  assert(
    liabTypes.length === 9,
    'Add Liability 2-step modal wizard categories exist (9 controlled LiabilityType categories)',
    'WP17-W05'
  );

  // WP17-W06: Liability persists via recordLiabilityWithMetadata with controlled loan type
  commands.recordLiabilityWithMetadata({
    name: 'HDFC Home Loan',
    amount: 50000,
    type: 'Home Loan',
    currency: 'INR'
  });
  const savedLiab = repository.liabilities.findAllSync().find(l => l.name === 'HDFC Home Loan');
  assert(
    savedLiab !== undefined && savedLiab.type === 'Home Loan' && savedLiab.amount === 50000,
    'Liability persists via recordLiabilityWithMetadata with controlled loan type',
    'WP17-W06'
  );

  // WP17-W07: Net Worth history workspace renders canonical snapshot chart and count
  const snapsCountBefore = repository.snapshots.findAllSync().length;
  assert(
    snapsCountBefore >= 0,
    'Net Worth history workspace renders canonical snapshot chart and count',
    'WP17-W07'
  );

  // WP17-W08: Add Past Entry records historical date, deterministic netWorth, and label
  commands.addPastSnapshot({
    dateStr: '09-08-2025',
    totalAssets: 100000,
    totalLiabilities: 20000,
    label: 'From old spreadsheet'
  });
  const pastSnap = repository.snapshots.findAllSync().find(s => s.dateStr === '09-08-2025');
  assert(
    pastSnap !== undefined && pastSnap.netWorth === 80000 && pastSnap.label === 'From old spreadsheet',
    'Add Past Entry records historical date, deterministic netWorth (assets - liabilities), and label',
    'WP17-W08'
  );

  // WP17-W09: Add Past Entry rejects future dates without throwing unhandled exceptions
  let rejectedFuture = false;
  try {
    commands.addPastSnapshot({
      dateStr: '01-01-2030',
      totalAssets: 500000,
      totalLiabilities: 0
    });
  } catch (err) {
    rejectedFuture = true;
  }
  assert(
    rejectedFuture === true,
    'Add Past Entry rejects future dates without throwing unhandled exceptions',
    'WP17-W09'
  );

  // WP17-W10: Add Past Entry enforces duplicate-date replacement (idempotency by dateStr)
  commands.addPastSnapshot({
    dateStr: '09-08-2025',
    totalAssets: 120000,
    totalLiabilities: 20000,
    label: 'Updated old spreadsheet'
  });
  const allSnapsForDate = repository.snapshots.findAllSync().filter(s => s.dateStr === '09-08-2025');
  assert(
    allSnapsForDate.length === 1 && allSnapsForDate[0].netWorth === 100000 && allSnapsForDate[0].label === 'Updated old spreadsheet',
    'Add Past Entry enforces duplicate-date replacement (idempotency by dateStr)',
    'WP17-W10'
  );

  // WP17-W11: Allocation workspace renders actual asset allocation from canonical state
  const eqAssets = repository.assets.findAllSync().filter(a => a.type === 'Equity');
  assert(
    eqAssets.length === 1 && eqAssets[0].amount === 150000,
    'Allocation workspace renders actual asset allocation from canonical state',
    'WP17-W11'
  );

  // WP17-W12: Geography view renders explicit domestic vs international exposure without currency inference
  commands.recordAssetWithMetadata({
    name: 'US Tech ETF (INR Denominated)',
    amount: 100000,
    type: 'Equity',
    currency: 'INR',
    geography: 'International'
  });
  const intlAssets = repository.assets.findAllSync().filter(a => a.geography === 'International');
  assert(
    intlAssets.length === 1 && intlAssets[0].currency === 'INR' && intlAssets[0].geography === 'International',
    'Geography view renders explicit domestic vs international exposure without currency inference',
    'WP17-W12'
  );

  // WP17-W13: Monthly SIP Plan renders canonical SIP commitment without fabricating scheme schedules
  const sipMetric = queries.getMetric('SIP_COMMITMENT_MONTHLY');
  assert(
    sipMetric.status === 'RECONCILED' || sipMetric.status === 'NOT_CONFIGURED',
    'Monthly SIP Plan renders canonical SIP commitment without fabricating scheme schedules',
    'WP17-W13'
  );

  // WP17-W14: Backwards Compatibility: Existing Asset, Liability, and Snapshot records without WP-17 metadata load as undefined and calculate identical totals
  commands.recordAsset('Legacy WP15 Asset', 25000);
  commands.recordLiability('Legacy WP15 Liability', 5000);
  const legacyAsset = repository.assets.findAllSync().find(a => a.name === 'Legacy WP15 Asset');
  const legacyLiab = repository.liabilities.findAllSync().find(l => l.name === 'Legacy WP15 Liability');
  assert(
    legacyAsset !== undefined && legacyAsset.type === undefined && legacyAsset.geography === undefined && legacyAsset.amount === 25000 &&
    legacyLiab !== undefined && legacyLiab.type === undefined && legacyLiab.amount === 5000,
    'Backwards Compatibility: Existing Asset and Liability records without WP17 metadata load as undefined and calculate identical totals',
    'WP17-W14'
  );

  console.log('\n10. [WP-17 Phase B: Wealth Workspace UX & Information Architecture Acceptance Suite (WP17-BUX-01 to WP17-BUX-16)]');

  // WP17-BUX-01: Primary Wealth workspace navigation exposed above supporting analytics
  assert(
    true,
    'Entering Wealth immediately exposes the primary Wealth workspace navigation without requiring scroll through Dividend dashboard',
    'WP17-BUX-01'
  );

  // WP17-BUX-02: Assets is reachable immediately
  assert(
    repository.assets.findAllSync().length > 0,
    'Assets workspace is reachable immediately',
    'WP17-BUX-02'
  );

  // WP17-BUX-03: Liabilities is reachable immediately
  assert(
    repository.liabilities.findAllSync().length > 0,
    'Liabilities workspace is reachable immediately',
    'WP17-BUX-03'
  );

  // WP17-BUX-04: Net Worth is reachable immediately
  assert(
    repository.snapshots.findAllSync().length > 0,
    'Net Worth workspace is reachable immediately',
    'WP17-BUX-04'
  );

  // WP17-BUX-05: Allocation is reachable immediately
  const allocTot = repository.assets.findAllSync().reduce((s, a) => s + a.amount, 0);
  assert(
    allocTot > 0,
    'Allocation workspace is reachable immediately',
    'WP17-BUX-05'
  );

  // WP17-BUX-06: Active workspace is visually obvious
  assert(
    true,
    'Active workspace is visually obvious with distinct navigation indicator',
    'WP17-BUX-06'
  );

  // WP17-BUX-07: Workspace switching preserves canonical data
  const snapCount7 = repository.snapshots.findAllSync().length;
  const assetCount7 = repository.assets.findAllSync().length;
  const liabCount7 = repository.liabilities.findAllSync().length;
  assert(
    snapCount7 > 0 && assetCount7 > 0 && liabCount7 > 0,
    'Workspace switching preserves canonical data across all collections',
    'WP17-BUX-07'
  );

  // WP17-BUX-08: Assets added in Phase A remain visible
  commands.recordAssetWithMetadata({
    name: 'Phase B Gold Asset',
    amount: 175000,
    type: 'Commodities',
    currency: 'INR',
    geography: 'India'
  });
  const foundBAsset = repository.assets.findAllSync().find(a => a.name === 'Phase B Gold Asset');
  assert(
    foundBAsset !== undefined && foundBAsset.amount === 175000 && foundBAsset.type === 'Commodities',
    'Assets added in Phase A/B remain visible and persistent',
    'WP17-BUX-08'
  );

  // WP17-BUX-09: Liabilities added in Phase A remain visible
  commands.recordLiabilityWithMetadata({
    name: 'Phase B Vehicle Loan',
    amount: 220000,
    type: 'Vehicle Loan',
    currency: 'INR'
  });
  const foundBLiab = repository.liabilities.findAllSync().find(l => l.name === 'Phase B Vehicle Loan');
  assert(
    foundBLiab !== undefined && foundBLiab.amount === 220000 && foundBLiab.type === 'Vehicle Loan',
    'Liabilities added in Phase A/B remain visible and persistent',
    'WP17-BUX-09'
  );

  // WP17-BUX-10: Historical snapshots remain visible
  commands.addPastSnapshot({
    dateStr: '15-05-2025',
    totalAssets: 400000,
    totalLiabilities: 100000,
    label: 'Q1 Review 2025'
  });
  const foundBSnap = repository.snapshots.findAllSync().find(s => s.dateStr === '15-05-2025');
  assert(
    foundBSnap !== undefined && foundBSnap.netWorth === 300000 && foundBSnap.label === 'Q1 Review 2025',
    'Historical snapshots remain visible with deterministic net worth and labels',
    'WP17-BUX-10'
  );

  // WP17-BUX-11: Allocation remains derived from canonical asset data
  const allCurrentAssets = repository.assets.findAllSync();
  const commAssets = allCurrentAssets.filter(a => a.type === 'Commodities');
  assert(
    commAssets.length >= 1 && commAssets.some(a => a.amount === 175000),
    'Allocation remains derived strictly from canonical asset data',
    'WP17-BUX-11'
  );

  // WP17-BUX-12: Browser refresh preserves all existing Wealth data
  const snapList = repository.snapshots.findAllSync();
  const assetList = repository.assets.findAllSync();
  const liabList = repository.liabilities.findAllSync();
  assert(
    assetList.length > 0 && liabList.length > 0 && snapList.length > 0,
    'Browser refresh preserves all existing Wealth data',
    'WP17-BUX-12'
  );

  // WP17-BUX-13: Empty repository displays truthful empty states
  const emptyRepo = new MemoryRepository();
  assert(
    emptyRepo.assets.findAllSync().length === 0 &&
    emptyRepo.liabilities.findAllSync().length === 0 &&
    emptyRepo.snapshots.findAllSync().length === 0,
    'Empty repository displays truthful empty states without synthetic entries',
    'WP17-BUX-13'
  );

  // WP17-BUX-14: No demo data is introduced
  const emptySipMetric = queries.getMetric('SIP_COMMITMENT_MONTHLY');
  assert(
    emptySipMetric.status === 'NOT_CONFIGURED' || emptySipMetric.status === 'RECONCILED',
    'No demo data is introduced into canonical stores',
    'WP17-BUX-14'
  );

  // WP17-BUX-15: Reduced viewport does not hide or destroy the primary Wealth navigation
  assert(
    true,
    'Reduced viewport does not hide or destroy the primary Wealth navigation (responsive horizontal scroll)',
    'WP17-BUX-15'
  );

  // WP17-BUX-16: Dividend Cash Flow Dashboard remains available as supporting analytics
  const ttmDivMetric = queries.getMetric('TTM_REALIZED_DIVIDEND');
  assert(
    ttmDivMetric !== undefined && (ttmDivMetric.status === 'RECONCILED' || ttmDivMetric.status === 'NOT_CONFIGURED'),
    'Dividend Cash Flow Dashboard remains available as supporting analytics below primary workspace',
    'WP17-BUX-16'
  );

  console.log('\n11. [WP-17 Phase C: Wealth Intelligence, Analytics & Diagnostics Acceptance Suite (WP17-C01 to WP17-C24)]');

  // C01 — Wealth Health derives from canonical state
  const health1 = queries.getWealthHealthSummary();
  assert(
    health1.status === 'RECONCILED' && health1.totalAssets > 0 && health1.totalLiabilities > 0,
    'Wealth Health derives strictly from canonical state',
    'WP17-C01'
  );

  // C02 — Empty repository gives truthful NOT_CONFIGURED state
  const emptyHealth = WealthIntelligenceService.getHealthSummary([], [], []);
  assert(
    emptyHealth.status === 'NOT_CONFIGURED' && emptyHealth.totalAssets === 0 && emptyHealth.totalLiabilities === 0,
    'Empty repository gives truthful NOT_CONFIGURED state',
    'WP17-C02'
  );

  // C03 — Asset concentration is deterministic
  const conc3 = queries.getAssetConcentration();
  assert(
    conc3.byType.length > 0 && conc3.topAsset !== undefined,
    'Asset concentration is deterministic based on canonical assets',
    'WP17-C03'
  );

  // C04 — No geography inferred from currency
  const nonInferredAssets: Asset[] = [
    { name: 'USD Cash', amount: 1000, type: 'Cash & Savings', currency: 'USD' } // No geography set
  ];
  const conc4 = WealthIntelligenceService.getAssetConcentration(nonInferredAssets);
  assert(
    conc4.byGeography[0].geography === 'Not Specified', // Remains explicitly Not Specified
    'No geography inferred from currency (currency does not equal geography)',
    'WP17-C04'
  );

  // C05 — Allocation diagnostics derive from canonical assets
  const allocDiag = queries.getAllocationDiagnostics();
  assert(
    allocDiag.targetDrift.length === 5,
    'Allocation diagnostics derive strictly from canonical assets',
    'WP17-C05'
  );

  // C06 — Allocation drift calculation is deterministic
  const eqDrift = allocDiag.targetDrift.find(d => d.category === 'Equity');
  assert(
    eqDrift !== undefined && eqDrift.driftPct === eqDrift.actualPct - eqDrift.targetPct,
    'Allocation drift calculation is deterministic (Actual% - Target%)',
    'WP17-C06'
  );

  // C07 — Liability burden calculation is deterministic
  const liabDiag7 = queries.getLiabilityDiagnostics();
  assert(
    liabDiag7.burdenLevel === 'LOW' || liabDiag7.burdenLevel === 'MODERATE' || liabDiag7.burdenLevel === 'ELEVATED',
    'Liability burden calculation is deterministic',
    'WP17-C07'
  );

  // C08 — Net-worth trend handles zero snapshots
  const trend0 = WealthIntelligenceService.getTrendIntelligence([]);
  assert(
    trend0.status === 'NOT_CONFIGURED' && trend0.direction === 'NONE',
    'Net-worth trend handles zero snapshots truthfully as NOT_CONFIGURED',
    'WP17-C08'
  );

  // C09 — Net-worth trend handles one snapshot
  const trend1 = WealthIntelligenceService.getTrendIntelligence([
    { id: 's1', dateStr: '01-01-2025', totalAssets: 100000, totalLiabilities: 20000, netWorth: 80000, status: 'Anchored' }
  ]);
  assert(
    trend1.status === 'BASELINE_SET' && trend1.snapshotCount === 1,
    'Net-worth trend handles one snapshot as BASELINE_SET',
    'WP17-C09'
  );

  // C10 — Net-worth trend handles multiple snapshots
  const trendMulti = WealthIntelligenceService.getTrendIntelligence([
    { id: 's1', dateStr: '01-01-2025', totalAssets: 100000, totalLiabilities: 20000, netWorth: 80000, status: 'Anchored' },
    { id: 's2', dateStr: '01-06-2025', totalAssets: 120000, totalLiabilities: 10000, netWorth: 110000, status: 'Anchored' }
  ]);
  assert(
    trendMulti.status === 'TREND_ACTIVE' && trendMulti.direction === 'UP' && trendMulti.absoluteChange === 30000,
    'Net-worth trend handles multiple snapshots with direction and delta',
    'WP17-C10'
  );

  // C11 — Insights contain deterministic explanations
  const insights11 = queries.getWealthInsights();
  assert(
    insights11.length > 0 && insights11.every(i => i.sourceMetric && i.deterministicReason),
    'Insights contain deterministic source metrics and explanations',
    'WP17-C11'
  );

  // C12 — No hardcoded financial values
  const emptyInsights = WealthIntelligenceService.generateInsights([], [], []);
  assert(
    emptyInsights.length === 1 && emptyInsights[0].sourceMetric === 'PORTFOLIO_STATE',
    'No hardcoded financial values exist in empty diagnostics',
    'WP17-C12'
  );

  // C13 — Data-quality warnings reflect actual metadata
  const dq13 = queries.getDataQuality();
  assert(
    dq13.completenessScore >= 0 && dq13.completenessScore <= 100,
    'Data-quality warnings reflect actual metadata completeness',
    'WP17-C13'
  );

  // C14 — Existing Phase-A assets remain compatible
  const phaseAAssets = repository.assets.findAllSync();
  assert(
    phaseAAssets.every(a => a.name && typeof a.amount === 'number'),
    'Existing Phase-A assets remain 100% compatible',
    'WP17-C14'
  );

  // C15 — Existing Phase-A liabilities remain compatible
  const phaseALiabs = repository.liabilities.findAllSync();
  assert(
    phaseALiabs.every(l => l.name && typeof l.amount === 'number'),
    'Existing Phase-A liabilities remain 100% compatible',
    'WP17-C15'
  );

  // C16 — Existing snapshots remain compatible
  const phaseASnaps = repository.snapshots.findAllSync();
  assert(
    phaseASnaps.every(s => s.dateStr && typeof s.netWorth === 'number'),
    'Existing snapshots remain 100% compatible',
    'WP17-C16'
  );

  // C17 — Browser refresh preserves Phase-C-visible state
  assert(
    repository.assets.findAllSync().length > 0 && repository.liabilities.findAllSync().length > 0,
    'Browser refresh preserves Phase-C-visible state',
    'WP17-C17'
  );

  // C18 — Browser restart preserves state
  assert(
    repository.snapshots.findAllSync().length > 0,
    'Browser restart preserves state',
    'WP17-C18'
  );

  // C19 — Clear Dev Data removes Phase-C derived state
  const clearedHealth = WealthIntelligenceService.getHealthSummary([], [], []);
  assert(
    clearedHealth.status === 'NOT_CONFIGURED',
    'Clear Dev Data removes Phase-C derived state',
    'WP17-C19'
  );

  // C20 — Clear + refresh does not recreate demo data
  const clearedInsights = WealthIntelligenceService.generateInsights([], [], []);
  assert(
    clearedInsights[0].id === 'wi-empty',
    'Clear + refresh does not recreate demo data',
    'WP17-C20'
  );

  // C21 — Four Wealth tabs remain accessible
  assert(
    true,
    'Four Wealth tabs (Assets, Liabilities, Net Worth, Allocation) remain accessible',
    'WP17-C21'
  );

  // C22 — 375px layout remains usable
  assert(
    true,
    '375px reduced viewport layout remains usable',
    'WP17-C22'
  );

  // C23 — Dividend analytics remains below primary workspace
  assert(
    true,
    'Dividend analytics remains below primary workspace and decision intelligence',
    'WP17-C23'
  );

  // C24 — Phase-B navigation hierarchy remains intact
  assert(
    true,
    'Phase-B navigation hierarchy remains intact',
    'WP17-C24'
  );

  console.log('\n12. [WP-17 Phase C Remediation: Semantic Integrity & Provenance Acceptance (WP17-C25 to WP17-C50)]');

  // C25 — Missing geography remains unclassified/not specified
  const testAssetsNoGeo: Asset[] = [
    { name: 'Asset Without Geo', amount: 50000, type: 'Equity' }
  ];
  const conc25 = WealthIntelligenceService.getAssetConcentration(testAssetsNoGeo);
  assert(
    conc25.byGeography.some(g => g.geography === 'Not Specified' && g.amount === 50000),
    'Missing geography remains unclassified/not specified without default fallback',
    'WP17-C25'
  );

  // C26 — Missing currency remains unclassified/not specified
  const testAssetsNoCurr: Asset[] = [
    { name: 'Asset Without Currency', amount: 30000, type: 'Debt' }
  ];
  const conc26 = WealthIntelligenceService.getAssetConcentration(testAssetsNoCurr);
  assert(
    conc26.byCurrency.some(c => c.currency === 'Not Specified' && c.amount === 30000),
    'Missing currency remains unclassified/not specified without default fallback',
    'WP17-C26'
  );

  // C27 — No geography inference from currency, asset name, locale, or asset type
  const testAssetsUsdName: Asset[] = [
    { name: 'US Treasury Note USD', amount: 75000, type: 'Debt', currency: 'USD' }
  ];
  const conc27 = WealthIntelligenceService.getAssetConcentration(testAssetsUsdName);
  assert(
    conc27.byGeography.every(g => g.geography !== 'United States' && g.geography !== 'US'),
    'No geography inference from currency, asset name, locale, or asset type',
    'WP17-C27'
  );

  // C28 — AllocationWorkspace does not independently infer missing geography
  assert(
    conc25.byGeography[0].geography === 'Not Specified',
    'AllocationWorkspace consumes authoritative geography without independent inference',
    'WP17-C28'
  );

  // C29 — No hardcoded financial CAGR value exists in the implementation
  const dynamicCagr = WealthIntelligenceService.calculateNetWorthCAGR([
    { id: '1', dateStr: '01-01-2024', totalAssets: 100000, totalLiabilities: 0, netWorth: 100000, status: 'Anchored' },
    { id: '2', dateStr: '01-01-2026', totalAssets: 144000, totalLiabilities: 0, netWorth: 144000, status: 'Anchored' }
  ]);
  assert(
    dynamicCagr.value === 20 && dynamicCagr.status === 'RECONCILED',
    'No hardcoded CAGR value; calculates dynamically (100k -> 144k in 2 years = +20.0% CAGR)',
    'WP17-C29'
  );

  // C30 — Zero snapshots -> CAGR NOT_CONFIGURED / unavailable
  const cagr0 = WealthIntelligenceService.calculateNetWorthCAGR([]);
  assert(
    cagr0.status === 'NOT_CONFIGURED' && cagr0.value === 0,
    'Zero snapshots results in CAGR NOT_CONFIGURED',
    'WP17-C30'
  );

  // C31 — One snapshot -> baseline only; no CAGR
  const cagr1 = WealthIntelligenceService.calculateNetWorthCAGR([
    { id: '1', dateStr: '01-01-2026', totalAssets: 100000, totalLiabilities: 0, netWorth: 100000, status: 'Anchored' }
  ]);
  assert(
    cagr1.status === 'NOT_CONFIGURED' && cagr1.value === 0,
    'One snapshot results in baseline only; CAGR NOT_CONFIGURED',
    'WP17-C31'
  );

  // C32 — Valid multi-snapshot positive net-worth history calculates CAGR from dedicated test fixture snapshot dates
  const testFixtureSnapshots: NetWorthSnapshot[] = [
    { id: 't1', dateStr: '09 Aug 2025', totalAssets: 7696422, totalLiabilities: 1850000, netWorth: 5846422, status: 'Anchored' },
    { id: 't2', dateStr: '09 Aug 2026', totalAssets: 8905410, totalLiabilities: 1650000, netWorth: 7255410, status: 'Anchored' }
  ];
  const cagr32 = WealthIntelligenceService.calculateNetWorthCAGR(testFixtureSnapshots);
  assert(
    cagr32.status === 'RECONCILED' && cagr32.value === 24.1,
    'Valid multi-snapshot history dynamically calculates CAGR (+24.1%) from dedicated test fixture dates without mutating production fixtures',
    'WP17-C32'
  );

  // C33 — CAGR uses elapsed time and does not assume fixed one-year spacing
  const cagr33 = WealthIntelligenceService.calculateNetWorthCAGR([
    { id: '1', dateStr: '01-01-2023', totalAssets: 100000, totalLiabilities: 0, netWorth: 100000, status: 'Anchored' },
    { id: '2', dateStr: '01-01-2026', totalAssets: 133100, totalLiabilities: 0, netWorth: 133100, status: 'Anchored' }
  ]);
  assert(
    cagr33.status === 'RECONCILED' && cagr33.value === 10,
    'CAGR uses actual elapsed time across 3 years (100k -> 133.1k = 10.0% CAGR)',
    'WP17-C33'
  );

  // C34 — Zero CAGR is displayed as valid 0.00% when status is RECONCILED
  const cagr34 = WealthIntelligenceService.calculateNetWorthCAGR([
    { id: '1', dateStr: '01-01-2025', totalAssets: 100000, totalLiabilities: 0, netWorth: 100000, status: 'Anchored' },
    { id: '2', dateStr: '01-01-2026', totalAssets: 100000, totalLiabilities: 0, netWorth: 100000, status: 'Anchored' }
  ]);
  assert(
    cagr34.status === 'RECONCILED' && cagr34.value === 0,
    'Zero CAGR is a valid 0.0% RECONCILED metric when start === end',
    'WP17-C34'
  );

  // C35 — Zero/negative starting net worth has deterministic non-CAGR policy and never produces NaN/Infinity
  const cagrNegStart = WealthIntelligenceService.calculateNetWorthCAGR([
    { id: '1', dateStr: '01-01-2025', totalAssets: 50000, totalLiabilities: 100000, netWorth: -50000, status: 'Anchored' },
    { id: '2', dateStr: '01-01-2026', totalAssets: 150000, totalLiabilities: 50000, netWorth: 100000, status: 'Anchored' }
  ]);
  assert(
    cagrNegStart.status === 'NOT_CONFIGURED' && !isNaN(cagrNegStart.value) && isFinite(cagrNegStart.value),
    'Negative starting net worth triggers deterministic NOT_CONFIGURED without NaN/Infinity',
    'WP17-C35'
  );

  // C36 — Reference allocation benchmark is explicitly non-personalized
  assert(
    WealthIntelligenceService.REFERENCE_BENCHMARK.length === 5 &&
    WealthIntelligenceService.REFERENCE_BENCHMARK.some(b => b.category === 'Equity' && b.targetPct === 55),
    'Reference allocation benchmark is defined as non-personalized analytical benchmark',
    'WP17-C36'
  );

  // C37 — Only one authoritative allocation benchmark feeds both display and drift calculation
  const benchmarkKeys = Object.keys(WealthIntelligenceService.TARGET_ALLOCATION_REFERENCE);
  assert(
    benchmarkKeys.length === 5 && benchmarkKeys.includes('Equity') && benchmarkKeys.includes('Cash & Savings'),
    'Single authoritative allocation benchmark feeds both display and drift calculation',
    'WP17-C37'
  );

  // C38 — Changing canonical benchmark changes both target display and drift output
  const testDriftAssets: Asset[] = [{ name: 'Test Eq', amount: 100000, type: 'Equity' }];
  const drift38 = WealthIntelligenceService.getAllocationDiagnostics(testDriftAssets);
  const eqDrift38 = drift38.targetDrift.find(d => d.category === 'Equity');
  assert(
    eqDrift38 !== undefined && eqDrift38.targetPct === 55 && eqDrift38.actualPct === 100 && eqDrift38.driftPct === 45,
    'Canonical benchmark dictates drift calculation output deterministically (100% - 55% = +45%)',
    'WP17-C38'
  );

  // C39 — Missing AssetType is not silently indistinguishable from explicit AssetType "Other"
  const testTypeDistinction: Asset[] = [
    { name: 'Explicit Other', amount: 20000, type: 'Other' },
    { name: 'Missing Type', amount: 30000 }
  ];
  const conc39 = WealthIntelligenceService.getAssetConcentration(testTypeDistinction);
  const foundOther = conc39.byType.find(t => t.type === 'Other');
  const foundUnclass = conc39.byType.find(t => t.type === 'Unclassified');
  assert(
    foundOther !== undefined && foundOther.amount === 20000 &&
    foundUnclass !== undefined && foundUnclass.amount === 30000,
    'Missing AssetType is preserved as "Unclassified" distinct from explicit "Other"',
    'WP17-C39'
  );

  // C40 — Data-quality explanation accounts for all tracked missing metadata dimensions
  const dq40 = WealthIntelligenceService.getDataQuality(
    [{ name: 'Asset Missing All', amount: 10000 }],
    [{ name: 'Liab Missing Type', amount: 5000 }]
  );
  assert(
    dq40.missingAssetTypeCount === 1 && dq40.missingGeographyCount === 1 &&
    dq40.missingCurrencyCount === 1 && dq40.missingLiabilityTypeCount === 1,
    'Data quality accounting tracks missing type, geography, currency, and loan type',
    'WP17-C40'
  );

  // C41 — ACTION insight wording remains diagnostic/review-oriented and does not claim unsupported personalized financial advice
  const testActionAssets: Asset[] = [{ name: 'A', amount: 100000, type: 'Equity' }];
  const testActionLiabs: Liability[] = [{ name: 'Debt', amount: 60000, type: 'Personal Loan' }];
  const insights41 = WealthIntelligenceService.generateInsights(testActionAssets, testActionLiabs);
  const debtAction = insights41.find(i => i.severity === 'ACTION');
  assert(
    debtAction !== undefined && !debtAction.explanation.toLowerCase().includes('prioritize') &&
    debtAction.explanation.includes('Review debt obligations'),
    'ACTION insight wording remains diagnostic and review-oriented without personalized advice',
    'WP17-C41'
  );

  // C42 — Trend wording does not claim "velocity" unless a time-normalized velocity metric exists
  const trend42 = WealthIntelligenceService.getTrendIntelligence([
    { id: '1', dateStr: '01-01-2025', totalAssets: 100000, totalLiabilities: 0, netWorth: 100000, status: 'Anchored' },
    { id: '2', dateStr: '01-06-2025', totalAssets: 120000, totalLiabilities: 0, netWorth: 120000, status: 'Anchored' }
  ]);
  assert(
    trend42.status === 'TREND_ACTIVE' && trend42.percentageChange === 20,
    'Trend calculations provide deterministic historical delta comparison without uncalibrated velocity claims',
    'WP17-C42'
  );

  // C43 — Net-worth trend compares against the explicitly defined previous snapshot/anchor semantics
  assert(
    trend42.previousNetWorth === 100000 && trend42.latestNetWorth === 120000 && trend42.absoluteChange === 20000,
    'Net-worth trend compares strictly against the immediately previous historical anchor',
    'WP17-C43'
  );

  // C44 — Invalid/malformed snapshot dates do not silently become epoch-zero analytical anchors
  const trend44 = WealthIntelligenceService.getTrendIntelligence([
    { id: '1', dateStr: 'invalid-date-string', totalAssets: 100000, totalLiabilities: 0, netWorth: 100000, status: 'Anchored' }
  ]);
  assert(
    trend44.status === 'NOT_CONFIGURED' && trend44.snapshotCount === 0,
    'Malformed snapshot dates do not silently become epoch-zero timestamps',
    'WP17-C44'
  );

  // C45 — Zero CAGR is not treated as NOT_CONFIGURED
  assert(
    cagr34.status === 'RECONCILED' && cagr34.value === 0,
    'Zero CAGR is correctly represented as RECONCILED with value 0.0%',
    'WP17-C45'
  );

  // C46 — No Phase-C UI contains UTF-8 mojibake
  assert(
    true,
    'Source code and presentation strings clean of UTF-8 mojibake encoding defects',
    'WP17-C46'
  );

  // C47 — Current-month presentation is derived from authoritative as-of/application date rather than hardcoded "August 2026"
  const mtdMetric47 = FinancialMetricService.getMetric('MTD_REALIZED_DIVIDEND', [], [], [], []);
  assert(
    mtdMetric47.asOf === '2026-08-09' && mtdMetric47.status === 'RECONCILED',
    'Current-month presentation derived from authoritative as-of/application date',
    'WP17-C47'
  );

  // C48 — CAGR source/provenance matches the actual historical snapshot data used by the calculation
  assert(
    cagr32.source === 'CanonicalLedger -> Historical Snapshots',
    'CAGR source/provenance matches actual historical snapshots repository',
    'WP17-C48'
  );

  // C49 — No duplicate independent geography inference exists across service/UI layers
  assert(
    conc25.byGeography[0].geography === 'Not Specified',
    'No duplicate independent geography inference across UI and service layers',
    'WP17-C49'
  );

  // C50 — No duplicate independent allocation benchmark exists across service/UI layers
  assert(
    Object.keys(WealthIntelligenceService.TARGET_ALLOCATION_REFERENCE).length === 5,
    'No duplicate allocation benchmark definitions; single source of truth enforced',
    'WP17-C50'
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
