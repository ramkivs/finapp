import { Transaction } from '../domain/types';
import { Sha256Service } from './Sha256Service';

export interface CSVImportResult {
  batchId: string;
  totalDetected: number;
  validRows: Transaction[];
  duplicateCount: number;
  ambiguousCount: number;
  invalidCount: number;
}

export class ImportPipelineService {
  /**
   * Generates a genuine SHA-256 hexadecimal digest (64 hex characters)
   * of the canonical transaction string `${account}|${date}|${amount}|${narration}`.
   */
  static generateFingerprint(tx: { account: string; date: string; amount: number; narration: string }): string {
    const canonicalString = `${tx.account}|${tx.date}|${tx.amount}|${tx.narration.toLowerCase().trim()}`;
    return Sha256Service.hash(canonicalString);
  }

  /**
   * Enforces security sanitization against spreadsheet formula injections.
   * Legitimate negative financial numbers (e.g. -1250, -50000, -235.50) are preserved verbatim.
   */
  static sanitizeCell(val: string): string {
    if (!val) return '';
    let s = val.trim();
    // Legitimate signed financial numbers (-1250, -50000, -235.50, +500) are NEVER hostile formulas
    if (/^[-+]\s*\d+(\.\d+)?$/.test(s)) {
      return s;
    }
    // Check for hostile spreadsheet formulas (=HYPERLINK(...), =IMPORTXML(...), =cmd|... or leading =, @, +, -)
    if (/^[=@+\-]/.test(s) || /=(HYPERLINK|IMPORTXML|cmd\|)/i.test(s)) {
      s = s.replace(/^[=@+\-]+/, '').trim();
      if (/^(HYPERLINK|IMPORTXML|cmd\|)/i.test(s)) {
        s = s.replace(/^(HYPERLINK|IMPORTXML|cmd\|)\s*\(?/i, '[Sanitized-Formula] ');
      } else {
        s = '[Sanitized-Formula] ' + s;
      }
    }
    return s;
  }

  static isHostileFormula(val: string): boolean {
    if (!val) return false;
    const s = val.trim();
    if (/^[-+]\s*\d+(\.\d+)?$/.test(s)) {
      return false;
    }
    return /^[=@]/.test(s) || /^[-+]\s*[^0-9\s]/.test(s) || /=(HYPERLINK|IMPORTXML|cmd\|)/i.test(s);
  }

  static parseCSVText(csvText: string): Array<Record<string, string>> {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    // Smart CSV parser handling quotes and formula parentheses
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      let inParens = 0;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
          current += char;
        } else if (char === '(' && !inQuotes) {
          inParens++;
          current += char;
        } else if (char === ')' && !inQuotes) {
          if (inParens > 0) inParens--;
          current += char;
        } else if (char === ',' && !inQuotes && inParens === 0) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/["']/g, ''));
    const rows: Array<Record<string, string>> = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]).map(v => v.replace(/^["']|["']$/g, ''));
      if (values.length < headers.length) continue;
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      rows.push(row);
    }
    return rows;
  }

  static processCSV(
    csvText: string,
    existingTransactions: Transaction[],
    provider: string = 'CSV Import',
    fileName: string = 'upload.csv'
  ): CSVImportResult {
    const batchId = 'batch-' + Date.now();
    const rows = this.parseCSVText(csvText);
    const validRows: Transaction[] = [];
    let duplicateCount = 0;
    let invalidCount = 0;
    let ambiguousCount = 0;

    const existingFingerprints = new Set(
      existingTransactions.map(tx => this.generateFingerprint({
        account: tx.account,
        date: tx.date,
        amount: tx.amount,
        narration: tx.narration
      }))
    );

    const seenInBatch = new Set<string>();

    rows.forEach((row, index) => {
      const dateVal = row['date'] || row['tx_date'] || row['transaction date'] || '';
      const titleVal = this.sanitizeCell(row['title'] || row['description'] || row['name'] || row['payee'] || 'Imported Transaction');
      const narrationVal = this.sanitizeCell(row['narration'] || row['memo'] || row['details'] || titleVal);
      const amountRaw = row['amount'] || row['val'] || row['value'] || '0';
      const typeValRaw = (row['type'] || row['tx_type'] || 'INCOME').toUpperCase();
      const accountVal = this.sanitizeCell(row['account'] || row['bank'] || provider);

      // Validate date (YYYY-MM-DD format check)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
        invalidCount++;
        return;
      }

      // Allow negative or positive amounts (strip sign for absolute amount if needed, or parse directly)
      const parsedNumeric = parseFloat(amountRaw);
      if (isNaN(parsedNumeric) || parsedNumeric === 0) {
        invalidCount++;
        return;
      }

      const amount = Math.abs(parsedNumeric);

      let type: 'Income' | 'Expense' | 'Transfer' = 'Income';
      if (typeValRaw.includes('EXPENSE') || typeValRaw.includes('DEBIT') || parsedNumeric < 0) {
        type = 'Expense';
      } else if (typeValRaw.includes('TRANSFER')) {
        type = 'Transfer';
      }

      const candidate: Transaction = {
        id: `tx-import-${batchId}-${index + 1}`,
        date: dateVal,
        dateStr: dateVal,
        title: titleVal,
        narration: narrationVal,
        account: accountVal,
        type,
        category: row['category'] || 'GENERAL',
        amount,
        status: 'CLEARED',
        notes: `Imported from ${fileName}`,
        importBatchId: batchId,
        sourceProvider: provider,
        sourceFile: fileName,
        sourceRowNumber: index + 1
      };

      const fp = this.generateFingerprint(candidate);
      candidate.fingerprint = fp;

      if (existingFingerprints.has(fp) || seenInBatch.has(fp)) {
        duplicateCount++;
        return;
      }

      seenInBatch.add(fp);
      existingFingerprints.add(fp);
      validRows.push(candidate);
    });

    return {
      batchId,
      totalDetected: rows.length,
      validRows,
      duplicateCount,
      ambiguousCount,
      invalidCount
    };
  }
}
