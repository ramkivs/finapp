import { ImportPipelineService } from '../src/services/ImportPipelineService';
import * as fs from 'fs';

// ---------------------------------------------------------------------------
// 1. HDFC STATEMENT FIXTURE — 7 TRANSACTIONS
//    All personal names, account/customer IDs, UPI handles, and email replaced
//    with deterministic synthetic values. Financial amounts, dates, and
//    institution/service identifiers (MUTHOOTTU, ACH, etc.) are preserved.
//
//    Trailing-space padding required by the HDFC fixed-width parser is
//    constructed at runtime via padEnd() so the source file contains no
//    literal trailing whitespace (preserves git diff --check cleanliness).
// ---------------------------------------------------------------------------

function p(line: string, width = 162): string {
  // Pad a line to exact fixed-width column count without embedding trailing
  // spaces in the source. Lines that are already longer are returned as-is.
  return line.length >= width ? line : line + ' '.repeat(width - line.length);
}

const hdfcRealStatementContent = [
  'HDFC BANK Ltd.                                     Page No .:   1                                        Statement of accounts',
  '',
  '',
  '                                                                         Account Branch : TESTBRANCH CORNER',
  '                                                                         Address        : NEW NO 01, 1ST FLOOR,',
  '                                                                                          SYNTHETIC TEST ROAD,',
  'MR.     A B TESTPERSON                                                                   TEST TOWER,',
  '001 SYNTHETIC AVENUE                                                     City           : TESTCITY000001',
  'SYNTHETIC TEST STREET                                                    State          : TEST STATE',
  'TESTCITY 000001                                                          Phone no.      : 18002600/18001600',
  'TEST STATE                                                               Email          : testuser@example.com',
  'TESTLOCALITY                                                             OD Limit       : 0  Currency : INR',
  '                                                                         Cust ID        : 00000000001',
  'JOINT HOLDERS :                                                          Account No     : 00000000000000001   VRM POTENTIAL',
  '                                                                         A/C Open Date  : 14/12/2007',
  p('Nomination : Registered                                                  Account Status : Regular'),
  p('Statement From      : 01/08/2026  To: 19/08/2026                         RTGS/NEFT IFSC : HDFC0000166    MICR : 600240011'),
  p('                                                                         Branch Code    : 166'),
  '                                                                         Account Type   : INSTANT SAVING SALARY PREMIUM (161)',
  '--------  ----------------------------------------  ----------------  --------  ------------------  ------------------  ------------------',
  'Date      Narration\t\t\t\t    Chq./Ref.No.      Value Dt  Withdrawal Amt.        Deposit Amt.     Closing Balance',
  '--------  ----------------------------------------  ----------------  --------  ------------------  ------------------  ------------------',
  '',
  '01/08/26  MUTHOOTTU MINI FINAN00000000000078240843  0000262125430965  01/08/26                                153.00            138311.58',
  p('17/08/26  ACH C- PCBL INT DIV 26 27-233237          0000002619328559  17/08/26                                 36.00              442.38'),
  p('18/08/26  ACH C- COAL INDIA LTD-1189998             0000002626679499  18/08/26                                 83.00              525.38'),
  p('19/08/26  NEFT CR-ICIC0099999-SYNTHFUND INDIA REA   IN22623142390670  19/08/26                                135.00              660.38'),
  p('          L ESTATE TRUST-TESTPERSON SYNTHETIC'),
  p('          SYNTHETIC-IN22623142390670'),
  p('19/08/26  UPI-A B TESTPERSON-9999999999@UPITEST-I   0000623167403614  19/08/26                              3,000.00            3,660.38'),
  p('          CIC0002186-623167403614-SENT USING PAYTM'),
  p('          U'),
  p('19/08/26  NWD-512967XXXXXX8183-MC023601-TESTCITY    0000623110010073  19/08/26           3,000.00                                 660.38'),
  p('19/08/26  UPI-SYNTHPAYEE-GPAY-00000000000@TESTPAY   0000659737736915  19/08/26             180.00                                 480.38'),
  p('          IS-UTIB0000553-659737736915-UPI'),
  '',
  '',
  '********  ****************************************  ****************  ********  ******************  ******************  ******************',
  '******************************************************************************************************************************************',
  '',
  '         STATEMENT SUMMARY  :- ',
  '           Opening Balance                                                      Debits              Credits          Closing Bal ',
  '                    406.38                                                    3,180.00             3,254.00               480.38 ',
  '',
  '                                                                              Dr Count             Cr Count ',
  '                                                                                     2                    4 ',
  '',
  '',
  '             Generated On: 20-AUG-2026 11:45:08                  Generated By:  00000000001             Requesting Branch Code: NET ',
  '',
  '',
  'This is a computer generated statement and does not require signature',
  '',
  'HDFC BANK LIMITED.',
  '',
  '*Closing balance includes funds earmarked for hold and uncleared funds',
  '',
  'Contents of this statement will be considered correct if no error is reported within 30 days of receipt of statement.The address on this statement is that on record with the Bank as at the day of requesting this statement',
  '',
  '',
  'State account branch GSTN:33AAACH2702H1Z7',
  ' HDFC Bank GSTIN number details are available at https://www.hdfcbank.com/personal/making-payments/online-tax-payment/goods-and-service-tax',
  '           Registered Office Address: HDFC Bank House, Senapati Bapat Marg, Lower Parel, Mumbai 400013',
  '                                            ---  End Of Statement ---  '
].join('\n');

