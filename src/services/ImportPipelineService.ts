import { Transaction } from '../domain/types';
import { queries } from '../application';

export interface ImportReviewResult {
  totalDetected: number;
  validRows: Transaction[];
  duplicateCount: number;
  ambiguousCount: number;
  batchId: string;
}

export class ImportPipelineService {
  static processCSV(csvText: string, provider: string, fileName: string): ImportReviewResult {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    const batchId = 'batch-' + Date.now();
    const validRows: Transaction[] = [];
    let duplicateCount = 0;
    let ambiguousCount = 0;

    const existingTxs = queries.queryTransactions({ type: 'All', dateRange: '12M' });
    const existingFingerprints = new Set(
      existingTxs.map(t => `${t.account}|${t.date}|${t.amount}|${t.narration.toLowerCase().trim()}`)
    );

    const startIndex = lines[0].toLowerCase().includes('date') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 4) continue;

      // Hostile formula injection defense
      if (cols[1]?.startsWith('=') || cols[2]?.startsWith('=')) {
        continue;
      }

      const date = cols[0] || '2026-08-01';
      const title = cols[1] || `Imported Entry ${i}`;
      const narration = cols[2] || `STMT/ROW-${i}`;
      const amountRaw = parseFloat(cols[3]) || 1000;
      const typeStr = (cols[4] || 'INCOME').toUpperCase();
      const account = cols[5] || 'HDFC Bank';

      const type: 'INCOME' | 'EXPENSE' | 'TRANSFER' =
        typeStr === 'EXPENSE' ? 'EXPENSE' : typeStr === 'TRANSFER' ? 'TRANSFER' : 'INCOME';

      if (typeStr !== 'INCOME' && typeStr !== 'EXPENSE' && typeStr !== 'TRANSFER') {
        ambiguousCount++;
      }

      const tx: Transaction = {
        id: `tx-import-${batchId}-${i}`,
        date,
        dateStr: date,
        title,
        narration,
        account,
        type,
        category: type === 'INCOME' ? 'DIVIDEND' : 'DINING',
        amount: Math.abs(amountRaw),
        status: 'CLEARED',
        notes: `Imported from ${fileName} (Row ${i})`,
        importBatchId: batchId,
        sourceProvider: provider,
        sourceFile: fileName,
        sourceRowNumber: i
      };

      const fp = `${tx.account}|${tx.date}|${tx.amount}|${tx.narration.toLowerCase().trim()}`;
      tx.fingerprint = fp;

      if (existingFingerprints.has(fp)) {
        duplicateCount++;
        continue;
      }

      existingFingerprints.add(fp);
      validRows.push(tx);
    }

    return {
      totalDetected: lines.length - startIndex,
      validRows,
      duplicateCount,
      ambiguousCount,
      batchId
    };
  }
}
