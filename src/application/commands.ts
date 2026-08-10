import { repository } from '../repositories';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { ImportPipelineService } from '../services/ImportPipelineService';
import { Transaction } from '../domain/types';

const SAMPLE_DEFAULT_CSV = `Date,Title,Narration,Amount,Type,Account
2026-08-06,ITC Limited,ACH/C-/ITC LTD DIVIDEND/NSE0098,2100,INCOME,HDFC Bank
2026-08-04,Coal India Ltd,ECS/C/COAL INDIA INT DIVIDEND,1500,INCOME,SBI Bank
2026-08-01,Imported Payout 1,ACH/C/DIVIDEND-CREDIT-ROW-1,1000,INCOME,HDFC Bank (...4921)
2026-08-01,Imported Payout 2,ACH/C/DIVIDEND-CREDIT-ROW-2,1000,INCOME,HDFC Bank (...4921)`;

export class FinancialCommands {
  static recordIncome(title: string, amount: number, account: string, category: string, notes?: string): void {
    repository.transactions.append({
      id: 'tx-cmd-' + Date.now(),
      date: '2026-08-09',
      dateStr: '09 Aug 2026',
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
      id: 'tx-cmd-' + Date.now(),
      date: '2026-08-09',
      dateStr: '09 Aug 2026',
      title,
      narration: 'MANUAL/' + title.toUpperCase(),
      account,
      type: 'Expense',
      category,
      amount,
      status: 'CLEARED',
      notes
    });
  }

  static recordTransfer(source: string, destination: string, amount: number): void {
    repository.transactions.append({
      id: 'tr-cmd-' + Date.now(),
      date: '2026-08-09',
      dateStr: '09 Aug 2026',
      title: 'Transfer to ' + destination,
      narration: 'TRANSFER/' + source + '-' + destination,
      account: source,
      type: 'Transfer',
      category: 'TRANSFER',
      amount,
      status: 'CLEARED'
    });
  }

  static recordAsset(name: string, amount: number): void {
    repository.assets.add({ name, amount });
  }

  static recordLiability(name: string, amount: number): void {
    repository.liabilities.add({ name, amount });
  }

  static createSnapshot(): void {
    repository.snapshots.create({
      id: 'snap-cmd-' + Date.now(),
      dateStr: '09 Aug 2026 (Today)',
      totalAssets: 0,
      totalLiabilities: 0,
      netWorth: 0,
      status: 'Anchored Permanent'
    });
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
