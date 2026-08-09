import { repository } from '../repositories';
import { Transaction } from '../domain/types';

export class FinancialCommands {
  static recordIncome(title: string, amount: number, account: string, category: string, notes?: string): void {
    repository.transactions.append({
      id: 'tx-' + Date.now(),
      date: '2026-08-09',
      dateStr: '09 Aug 2026',
      title,
      narration: 'MANUAL/' + title.toUpperCase(),
      account,
      type: 'INCOME',
      category,
      amount,
      status: 'CLEARED',
      notes
    });
  }

  static recordExpense(title: string, amount: number, account: string, category: string, notes?: string): void {
    repository.transactions.append({
      id: 'tx-' + Date.now(),
      date: '2026-08-09',
      dateStr: '09 Aug 2026',
      title,
      narration: 'MANUAL/' + title.toUpperCase(),
      account,
      type: 'EXPENSE',
      category,
      amount,
      status: 'CLEARED',
      notes
    });
  }

  static recordTransfer(source: string, destination: string, amount: number): void {
    repository.transactions.append({
      id: 'tr-' + Date.now(),
      date: '2026-08-09',
      dateStr: '09 Aug 2026',
      title: destination,
      narration: 'TRANSFER/' + source + '->' + destination,
      account: source,
      type: 'TRANSFER',
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
      id: 'snap-' + Date.now(),
      dateStr: '09 Aug 2026 (Today)',
      totalAssets: 0,
      totalLiabilities: 0,
      netWorth: 0,
      status: 'Anchored Permanent'
    });
  }

  static importTransactions(transactions: Transaction[]): void {
    repository.transactions.appendMany(transactions);
  }

  static clearLocalDevelopmentData(): void {
    repository.clearLocalData();
  }
}
