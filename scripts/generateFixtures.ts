import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const sbiRealXlsxCsvContent = `State Bank of India
Account Statement for 00000030099509044

Date,Details,Ref No/Cheque No,Debit,Credit,Balance
18/08/2026," DEP TFR NEFT*ICIC0099999*IN22623041581819*IIF
 L SAMASTA FI   0099509044300 AT 05199 MADIPAKKAM",TRANSFER-999, ,1.00,928.10
19/08/2026," DEP TFR NEFT*ICIC0099999*IN22623142656536*MID
 LAND MICROFI   0099509044300 AT 05199 MADIPAKKAM",TRANSFER-1000, ,604.93,1533.03
20/08/2026,ATM WITHDRAWAL MADIPAKKAM,CHQ-1001,500.00, ,1033.03`;

const iciciHeaders = ['S No.', 'Value Date', 'Transaction Date', 'Cheque Number', 'Transaction Remarks', 'Withdrawal Amount(INR)', 'Deposit Amount(INR)', 'Balance(INR)'];
const iciciRows = [
  ['1', '17/08/2026', '17/08/2026', '0000002619328559', 'ACH/C/PCBL INT DIV/2026', '', '36.00', '442.38'],
  ['2', '18/08/2026', '18/08/2026', '0000002626679499', 'ACH/C/COAL INDIA DIVIDEND', '', '83.00', '525.38'],
  ['3', '19/08/2026', '19/08/2026', '0000623110010073', 'ATM CASH WITHDRAWAL CHENNAI', '3000.00', '', '660.38']
];

// Generate ICICI .xls
const iciciWb = XLSX.utils.book_new();
const iciciWs = XLSX.utils.aoa_to_sheet([iciciHeaders, ...iciciRows]);
XLSX.utils.book_append_sheet(iciciWb, iciciWs, 'Sheet1');
const iciciBytes = XLSX.write(iciciWb, { type: 'buffer', bookType: 'xls' });
fs.writeFileSync('./scripts/fixtures/ICICI_Statement.xls', iciciBytes);

// Generate SBI .xlsx
const sbiWb = XLSX.read(sbiRealXlsxCsvContent, { type: 'string' });
const sbiBytes = XLSX.write(sbiWb, { type: 'buffer', bookType: 'xlsx' });
fs.writeFileSync('./scripts/fixtures/SBI_Statement.xlsx', sbiBytes);

console.log('Fixtures generated successfully.');
