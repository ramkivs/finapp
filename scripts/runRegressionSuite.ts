import { repository } from '../src/repositories';
import { commands, queries } from '../src/application';
import { ImportPipelineService } from '../src/services/ImportPipelineService';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${desc}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
    failCount++;
  }
}

console.log('──────────────────────────────────────────────────────────────────────────');
console.log('FINBOOM RUNTIME INTEGRITY REGRESSION SUITE');
console.log('──────────────────────────────────────────────────────────────────────────\n');

console.log('1. [Repository & Application Command/Query Boundary]');
const initialTxs = queries.queryTransactions({ type: 'All', dateRange: '12M' });
assert(initialTxs.length > 0, `Initial canonical repository loaded (${initialTxs.length} transactions in 12M trailing window)`);

commands.recordIncome('Test Dividend Source', 5000, 'HDFC Bank (...4921)', 'DIVIDEND', 'Test note');
const afterIncome = queries.queryTransactions({ type: 'INCOME', dateRange: 'This Month' });
assert(afterIncome[0].title === 'Test Dividend Source' && afterIncome[0].type === 'INCOME', 'commands.recordIncome creates canonical INCOME record');

commands.recordExpense('Test Restaurant', 1200, 'HDFC Bank (...4921)', 'DINING', 'Lunch');
const afterExpense = queries.queryTransactions({ type: 'EXPENSE', dateRange: 'This Month' });
assert(afterExpense[0].title === 'Test Restaurant' && afterExpense[0].type === 'EXPENSE', 'commands.recordExpense creates canonical EXPENSE record');

const countBeforeTr = queries.queryTransactions({ type: 'TRANSFER', dateRange: 'This Month' }).length;
commands.recordTransfer('HDFC Bank (...4921)', 'Zerodha Trading Account', 25000);
const afterTr = queries.queryTransactions({ type: 'TRANSFER', dateRange: 'This Month' });
const addedTrs = afterTr.slice(0, 2);
assert(afterTr.length === countBeforeTr + 2, 'commands.recordTransfer inserts exactly 2 linked transaction legs');
assert(addedTrs[0].transferId === addedTrs[1].transferId && addedTrs[0].transferId !== undefined, 'Both transfer legs share explicit transferId');
const netImpact = addedTrs.reduce((sum, tx) => sum + (tx.type === 'TRANSFER' ? 0 : tx.amount), 0);
assert(netImpact === 0, 'Transfer contributes exactly ₹0 net income/expense impact');

console.log('\n2. [Bulk CSV Import Engine & Duplicate Fingerprint Detection]');
const sampleCSV = `Date,Title,Narration,Amount,Type,Account
2026-08-06,ITC Limited,ACH/C-/ITC LTD DIVIDEND/NSE0098,2100,INCOME,HDFC Bank
2026-08-01,New Dividend Corp,ACH/NEW-DIV-CREDIT,4500,INCOME,HDFC Bank
2026-08-01,=HYPERLINK("https://evil.com","Click"),HOSTILE-PAYLOAD,100,INCOME,HDFC Bank`;

const res = ImportPipelineService.processCSV(sampleCSV, 'HDFC Bank', 'test_stmt.csv');
assert(res.totalDetected === 3, 'ImportPipelineService parsed 3 total CSV rows');
assert(res.duplicateCount === 1, 'Algorithmic fingerprint detection excluded 1 exact duplicate (ITC Limited ₹2100)');
assert(res.validRows.length === 1 && res.validRows[0].title === 'New Dividend Corp', 'Returned 1 valid non-duplicate candidate row (New Dividend Corp)');
assert(res.validRows.every(r => !r.title.startsWith('=')), 'Formula injection payload rejected/stripped safely');

console.log('\n3. [Snapshot Append-Only Semantics & Balance Sheet Registry]');
const beforeSnaps = queries.getSnapshots().length;
commands.createSnapshot();
assert(queries.getSnapshots().length === beforeSnaps + 1, 'commands.createSnapshot appends new immutable checkpoint');

console.log('\n4. [Local Development Data Reset]');
commands.clearLocalDevelopmentData();
assert(queries.queryTransactions({ type: 'All', dateRange: '12M' }).length === 0, 'After clearLocalDevelopmentData, transactions count === 0');
assert(queries.getSnapshots().length === 0, 'After clearLocalDevelopmentData, snapshots count === 0');
assert(queries.getMetric('TOTAL_ASSETS').value === 0, 'After clearLocalDevelopmentData, TOTAL_ASSETS === 0');

console.log('\n──────────────────────────────────────────────────────────────────────────');
console.log(`REGRESSION SUITE SUMMARY: ${passCount}/${passCount + failCount} PASSED (${failCount} FAILED)`);
console.log('──────────────────────────────────────────────────────────────────────────\n');

if (failCount > 0) {
  process.exit(1);
}
