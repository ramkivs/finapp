import { repository } from '../repositories';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { ImportPipelineService } from '../services/ImportPipelineService';
import {
  Transaction,
  APP_AS_OF_DATE,
  AssetType,
  LiabilityType,
  GeographyType,
  NetWorthSnapshot,
  Account,
  ControlledAccountType,
  MonthlyBudget,
  mapTransactionCategoryToBudget,
  BUDGET_CATEGORY_FAMILIES,
  InsurancePolicy,
  PolicyType,
  FinancialGoal,
  GoalTemplateType,
  FinancialProfile
} from '../domain/types';
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

  static recordAssetWithMetadata(params: { name: string; amount: number; type?: AssetType; tag?: string; currency?: string; geography?: GeographyType }): void {
    repository.assets.add(params);
  }

  static recordLiabilityWithMetadata(params: { name: string; amount: number; type?: LiabilityType; currency?: string }): void {
    repository.liabilities.add(params);
  }

  static addPastSnapshot(params: { dateStr: string; totalAssets: number; totalLiabilities: number; label?: string }): void {
    const { dateStr, totalAssets, totalLiabilities, label } = params;
    // Future date validation against APP_AS_OF_DATE
    const parts = dateStr.split("-");
    let targetDate = new Date(dateStr);
    if (parts.length === 3 && parts[0].length === 2) {
      // DD-MM-YYYY
      targetDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    const today = new Date(APP_AS_OF_DATE);
    if (!isNaN(targetDate.getTime()) && targetDate > today) {
      throw new Error("Cannot record a net worth snapshot for a future date.");
    }
    const netWorth = totalAssets - totalLiabilities;
    const snap: NetWorthSnapshot = {
      id: "snap-past-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      dateStr,
      totalAssets,
      totalLiabilities,
      netWorth,
      status: "Anchored Permanent",
      label
    };
    repository.snapshots.create(snap);
  }

  static createSnapshot(label?: string): void {
    if (label) {
      const totalAssets = repository.assets.findAllSync().reduce((sum, a) => sum + a.amount, 0);
      const totalLiabilities = repository.liabilities.findAllSync().reduce((sum, l) => sum + l.amount, 0);
      const netWorth = totalAssets - totalLiabilities;
      repository.snapshots.create({
        id: "snap-" + Date.now(),
        dateStr: formatDisplayDate(APP_AS_OF_DATE) + " (Today)",
        totalAssets,
        totalLiabilities,
        netWorth,
        status: "Anchored Permanent",
        label
      });
    } else {
      repository.snapshots.create();
    }
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

  /* =========================================================================
   * WP-18: Account Commands
   * ========================================================================= */

  static recordAccount(params: {
    name: string;
    type: ControlledAccountType;
    institution?: string;
    lastFourDigits?: string;
    openingBalance: number;
    currency?: string;
    asOfDate?: string;
    notes?: string;
  }): Account {
    if (!params.name || !params.name.trim()) {
      throw new Error('Account name is required.');
    }

    const account: Account = {
      id: 'acc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      name: params.name.trim(),
      type: params.type,
      institution: params.institution?.trim() || undefined,
      lastFourDigits: params.lastFourDigits?.trim() || undefined,
      openingBalance: Number(params.openingBalance) || 0,
      currency: params.currency?.trim() || undefined,
      asOfDate: params.asOfDate || APP_AS_OF_DATE,
      notes: params.notes?.trim() || undefined
    };

    repository.accounts.add(account);
    return account;
  }

  static deleteAccount(id: string): void {
    repository.accounts.remove(id);
  }

  /* =========================================================================
   * WP-18: Monthly Budget Commands
   * ========================================================================= */

  static saveMonthlyBudget(monthStr: string, allocations: Record<string, number>): MonthlyBudget {
    const cleanedAllocations: Record<string, number> = {};
    let totalBudget = 0;

    for (const [cat, amt] of Object.entries(allocations)) {
      const num = Number(amt) || 0;
      if (num > 0) {
        cleanedAllocations[cat] = num;
        totalBudget += num;
      }
    }

    const budget: MonthlyBudget = {
      id: 'budget-' + monthStr,
      monthStr,
      allocations: cleanedAllocations,
      totalBudget,
      updatedAt: new Date().toISOString()
    };

    repository.budgets.save(budget);
    return budget;
  }

  /**
   * Deterministic Trailing-3-Full-Month Expense Average Auto-Suggest.
   * SuggestedBudget(C) = round((Expense_M1 + Expense_M2 + Expense_M3) / 3)
   */
  static autoSuggestBudget(targetMonthStr: string): { allocations: Record<string, number>; totalBudget: number } {
    const [yearStr, monthStr] = targetMonthStr.split('-');
    const targetYear = parseInt(yearStr, 10);
    const targetMonth = parseInt(monthStr, 10);

    // Compute the 3 preceding calendar months (M-1, M-2, M-3)
    const precedingMonths: string[] = [];
    for (let i = 1; i <= 3; i++) {
      let m = targetMonth - i;
      let y = targetYear;
      while (m <= 0) {
        m += 12;
        y -= 1;
      }
      precedingMonths.push(`${y}-${String(m).padStart(2, '0')}`);
    }

    const allTxs = repository.transactions.findAllSync();
    const categoryTotals: Record<string, number> = {};

    for (const tx of allTxs) {
      if (tx.type !== 'Expense') continue;
      const txMonth = tx.date.slice(0, 7); // "YYYY-MM"
      if (precedingMonths.includes(txMonth)) {
        const budgetCat = mapTransactionCategoryToBudget(tx.category);
        categoryTotals[budgetCat] = (categoryTotals[budgetCat] || 0) + tx.amount;
      }
    }

    const allocations: Record<string, number> = {};
    let totalBudget = 0;

    for (const [cat, totalAmt] of Object.entries(categoryTotals)) {
      const avg = Math.round(totalAmt / 3);
      if (avg > 0) {
        allocations[cat] = avg;
        totalBudget += avg;
      }
    }

    return { allocations, totalBudget };
  }

  /**
   * Copy Budget Allocations from Previous Month ($M-1$).
   */
  static copyBudgetFromPreviousMonth(targetMonthStr: string, sourceMonthStr?: string): MonthlyBudget | null {
    let srcMonth = sourceMonthStr;
    if (!srcMonth) {
      const [yearStr, monthStr] = targetMonthStr.split('-');
      let m = parseInt(monthStr, 10) - 1;
      let y = parseInt(yearStr, 10);
      if (m <= 0) {
        m = 12;
        y -= 1;
      }
      srcMonth = `${y}-${String(m).padStart(2, '0')}`;
    }

    const srcBudget = repository.budgets.findForMonthSync(srcMonth);
    if (!srcBudget) return null;

    return this.saveMonthlyBudget(targetMonthStr, { ...srcBudget.allocations });
  }

  /* =========================================================================
   * WP-19: Essentials Commands (Insurance Policies, Goals, Financial Profile)
   * ========================================================================= */

  static recordPolicy(params: {
    type: PolicyType;
    provider: string;
    policyNumber?: string;
    coverAmount: number;
    premiumAmount: number;
    renewalDate?: string;
    status?: 'Active' | 'Lapsed' | 'Pending';
    currency?: string;
    notes?: string;
  }): InsurancePolicy {
    const policy: InsurancePolicy = {
      id: 'pol-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      type: params.type,
      provider: params.provider.trim(),
      policyNumber: params.policyNumber?.trim() || undefined,
      coverAmount: Number(params.coverAmount) || 0,
      premiumAmount: Number(params.premiumAmount) || 0,
      renewalDate: params.renewalDate || undefined,
      status: params.status || 'Active',
      currency: params.currency?.trim() || undefined, // No default INR; preserves Not Specified
      notes: params.notes?.trim() || undefined
    };

    repository.policies.add(policy);
    return policy;
  }

  static deletePolicy(id: string): void {
    repository.policies.remove(id);
  }

  static recordGoal(params: {
    name: string;
    template: GoalTemplateType;
    targetAmount: number;
    targetDate?: string;
    currentSavedAmount?: number;
    monthlyContribution?: number;
    linkedCategory?: string;
    status?: 'In Progress' | 'Achieved' | 'Paused';
    currency?: string;
    notes?: string;
  }): FinancialGoal {
    const goal: FinancialGoal = {
      id: 'goal-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      name: params.name.trim(),
      template: params.template,
      targetAmount: Number(params.targetAmount) || 0,
      targetDate: params.targetDate || undefined,
      currentSavedAmount: Number(params.currentSavedAmount) || 0,
      monthlyContribution: Number(params.monthlyContribution) || 0,
      linkedCategory: params.linkedCategory || undefined,
      status: params.status || 'In Progress',
      currency: params.currency?.trim() || undefined,
      notes: params.notes?.trim() || undefined
    };

    repository.goals.add(goal);
    return goal;
  }

  static deleteGoal(id: string): void {
    repository.goals.remove(id);
  }

  static saveProfile(profile: FinancialProfile): void {
    repository.profile.save({
      ...profile,
      id: 'default-profile',
      updatedAt: new Date().toISOString()
    });
  }

  static async clearLocalDevelopmentData(): Promise<void> {
    await repository.clearLocalData();
  }

  static async loadDemoData(): Promise<void> {
    await repository.loadDemoData();
  }

  static togglePrivacy(): void {
    if (typeof window !== 'undefined' && (window as any).useCanonicalLedger) {
      (window as any).useCanonicalLedger.getState().togglePrivacy();
    }
  }
}

if (typeof window !== 'undefined') {
  (window as any).FinancialCommands = FinancialCommands;
}
