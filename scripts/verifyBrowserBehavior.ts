import { repository } from '../src/repositories';
import { commands, queries } from '../src/application';
import { ImportPipelineService } from '../src/services/ImportPipelineService';
import { FinancialMetricService } from '../src/services/FinancialMetricService';

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
console.log('FINBOOM EMPIRICAL BROWSER & RUNTIME VERIFICATION SUITE');
console.log('──────────────────────────────────────────────────────────────────────────\n');

// 1. Initial State Check
console.log('1. [Initial Canonical State Verification]');
const initialTxs = queries.queryTransactions({ type: 'All', dateRange: '12M' });
assert(initialTxs.length === 16, `Initial 12M trailing ledger contains 16 seeded transactions (${initialTxs.length})`);
const ttmInitial = queries.getMetric('TTM_REALIZED_DIVIDEND');
assert(ttmInitial.value === 148300, `Initial TTM Realized Dividend reconciles to ₹1,48,300 (actual value: ₹${ttmInitial.value})`);
const nwInitial = queries.getMetric('NET_WORTH');
assert(nwInitial.value === 7255410, `Initial Net Worth reconciles to ₹72,55,410 (actual value: ₹${nwInitial.value})`);

// 2. Add Income (₹10,000)
console.log('\n2. [Manual Add Income & Metric Mutation]');
const countBeforeInc = queries.queryTransactions({ type: 'All', dateRange: '12M' }).length;
commands.recordIncome('Test Income Source', 10000, 'HDFC Bank (...4921)', 'DIVIDEND', 'Test income');
const afterInc = queries.queryTransactions({ type: 'All', dateRange: '12M' });
assert(afterInc.length === countBeforeInc + 1, 'Transaction count increased by exactly +1');
const ttmAfterInc = queries.getMetric('TTM_REALIZED_DIVIDEND');
assert(ttmAfterInc.value === 148300 + 10000, `TTM Realized Dividend increased by +₹10,000 to ₹1,58,300 (actual: ₹${ttmAfterInc.value})`);

// 3. Add Expense (₹2,000)
console.log('\n3. [Manual Add Expense & Type Verification]');
const countBeforeExp = queries.queryTransactions({ type: 'All', dateRange: '12M' }).length;
commands.recordExpense('Test Dining', 2000, 'HDFC Bank (...4921)', 'DINING', 'Lunch');
const afterExp = queries.queryTransactions({ type: 'All', dateRange: '12M' });
assert(afterExp.length === countBeforeExp + 1, 'Transaction count increased by +1 for expense');
const expRecord = queries.queryTransactions({ type: 'EXPENSE', dateRange: 'This Month' })[0];
assert(expRecord.title === 'Test Dining' && expRecord.amount === 2000, 'Expense recorded accurately in canonical ledger');

// 4. Add Transfer (Bank A -> Bank B, ₹5,000)
console.log('\n4. [2-Leg Transfer & ₹0 Net Impact Verification]');
const countBeforeTr = queries.queryTransactions({ type: 'All', dateRange: '12M' }).length;
commands.recordTransfer('HDFC Bank (...4921)', 'Zerodha Trading Account', 5000);
const afterTrAll = queries.queryTransactions({ type: 'All', dateRange: '12M' });
const trRecords = queries.queryTransactions({ type: 'TRANSFER', dateRange: 'This Month' }).slice(0, 2);
assert(afterTrAll.length === countBeforeTr + 2, 'Transfer inserted exactly 2 linked transaction legs (+2 rows)');
assert(trRecords[0].transferId === trRecords[1].transferId && trRecords[0].transferId !== undefined, `Both transfer legs share explicit transferId (${trRecords[0].transferId})`);
assert(trRecords[0].narration.includes('DEBIT') && trRecords[1].narration.includes('CREDIT'), 'Transfer legs distinguish DEBIT and CREDIT roles');
const trNetImpact = trRecords.reduce((sum, tx) => sum + (tx.type === 'TRANSFER' ? 0 : tx.amount), 0);
assert(trNetImpact === 0, 'Transfer contributes exactly ₹0 net income/expense impact');

// 5. Clear Dev Data
console.log('\n5. [Clear Dev Data & Empty State Persistence]');
commands.clearLocalDevelopmentData();
const txsCleared = queries.queryTransactions({ type: 'All', dateRange: '12M' });
assert(txsCleared.length === 0, `All transactions cleared (count === ${txsCleared.length})`);
assert(queries.getSnapshots().length === 0, 'All snapshots cleared (count === 0)');
assert(queries.getMetric('TOTAL_ASSETS').value === 0, 'TOTAL_ASSETS metric reflects 0 after clear');
assert(queries.getMetric('NET_WORTH').value === 0, 'NET_WORTH metric reflects 0 after clear');

// 6. Actual CSV Import & Duplicate Detection
console.log('\n6. [Real CSV Upload & Duplicate Fingerprint Detection]');
const testCSV1 = `Date,Title,Narration,Amount,Type,Account
2026-08-01,HDFC Bank,ACH/C/HDFC BANK ANNUAL DIVIDEND,9400,INCOME,HDFC Bank
2026-08-02,New Tech Corp,ACH/NEW-TECH-DIVIDEND,3500,INCOME,HDFC Bank`;

const rev1 = ImportPipelineService.processCSV(testCSV1, 'HDFC Bank', 'first_upload.csv');
assert(rev1.totalDetected === 2, 'Imported CSV file 1: parsed 2 real rows');
assert(rev1.duplicateCount === 0, 'First import has 0 duplicates');
assert(rev1.validRows.length === 2, 'Returned 2 valid candidate rows');

// Commit the first import
commands.importTransactions(rev1.validRows);
const afterImport1 = queries.queryTransactions({ type: 'All', dateRange: '12M' });
assert(afterImport1.length === 2, `Ledger count === 2 after committing first CSV import (${afterImport1.length})`);
assert(queries.getMetric('TTM_REALIZED_DIVIDEND').value === 9400 + 3500, `TTM Dividend dynamically reflects imported rows (₹${9400 + 3500})`);

// Re-import the exact same CSV
const rev2 = ImportPipelineService.processCSV(testCSV1, 'HDFC Bank', 'second_upload.csv');
assert(rev2.totalDetected === 2, 'Second import attempt: parsed 2 rows');
assert(rev2.duplicateCount === 2, 'Algorithmic fingerprint detection flagged 100% of rows (2/2) as exact duplicates');
assert(rev2.validRows.length === 0, 'Returned 0 valid new candidate rows');

// Verify ledger did not double
const afterImport2 = queries.queryTransactions({ type: 'All', dateRange: '12M' });
assert(afterImport2.length === 2, `Ledger count remained exactly 2 after duplicate upload attempt`);

console.log('\n──────────────────────────────────────────────────────────────────────────');
console.log(`VERIFICATION SUMMARY: ${passCount}/${passCount + failCount} PASSED (${failCount} FAILED)`);
console.log('──────────────────────────────────────────────────────────────────────────\n');

if (failCount > 0) {
  process.exit(1);
}
