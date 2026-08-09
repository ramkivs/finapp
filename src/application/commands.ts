import { useCanonicalLedger } from '../store/useCanonicalLedger';

export class FinancialCommands {
  static recordIncome(title: string, amount: number, account: string, category: string, notes?: string): void {
    useCanonicalLedger.getState().addIncome(title, amount, account, category, notes);
  }

  static recordExpense(title: string, amount: number, account: string, category: string, notes?: string): void {
    useCanonicalLedger.getState().addExpense(title, amount, account, category, notes);
  }

  static recordTransfer(source: string, destination: string, amount: number): void {
    useCanonicalLedger.getState().addTransfer(source, destination, amount);
  }

  static recordAsset(name: string, amount: number): void {
    useCanonicalLedger.getState().addAsset(name, amount);
  }

  static recordLiability(name: string, amount: number): void {
    useCanonicalLedger.getState().addLiability(name, amount);
  }

  static createSnapshot(): void {
    useCanonicalLedger.getState().captureSnapshot();
  }

  static importStatement(): { appended: number; duplicates: number } {
    return useCanonicalLedger.getState().commitImportedRows();
  }

  static togglePrivacy(): void {
    useCanonicalLedger.getState().togglePrivacy();
  }
}
