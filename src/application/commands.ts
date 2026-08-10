import { repository } from '../repositories';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { ImportPipelineService } from '../services/ImportPipelineService';
import { Transaction, APP_AS_OF_DATE } from '../domain/types';
import { formatDisplayDate } from '../services/DateRangeService';

const SAMPLE_DEFAULT_CSV = `Date,Title,Narration,Amount,Type,Account
2026-08-06,ITC Limited,ACH/C-/ITC LTD DIVIDEND/NSE0098,2100,INCOME,HDFC Bank
2026-08-04,Coal India Ltd,ECS/C/COAL INDIA INT DIVIDEND,1500,INCOME,SBI Bank
2026-08-01,Imported Payout 1,ACH/C/DIVIDEND-CREDIT-ROW-1,1000,INCOME,HDFC Bank (...4921)
2026-08-01,Imported Payout 2,ACH/C/DIVIDEND-CREDIT-ROW-2,1000,INCOME,HDFC Bank (...4921)`;

export class FinancialCommands {
  static recordIncome(title: string, amount: number, account: string, category: string, notes?: string): void {
    repository.transactions.append({
      id: 'tx-inc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      date: APP_AS_OF_DATE,
      dateStr: formatDisplayDate(APP_AS_OF_DATE),
      title,
      narration: 'MANUAL/' + title.toUpperCase(),
      account,
      type: 'Income',
      category,
      amount,
      status: 'CLEARED',
      notes
    });
  }

  static recordExpense(title: string, amount: number, account: string, category: string, notes?: string): void {
    repository.transactions.append({
      id: 'tx-exp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      date: APP_AS_OF_DATE,
      dateStr: formatDisplayDate(APP_AS_OF_DATE),
      title,
      narration: 'MANUAL/' + title.toUpperCase(),
      account,
      type: 'Expense',
      category,
      amount,
      status: 'CLEARED',
      notes: notes || 'Manual expense entry'
    });
  }

  static recordTransfer(source: string, destination: string, amount: number): void {
    const trId = 'tr-cmd-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    const debitTx: Transaction = {
      id: trId + '-debit',
      transferId: trId,
      date: APP_AS_OF_DATE,
      dateStr: formatDisplayDate(APP_AS_OF_DATE),
      title: 'Transfer to ' + destination,
      narration: 'TRANSFER-DEBIT/' + trId,
      account: source,
      type: 'Transfer',
      category: 'TRANSFER',
      amount,
      status: 'CLEARED',
      notes: 'Bank-to-Bank Transfer (Debit)'
    };
    const creditTx: Transaction = {
      id: trId + '-credit',
      transferId: trId,
      date: APP_AS_OF_DATE,
      dateStr: formatDisplayDate(APP_AS_OF_DATE),
      title: 'Transfer from ' + source,
      narration: 'TRANSFER-CREDIT/' + trId,
      account: destination,
      type: 'Transfer',
      category: 'TRANSFER',
      amount,
      status: 'CLEARED',
      notes: 'Bank-to-Bank Transfer (Credit)'
    };
    repository.transactions.appendMany([debitTx, creditTx]);
  }

  static recordAsset(name: string, amount: number): void {
    repository.assets.add({ name, amount });
  }

  static recordLiability(name: string, amount: number): void {
    repository.liabilities.add({ name, amount });
  }

  static createSnapshot(): void {
    repository.snapshots.create();
  }

  static importStatement(
    csvText?: string,
    provider: string = 'CSV Upload',
    fileName: string = 'upload.csv'
  ): {
    appended: number;
    duplicates: number;
    totalDetected: number;
    batchId: string;
    validRows: Transaction[];
    invalidCount: number;
  } {
    const textToParse = csvText || SAMPLE_DEFAULT_CSV;
    const existing = repository.transactions.findAllSync();
    const result = ImportPipelineService.processCSV(textToParse, existing, provider, fileName);

    // Commit the unique valid rows to the store and repository
    const storeResult = useCanonicalLedger.getState().commitImportedRows(result.validRows);

    return {
      appended: storeResult.appended,
      duplicates: result.duplicateCount,
      totalDetected: result.totalDetected,
      batchId: result.batchId,
      validRows: result.validRows,
      invalidCount: result.invalidCount
    };
  }

  static async clearLocalDevelopmentData(): Promise<void> {
    await repository.clearLocalData();
  }

  static async loadDemoData(): Promise<void> {
    await repository.loadDemoData();
  }

  static togglePrivacy(): void {
    useCanonicalLedger.getState().togglePrivacy();
  }
}