// 2. Load True Binary Workbooks
const iciciBinaryData = fs.readFileSync('./scripts/fixtures/ICICI_Statement.xls');
const sbiBinaryData = fs.readFileSync('./scripts/fixtures/SBI_Statement.xlsx');

async function verifyE2E() {
  console.log('==========================================================================');
  console.log('FINAL E2E ACCEPTANCE — REAL BANK FILES (HDFC, ICICI, SBI)');
  console.log('==========================================================================\n');

  let allPass = true;

  // --------------------------------------------------------------------------
  // 1. HDFC BANK REAL STATEMENT
  // --------------------------------------------------------------------------
  console.log('1. [HDFC Bank Native Statement Ingestion]');
  const hdfcRes1 = ImportPipelineService.processCSV(hdfcRealStatementContent, [], 'HDFC Bank', 'HDFC_Real_Statement.txt');

  console.log(`   - Detected Format: ${hdfcRes1.formatDisplayName} (${hdfcRes1.detectedFormatId})`);
  console.log(`   - Total Detected:  ${hdfcRes1.totalDetected}`);
  console.log(`   - Valid Appended:  ${hdfcRes1.validRows.length}`);
  console.log(`   - Duplicates:      ${hdfcRes1.duplicateCount}`);
  console.log(`   - Invalid Rows:    ${hdfcRes1.invalidCount}`);

  const muthootuTx = hdfcRes1.validRows.find(t => t.narration.includes('MUTHOOTTU'));
  const hdfcPass =
    hdfcRes1.detectedFormatId === 'hdfc' &&
    hdfcRes1.validRows.length === 7 &&
    hdfcRes1.duplicateCount === 0 &&
    hdfcRes1.invalidCount === 0 &&
    !!muthootuTx &&
    muthootuTx.date === '2026-08-01' &&
    muthootuTx.amount === 153.00 &&
    muthootuTx.type === 'Income' &&
    muthootuTx.narration.includes('MUTHOOTTU MINI FINAN00000000000078240843');

  if (hdfcPass) {
    console.log('   ✓ PASS: HDFC Real Statement Extracted Flawlessly!');
    console.log(`     - Muthootu Row: Date=${muthootuTx?.date}, Amount=${muthootuTx?.amount}, Type=${muthootuTx?.type}`);
  } else {
    console.log('   ✗ FAIL: HDFC Real Statement Verification Failed!');
    allPass = false;
  }

  // Exact Re-Import HDFC Duplicate Verification
  const hdfcRes2 = ImportPipelineService.processCSV(hdfcRealStatementContent, hdfcRes1.validRows, 'HDFC Bank', 'HDFC_Real_Statement.txt');
  console.log(`   - Re-Import Appended: ${hdfcRes2.validRows.length}, Duplicates: ${hdfcRes2.duplicateCount}`);
  if (hdfcRes2.validRows.length === 0 && hdfcRes2.duplicateCount === 7) {
    console.log('   ✓ PASS: HDFC Exact Re-Import produced 100% duplicates (0 new rows appended).\n');
  } else {
    console.log('   ✗ FAIL: HDFC Re-Import deduplication failed!\n');
    allPass = false;
  }

  // --------------------------------------------------------------------------
  // 2. ICICI BANK NATIVE .XLS STATEMENT
  // --------------------------------------------------------------------------
  console.log('2. [ICICI Bank Native .XLS Statement Ingestion]');
  const iciciRes1 = ImportPipelineService.processBinaryFile(new Uint8Array(iciciBinaryData), [], 'ICICI Bank', 'ICICI_Statement.xls');

  console.log(`   - Detected Format: ${iciciRes1.formatDisplayName} (${iciciRes1.detectedFormatId})`);
  console.log(`   - Total Detected:  ${iciciRes1.totalDetected}`);
  console.log(`   - Valid Appended:  ${iciciRes1.validRows.length}`);
  console.log(`   - Duplicates:      ${iciciRes1.duplicateCount}`);
  console.log(`   - Invalid Rows:    ${iciciRes1.invalidCount}`);

  const iciciPass =
    iciciRes1.detectedFormatId === 'icici' &&
    iciciRes1.validRows.length === 3 &&
    iciciRes1.duplicateCount === 0 &&
    iciciRes1.invalidCount === 0 &&
    iciciRes1.validRows[0].date === '2026-08-17' &&
    iciciRes1.validRows[0].amount === 36.00 &&
    iciciRes1.validRows[0].type === 'Income';

  if (iciciPass) {
    console.log('   ✓ PASS: ICICI .XLS Native Statement Extracted Flawlessly!');
  } else {
    console.log('   ✗ FAIL: ICICI Real Statement Verification Failed!');
    allPass = false;
  }

  // Exact Re-Import ICICI Duplicate Verification
  const iciciRes2 = ImportPipelineService.processBinaryFile(new Uint8Array(iciciBinaryData), iciciRes1.validRows, 'ICICI Bank', 'ICICI_Statement.xls');
  console.log(`   - Re-Import Appended: ${iciciRes2.validRows.length}, Duplicates: ${iciciRes2.duplicateCount}`);
  if (iciciRes2.validRows.length === 0 && iciciRes2.duplicateCount === 3) {
    console.log('   ✓ PASS: ICICI Exact Re-Import produced 100% duplicates (0 new rows appended).\n');
  } else {
    console.log('   ✗ FAIL: ICICI Re-Import deduplication failed!\n');
    allPass = false;
  }

  // --------------------------------------------------------------------------
  // 3. SBI BANK NATIVE .XLSX STATEMENT
  // --------------------------------------------------------------------------
  console.log('3. [SBI Bank Native .XLSX / Multiline Statement Ingestion]');
  const sbiRes1 = ImportPipelineService.processBinaryFile(new Uint8Array(sbiBinaryData), [], 'SBI Bank', 'SBI_Statement.xlsx');

  console.log(`   - Detected Format: ${sbiRes1.formatDisplayName} (${sbiRes1.detectedFormatId})`);
  console.log(`   - Total Detected:  ${sbiRes1.totalDetected}`);
  console.log(`   - Valid Appended:  ${sbiRes1.validRows.length}`);
  console.log(`   - Duplicates:      ${sbiRes1.duplicateCount}`);
  console.log(`   - Invalid Rows:    ${sbiRes1.invalidCount}`);

  const sbiCreditTx = sbiRes1.validRows.find(t => t.narration.includes('SAMASTA FI'));
  const sbiPass =
    sbiRes1.detectedFormatId === 'sbi' &&
    sbiRes1.validRows.length === 3 &&
    sbiRes1.duplicateCount === 0 &&
    sbiRes1.invalidCount === 0 &&
    !!sbiCreditTx &&
    sbiCreditTx.date === '2026-08-18' &&
    sbiCreditTx.amount === 1.00 &&
    sbiCreditTx.type === 'Income' &&
    sbiCreditTx.narration.includes('MADIPAKKAM');

  if (sbiPass) {
    console.log('   ✓ PASS: SBI .XLSX Multiline Statement Extracted Flawlessly!');
  } else {
    console.log('   ✗ FAIL: SBI Real Statement Verification Failed!');
    allPass = false;
  }

  // Exact Re-Import SBI Duplicate Verification
  const sbiRes2 = ImportPipelineService.processBinaryFile(new Uint8Array(sbiBinaryData), sbiRes1.validRows, 'SBI Bank', 'SBI_Statement.xlsx');
  console.log(`   - Re-Import Appended: ${sbiRes2.validRows.length}, Duplicates: ${sbiRes2.duplicateCount}`);
  if (sbiRes2.validRows.length === 0 && sbiRes2.duplicateCount === 3) {
    console.log('   ✓ PASS: SBI Exact Re-Import produced 100% duplicates (0 new rows appended).\n');
  } else {
    console.log('   ✗ FAIL: SBI Re-Import deduplication failed!\n');
    allPass = false;
  }

  console.log('==========================================================================');
  if (allPass) {
    console.log('FINAL E2E ACCEPTANCE PASS: ALL 3 REAL BANK FILES (HDFC, ICICI, SBI) VERIFIED');
  } else {
    console.log('FINAL E2E ACCEPTANCE FAIL: AT LEAST ONE BANK FILE VERIFICATION FAILED');
  }
  console.log('==========================================================================\n');

  if (!allPass) {
    process.exit(1);
  }
}

verifyE2E().catch(err => {
  console.error('Fatal error during E2E verification:', err);
  process.exit(1);
});
