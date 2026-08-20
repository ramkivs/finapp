import { BankStatementAdapter, StatementInput, DetectionResult, BankStatementRecord, NormalizedBankTransaction, ParsedCsvRow } from '../ImportTypes';
import { SpreadsheetStatementParser } from '../parsers/SpreadsheetStatementParser';
import { AmountNormalizer } from '../normalization/AmountNormalizer';
import { BankTransactionNormalizer } from '../normalization/BankTransactionNormalizer';

export class IciciStatementAdapter implements BankStatementAdapter {
  readonly id = 'icici';
  readonly displayName = 'ICICI Bank Statement';

  canHandle(input: StatementInput): DetectionResult {
    const content = input.kind === 'text' ? input.content : '';
    const upper = content.toUpperCase();

    // Multi-indicator signature check:
    const hasRemarks = upper.includes('TRANSACTION REMARKS') || upper.includes('REMARKS');
    const hasWithdrawal = upper.includes('WITHDRAWAL AMOUNT') || upper.includes('WITHDRAWAL AMOUNT(INR)');
    const hasDeposit = upper.includes('DEPOSIT AMOUNT') || upper.includes('DEPOSIT AMOUNT(INR)');
    const hasIcici = upper.includes('ICICI');

    if ((hasRemarks && hasWithdrawal && hasDeposit) || (hasIcici && (hasWithdrawal || hasDeposit))) {
      return {
        matched: true,
        formatId: 'icici',
        displayName: this.displayName,
        confidence: 'HIGH',
        reason: 'Matched multi-indicator ICICI statement signature'
      };
    }

    return {
      matched: false,
      formatId: 'icici',
      displayName: this.displayName,
      confidence: 'NONE',
      reason: 'Does not match ICICI multi-indicator signature'
    };
  }

  canHandleRows(headers: string[], rows: ParsedCsvRow[]): DetectionResult {
    const headerStr = headers.join(' ').toUpperCase();

    const hasRemarks = headerStr.includes('TRANSACTION REMARKS') || headerStr.includes('REMARKS');
    const hasWithdrawal = headerStr.includes('WITHDRAWAL AMOUNT') || headerStr.includes('WITHDRAWAL AMOUNT(INR)');
    const hasDeposit = headerStr.includes('DEPOSIT AMOUNT') || headerStr.includes('DEPOSIT AMOUNT(INR)');

    if (hasRemarks && hasWithdrawal && hasDeposit) {
      return {
        matched: true,
        formatId: 'icici',
        displayName: this.displayName,
        confidence: 'HIGH',
        reason: 'Matched multi-indicator ICICI statement header signature'
      };
    }

    return {
      matched: false,
      formatId: 'icici',
      displayName: this.displayName,
      confidence: 'NONE',
      reason: 'Does not match ICICI header signature'
    };
  }

  parse(input: StatementInput): BankStatementRecord[] {
    if (input.kind !== 'text') return [];
    const { rows } = SpreadsheetStatementParser.parse(input.content);
    return this.parseRows(rows, input.fileName);
  }

  parseRows(rows: ParsedCsvRow[], fileName: string): BankStatementRecord[] {
    const records: BankStatementRecord[] = [];

    rows.forEach(r => {
      const d = r.data;
      // ICICI Column headers: S No., Value Date, Transaction Date, Cheque Number,
      // Transaction Remarks, Withdrawal Amount(INR), Deposit Amount(INR), Balance(INR)
      const txDateStr = d['transaction date'] || d['tx date'] || d['value date'] || d['date'] || '';
      const valDateStr = d['value date'] || '';
      const narration = d['transaction remarks'] || d['remarks'] || d['narration'] || d['description'] || '';
      const chequeNo = d['cheque number'] || d['cheque no'] || d['ref no'] || '';
      const withdrawalStr = d['withdrawal amount(inr)'] || d['withdrawal amount'] || d['withdrawal (inr)'] || d['withdrawal'] || '';
      const depositStr = d['deposit amount(inr)'] || d['deposit amount'] || d['deposit (inr)'] || d['deposit'] || '';
      const balanceStr = d['balance(inr)'] || d['balance (inr)'] || d['balance'] || '';

      // Skip invalid header/summary rows that lack valid date tokens
      if (!txDateStr || !/\d/.test(txDateStr)) return;

      const debitAmount = AmountNormalizer.parseAmount(withdrawalStr);
      const creditAmount = AmountNormalizer.parseAmount(depositStr);
      const closingBalance = AmountNormalizer.parseAmount(balanceStr);

      records.push({
        sourceBank: 'ICICI Bank',
        transactionDate: txDateStr,
        valueDate: valDateStr,
        narration,
        referenceNumber: chequeNo,
        debitAmount,
        creditAmount,
        closingBalance,
        sourceRowNumber: r.rowNumber,
        sourceFile: fileName,
        rawRecord: d
      });
    });

    return records;
  }

  normalize(
    record: BankStatementRecord,
    context: { provider: string; fileName: string; batchId: string }
  ): NormalizedBankTransaction {
    return BankTransactionNormalizer.normalize(record, {
      provider: 'ICICI Bank',
      fileName: context.fileName,
      batchId: context.batchId
    });
  }
}
