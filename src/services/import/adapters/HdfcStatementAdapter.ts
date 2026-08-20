import { BankStatementAdapter, StatementInput, DetectionResult, BankStatementRecord, NormalizedBankTransaction, ParsedCsvRow } from '../ImportTypes';
import { FixedWidthStatementParser } from '../parsers/FixedWidthStatementParser';
import { CsvRecordParser } from '../parsers/CsvRecordParser';
import { AmountNormalizer } from '../normalization/AmountNormalizer';
import { BankTransactionNormalizer } from '../normalization/BankTransactionNormalizer';

export class HdfcStatementAdapter implements BankStatementAdapter {
  readonly id = 'hdfc';
  readonly displayName = 'HDFC Bank Statement';

  canHandle(input: StatementInput): DetectionResult {
    const text = input.kind === 'text' ? input.content : '';
    const upper = text.toUpperCase();

    // Multi-indicator signature check:
    const hasHdfcName = upper.includes('HDFC BANK');
    const hasWithdrawal = upper.includes('WITHDRAWAL AMT');
    const hasDeposit = upper.includes('DEPOSIT AMT');
    const hasClosing = upper.includes('CLOSING BALANCE');
    const hasChqRef = upper.includes('CHQ./REF.NO') || upper.includes('CHQ/REF');

    if ((hasWithdrawal && hasDeposit && (hasClosing || hasChqRef)) || (hasHdfcName && (hasWithdrawal || hasDeposit))) {
      return {
        matched: true,
        formatId: 'hdfc',
        displayName: this.displayName,
        confidence: 'HIGH',
        reason: 'Matched multi-indicator HDFC statement signature'
      };
    }

    return {
      matched: false,
      formatId: 'hdfc',
      displayName: this.displayName,
      confidence: 'NONE',
      reason: 'Does not match HDFC multi-indicator signature'
    };
  }

  canHandleRows(headers: string[], rows: ParsedCsvRow[]): DetectionResult {
    const headerStr = headers.join(' ').toUpperCase();

    const hasWithdrawal = headerStr.includes('WITHDRAWAL AMT');
    const hasDeposit = headerStr.includes('DEPOSIT AMT');
    const hasClosing = headerStr.includes('CLOSING BALANCE');
    const hasChqRef = headerStr.includes('CHQ./REF.NO') || headerStr.includes('CHQ/REF');

    if (hasWithdrawal && hasDeposit && (hasClosing || hasChqRef)) {
      return {
        matched: true,
        formatId: 'hdfc',
        displayName: this.displayName,
        confidence: 'HIGH',
        reason: 'Matched multi-indicator HDFC statement header signature'
      };
    }

    return {
      matched: false,
      formatId: 'hdfc',
      displayName: this.displayName,
      confidence: 'NONE',
      reason: 'Does not match HDFC header signature'
    };
  }

  parse(input: StatementInput): BankStatementRecord[] {
    if (input.kind !== 'text') return [];
    const text = input.content;

    // Check if comma-delimited HDFC CSV vs fixed-width text statement
    const isCsv = text.includes(',') && text.split('\n')[0]?.includes(',');

    if (isCsv) {
      const { rows } = CsvRecordParser.parse(text);
      return this.parseRows(rows, input.fileName);
    }

    // Text / ASCII fixed-width statement parsing with multiline continuation merging
    const parsedRecords = FixedWidthStatementParser.parseHdfcText(text);

    return parsedRecords.map(rec => {
      const debitAmount = AmountNormalizer.parseAmount(rec.withdrawalStr);
      const creditAmount = AmountNormalizer.parseAmount(rec.depositStr);
      const closingBalance = AmountNormalizer.parseAmount(rec.balanceStr);

      return {
        sourceBank: 'HDFC Bank',
        transactionDate: rec.dateStr,
        valueDate: rec.valueDateStr,
        narration: rec.narration,
        referenceNumber: rec.refNumber,
        debitAmount,
        creditAmount,
        closingBalance,
        sourceRowNumber: rec.sourceRowNumber,
        sourceFile: input.fileName
      };
    });
  }

  /**
   * Parse pre-decoded ParsedCsvRow[] from binary HDFC CSV workbook.
   * For fixed-width HDFC text statements, the binary path is not applicable
   * (they are plain-text downloads, not binary XLS/XLSX).
   */
  parseRows(rows: ParsedCsvRow[], fileName: string): BankStatementRecord[] {
    const records: BankStatementRecord[] = [];

    rows.forEach(r => {
      const d = r.data;
      const dateStr = d['date'] || d['tx date'] || d['value dt'] || '';
      const narration = d['narration'] || d['description'] || '';
      const refNo = d['chq./ref.no.'] || d['chq/ref.no'] || d['ref no'] || '';
      const valueDt = d['value dt'] || '';
      const withdrawalStr = d['withdrawal amt.'] || d['withdrawal amt'] || d['withdrawal'] || '';
      const depositStr = d['deposit amt.'] || d['deposit amt'] || d['deposit'] || '';
      const closingStr = d['closing balance'] || d['balance'] || '';

      if (!dateStr || !/\d/.test(dateStr)) return;

      const debitAmount = AmountNormalizer.parseAmount(withdrawalStr);
      const creditAmount = AmountNormalizer.parseAmount(depositStr);
      const closingBalance = AmountNormalizer.parseAmount(closingStr);

      records.push({
        sourceBank: 'HDFC Bank',
        transactionDate: dateStr,
        valueDate: valueDt,
        narration,
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
      provider: 'HDFC Bank',
      fileName: context.fileName,
      batchId: context.batchId
    });
  }
}
