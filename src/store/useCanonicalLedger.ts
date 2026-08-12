import { FinancialCommands } from '../application/commands';
import { create } from 'zustand';
import { APP_AS_OF_DATE, Transaction, Asset, Liability, NetWorthSnapshot } from '../domain/types';
import { formatDisplayDate, DateRangeService } from '../services/DateRangeService';
import { Sha256Service } from '../services/Sha256Service';
import { repository } from '../repositories';

interface LedgerState {
  transactions: Transaction[];
  assets: Asset[];
  liabilities: Liability[];
  snapshots: NetWorthSnapshot[];
  privacyMasked: boolean;
  filterType: 'Expense' | 'Income' | 'Transfer' | 'All';
  dateRange: string;
  searchQuery: string;
  customStart: string;
  customEnd: string;

  // Actions
  setFilterType: (type: 'Expense' | 'Income' | 'Transfer' | 'All') => void;
  setDateRange: (range: string) => void;
  setSearchQuery: (query: string) => void;
  setCustomRange: (start: string, end: string) => void;
  togglePrivacy: () => void;

  syncWithRepository: (state: {
    transactions: Transaction[];
    assets: Asset[];
    liabilities: Liability[];
    snapshots: NetWorthSnapshot[];
  }) => void;

  initialize: () => Promise<void>;
  loadDemoData: () => Promise<void>;
  clearLocalData: () => Promise<void>;

  addIncome: (title: string, amount: number, account: string, category: string, notes?: string) => void;
  addExpense: (title: string, amount: number, account: string, category: string, notes?: string) => void;
  addTransfer: (source: string, destination: string, amount: number) => void;
  addAsset: (name: string, amount: number) => void;
  addLiability: (name: string, amount: number) => void;
  addAssetWithMetadata: (params: { name: string; amount: number; type?: any; tag?: string; currency?: string; geography?: any }) => void;
  addLiabilityWithMetadata: (params: { name: string; amount: number; type?: any; currency?: string }) => void;
  addPastSnapshot: (params: { dateStr: string; totalAssets: number; totalLiabilities: number; label?: string }) => void;
  captureSnapshot: (label?: string) => void;
  commitImportedRows: (validRows?: Transaction[]) => { appended: number; duplicates: number };

  // Queries
  getFilteredTransactions: (params?: {
    type?: 'Expense' | 'Income' | 'Transfer' | 'All';
    dateRange?: string;
    search?: string;
    customStart?: string | null;
    customEnd?: string | null;
  }) => Transaction[];
  getNetWorth: () => number;
}

function generateFingerprint(tx: { account: string; date: string; amount: number; narration: string }): string {
  const canonicalString = `${tx.account}|${tx.date}|${tx.amount}|${tx.narration.toLowerCase().trim()}`;
  return Sha256Service.hash(canonicalString);
}

export const useCanonicalLedger = create<LedgerState>((set, get) => ({
  transactions: [],
  assets: [],
  liabilities: [],
  snapshots: [],
  privacyMasked: typeof window !== 'undefined' ? localStorage.getItem('finapp.privacy.masked') === 'true' : false,
  filterType: 'Expense',
  dateRange: 'This Month',
  searchQuery: '',
  customStart: '2026-07-01',
  customEnd: APP_AS_OF_DATE,

  setFilterType: (type) => set({ filterType: type }),
  setDateRange: (range) => {
    set({ dateRange: range });
    if (range === '12M') {
      set({ filterType: 'Income' });
    }
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCustomRange: (start, end) => set({ customStart: start, customEnd: end, dateRange: 'Custom' }),
  togglePrivacy: () => {
    const next = !get().privacyMasked;
    localStorage.setItem('finapp.privacy.masked', String(next));
    set({ privacyMasked: next });
  },

  syncWithRepository: (state) => {
    set({
      transactions: state.transactions,
      assets: state.assets,
      liabilities: state.liabilities,
      snapshots: state.snapshots
    });
  },

  initialize: async () => {
    await repository.initialize();
  },

  loadDemoData: async () => {
    await repository.loadDemoData();
  },

  clearLocalData: async () => {
    await repository.clearLocalData();
  },

  addIncome: (title, amount, account, category, notes) => {
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
  },

  addExpense: (title, amount, account, category, notes) => {
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
  },

  addTransfer: (source, destination, amount) => {
    const trId = 'tr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
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
  },

  addAsset: (name, amount) => {
    repository.assets.add({ name, amount });
  },

  addLiability: (name, amount) => {
    repository.liabilities.add({ name, amount });
  },

  addAssetWithMetadata: (params) => {
    FinancialCommands.recordAssetWithMetadata(params);
  },

  addLiabilityWithMetadata: (params) => {
    FinancialCommands.recordLiabilityWithMetadata(params);
  },

  addPastSnapshot: (params) => {
    FinancialCommands.addPastSnapshot(params);
  },

  captureSnapshot: (label) => {
    FinancialCommands.createSnapshot(label);
  },

  commitImportedRows: (validRows) => {
    const { transactions } = get();
    let appended = 0;
    let duplicates = 0;

    const existingFingerprints = new Set(
      transactions.map(tx => tx.fingerprint || generateFingerprint({ account: tx.account, date: tx.date, amount: tx.amount, narration: tx.narration }))
    );

    const candidateRows: Transaction[] = [];

    if (validRows && validRows.length > 0) {
      for (const row of validRows) {
        const fp = row.fingerprint || generateFingerprint(row);
        if (existingFingerprints.has(fp)) {
          duplicates++;
          continue;
        }
        existingFingerprints.add(fp);
        candidateRows.push(row);
        appended++;
      }
      if (candidateRows.length > 0) {
        repository.transactions.appendMany(candidateRows);
      }
    }

    return { appended, duplicates };
  },

  getFilteredTransactions: (params) => {
    const state = get();
    const type = params?.type ?? state.filterType;
    const dateRange = params?.dateRange ?? state.dateRange;
    const searchQuery = params?.search ?? state.searchQuery;
    const customStart = params?.customStart ?? state.customStart;
    const customEnd = params?.customEnd ?? state.customEnd;

    const bounds = DateRangeService.getBounds(dateRange, APP_AS_OF_DATE, customStart, customEnd);

    return state.transactions.filter(item => {
      if (type !== 'All' && item.type !== type && item.type.toUpperCase() !== type) return false;
      if (item.date < bounds.startDate || item.date > bounds.endDate) return false;
      if (searchQuery) {
        const content = `${item.title} ${item.narration} ${item.account} ${item.category} ${item.notes || ''}`.toLowerCase();
        if (!content.includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    });
  },

  getNetWorth: () => {
    const { assets, liabilities } = get();
    const totAssets = assets.reduce((sum, a) => sum + a.amount, 0);
    const totLiabs = liabilities.reduce((sum, l) => sum + l.amount, 0);
    return totAssets - totLiabs;
  }
}));

// Initialize storage automatically in browser
if (typeof window !== 'undefined') {
  useCanonicalLedger.getState().initialize();
}
