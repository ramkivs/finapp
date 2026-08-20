import { BankStatementAdapter, StatementInput, DetectionResult, BankStatementRecord, NormalizedBankTransaction, ParsedCsvRow } from '../ImportTypes';
import { SpreadsheetStatementParser } from '../parsers/SpreadsheetStatementParser';
import { AmountNormalizer } from '../normalization/AmountNormalizer';
import { BankTransactionNormalizer } from '../normalization/BankTransactionNormalizer';

export class SbiStatementAdapter implements BankStatementAdapter {
  readonly id = 'sbi';
  readonly displayName = 'State Bank of India (SBI)';

  canHandle(input: StatementInput): DetectionResult {
    const content = input.kind === 'text' ? input.content : '';
    const upper = content.toUpperCase();

    // Multi-indicator signature check:
    const hasDetails = upper.includes('DETAILS') || upper.includes('DESCRIPTION') || upper.includes('PARTICULARS');
    const hasRefNo = upper.includes('REF NO/CHEQUE NO') || upper.includes('REF NO') || upper.includes('CHEQUE NO');
    const hasDebit = upper.includes('DEBIT') || upper.includes('WITHDRAWAL');
    const hasCredit = upper.includes('CREDIT') || upper.includes('DEPOSIT');
    const hasSbi = upper.includes('STATE BANK OF INDIA') || upper.includes('SBI');

    if ((hasDetails && hasRefNo && hasDebit && hasCredit) || (hasSbi && hasDetails && (hasDebit || hasCredit))) {
      return {
        matched: true,
        formatId: 'sbi',
        displayName: this.displayName,
        confidence: 'HIGH',
        reason: 'Matched multi-indicator SBI statement signature'
      };
    }

    return {
      matched: false,
      formatId: 'sbi',
      displayName: this.displayName,
      confidence: 'NONE',
      reason: 'Does not match SBI multi-indicator signature'
    };
  }

  canHandleRows(headers: string[], rows: ParsedCsvRow[]): DetectionResult {
    const headerStr = headers.join(' ').toUpperCase();

    const hasDetails = headerStr.includes('DETAILS') || headerStr.includes('DESCRIPTION') || headerStr.includes('PARTICULARS');
    const hasRefNo = headerStr.includes('REF NO/CHEQUE NO') || headerStr.includes('REF NO') || headerStr.includes('CHEQUE NO');
    const hasDebit = headerStr.includes('DEBIT') || headerStr.includes('WITHDRAWAL');
    const hasCredit = headerStr.includes('CREDIT') || headerStr.includes('DEPOSIT');

    if (hasDetails && hasRefNo && hasDebit && hasCredit) {
      return {
        matched: true,
        formatId: 'sbi',
        displayName: this.displayName,
        confidence: 'HIGH',
        reason: 'Matched multi-indicator SBI statement header signature'
      };
    }

    return {
      matched: false,
      formatId: 'sbi',
      displayName: this.displayName,
      confidence: 'NONE',
      reason: 'Does not match SBI header signature'
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
      // SBI Column headers: Date, Details, Ref No/Cheque No, Debit, Credit, Balance
      const txDateStr = d['date'] || d['tx date'] || d['txn date'] || '';
      const details = d['details'] || d['particulars'] || d['description'] || d['narration'] || '';
      const refNo = d['ref no/cheque no'] || d['ref no'] || d['cheque no'] || '';
      const debitStr = d['debit'] || d['withdrawal'] || '';
      const creditStr = d['credit'] || d['deposit'] || '';
      const balanceStr = d['balance'] || '';

      // Skip invalid non-date header rows
      if (!txDateStr || !/\d/.test(txDateStr)) return;

      const debitAmount = AmountNormalizer.parseAmount(debitStr);
      const creditAmount = AmountNormalizer.parseAmount(creditStr);
      const closingBalance = AmountNormalizer.parseAmount(balanceStr);

      records.push({
        sourceBank: 'SBI Bank',
        transactionDate: txDateStr,
        narration: details,
        referenceNumber: refNo,
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
      provider: 'SBI Bank',
      fileName: context.fileName,
      batchId: context.batchId
    });
  }
}
