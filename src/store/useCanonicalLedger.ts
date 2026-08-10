import { create } from 'zustand';
import { APP_AS_OF_DATE, Transaction, Asset, Liability, NetWorthSnapshot } from '../domain/types';
import { formatDisplayDate, DateRangeService } from '../services/DateRangeService';
import { IndexedDBStorageService } from '../services/IndexedDBStorageService';
import { Sha256Service } from '../services/Sha256Service';
import { demoTransactions, demoAssets, demoLiabilities, demoSnapshots } from '../domain/demoFixtures';

interface LedgerState {
  transactions: Transaction[];
  assets: Asset[];
  liabilities: Liability[];
  snapshots: NetWorthSnapshot[];
  privacyMasked: boolean;
  filterType: 'Expense' | 'Income' | 'Transfer' | 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'All';
  dateRange: string;
  searchQuery: string;
  customStart: string;
  customEnd: string;

  // Actions
  setFilterType: (type: 'Expense' | 'Income' | 'Transfer' | 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'All') => void;
  setDateRange: (range: string) => void;
  setSearchQuery: (query: string) => void;
  setCustomRange: (start: string, end: string) => void;
  togglePrivacy: () => void;

  initialize: () => Promise<void>;
  loadDemoData: () => Promise<void>;
  clearLocalData: () => Promise<void>;

  addIncome: (title: string, amount: number, account: string, category: string, notes?: string) => void;
  addExpense: (title: string, amount: number, account: string, category: string, notes?: string) => void;
  addTransfer: (source: string, destination: string, amount: number) => void;
  addAsset: (name: string, amount: number) => void;
  addLiability: (name: string, amount: number) => void;
  captureSnapshot: () => void;
  commitImportedRows: (validRows?: Transaction[]) => { appended: number; duplicates: number };

  // Queries
  getFilteredTransactions: (params?: {
    type?: 'Expense' | 'Income' | 'Transfer' | 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'All';
    dateRange?: string;
    search?: string;
    customStart?: string | null;
    customEnd?: string | null;
  }) => Transaction[];
  getNetWorth: () => number;
}

function generateFingerprint(tx: { account: string; date: string; amount: number; narration: string }): string {
  return Sha256Service.hash(`${tx.account}|${tx.date}|${tx.amount}|${tx.narration.toLowerCase().trim()}`);
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

  initialize: async () => {
    try {
      const stored = await IndexedDBStorageService.loadAll();
      if (stored.hasLoadedOnce) {
        set({
          transactions: stored.transactions || [],
          assets: stored.assets || [],
          liabilities: stored.liabilities || [],
          snapshots: stored.snapshots || []
        });
      } else {
        set({
          transactions: [],
          assets: [],
          liabilities: [],
          snapshots: []
        });
      }
    } catch {
      // Keep empty default state
    }
  },

  loadDemoData: async () => {
    set({
      transactions: demoTransactions,
      assets: demoAssets,
      liabilities: demoLiabilities,
      snapshots: demoSnapshots
    });
    const state = get();
    await IndexedDBStorageService.saveAll({
      transactions: state.transactions,
      assets: state.assets,
      liabilities: state.liabilities,
      snapshots: state.snapshots
    });
  },

  clearLocalData: async () => {
    set({
      transactions: [],
      assets: [],
      liabilities: [],
      snapshots: []
    });
    await IndexedDBStorageService.clearAll();
  },

  addIncome: (title, amount, account, category, notes) => {
    const newTx: Transaction = {
      id: 'tx-new-' + Date.now(),
      date: APP_AS_OF_DATE,
      dateStr: formatDisplayDate(APP_AS_OF_DATE),
      title,
      narration: 'MANUAL-MODAL/' + title.toUpperCase(),
      account,
      type: 'Income',
      category,
      amount,
      status: 'CLEARED',
      notes
    };
    set(state => ({ transactions: [newTx, ...state.transactions] }));
    const state = get();
    IndexedDBStorageService.saveAll({
      transactions: state.transactions,
      assets: state.assets,
      liabilities: state.liabilities,
      snapshots: state.snapshots
    });
  },

  addExpense: (title, amount, account, category, notes) => {
    const newTx: Transaction = {
      id: 'tx-exp-' + Date.now(),
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
    };
    set(state => ({ transactions: [newTx, ...state.transactions] }));
    const state = get();
    IndexedDBStorageService.saveAll({
      transactions: state.transactions,
      assets: state.assets,
      liabilities: state.liabilities,
      snapshots: state.snapshots
    });
  },

  addTransfer: (source, destination, amount) => {
    const trId = 'tr-' + Date.now();
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
    set(state => ({ transactions: [debitTx, creditTx, ...state.transactions] }));
    const state = get();
    IndexedDBStorageService.saveAll({
      transactions: state.transactions,
      assets: state.assets,
      liabilities: state.liabilities,
      snapshots: state.snapshots
    });
  },

  addAsset: (name, amount) => {
    set(state => ({ assets: [...state.assets, { name, amount }] }));
    const state = get();
    IndexedDBStorageService.saveAll({
      transactions: state.transactions,
      assets: state.assets,
      liabilities: state.liabilities,
      snapshots: state.snapshots
    });
  },

  addLiability: (name, amount) => {
    set(state => ({ liabilities: [...state.liabilities, { name, amount }] }));
    const state = get();
    IndexedDBStorageService.saveAll({
      transactions: state.transactions,
      assets: state.assets,
      liabilities: state.liabilities,
      snapshots: state.snapshots
    });
  },

  captureSnapshot: () => {
    const { assets, liabilities, snapshots } = get();
    const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
    const netWorth = totalAssets - totalLiabilities;
    const newSnap: NetWorthSnapshot = {
      id: 'snap-' + Date.now(),
      dateStr: formatDisplayDate(APP_AS_OF_DATE) + ' (Today)',
      totalAssets,
      totalLiabilities,
      netWorth,
      status: 'Anchored Permanent'
    };
    set({ snapshots: [newSnap, ...snapshots] });
    const state = get();
    IndexedDBStorageService.saveAll({
      transactions: state.transactions,
      assets: state.assets,
      liabilities: state.liabilities,
      snapshots: state.snapshots
    });
  },

  commitImportedRows: (validRows) => {
    const { transactions } = get();
    let appended = 0;
    let duplicates = 0;

    const existingFingerprints = new Set(
      transactions.map(tx => generateFingerprint({ account: tx.account, date: tx.date, amount: tx.amount, narration: tx.narration }))
    );

    const candidateRows: Transaction[] = [];

    if (validRows !== undefined) {
      for (const row of validRows) {
        const fp = generateFingerprint(row);
        if (existingFingerprints.has(fp)) {
          duplicates++;
          continue;
        }
        existingFingerprints.add(fp);
        candidateRows.push(row);
        appended++;
      }
    } else {
      // Fallback 24-row demo import generator if called without validRows
      const importBatchId = 'batch-' + Date.now();
      for (let i = 1; i <= 24; i++) {
        let candidate: Transaction;
        if (i === 23) {
          candidate = {
            id: 'tx-import-' + importBatchId + '-' + i,
            date: '2026-08-06',
            dateStr: '06 Aug 2026',
            title: 'ITC Limited',
            narration: 'ACH/C-/ITC LTD DIVIDEND/NSE0098',
            account: 'HDFC Bank',
            type: 'Income',
            category: 'DIVIDEND',
            amount: 2100,
            status: 'CLEARED',
            notes: 'Import duplicate test 1',
            importBatchId,
            sourceProvider: 'HDFC Bank',
            sourceFile: 'HDFC_Statement_Aug2026.csv',
            sourceRowNumber: i
          };
        } else if (i === 24) {
          candidate = {
            id: 'tx-import-' + importBatchId + '-' + i,
            date: '2026-08-04',
            dateStr: '04 Aug 2026',
            title: 'Coal India Ltd',
            narration: 'ECS/C/COAL INDIA INT DIVIDEND',
            account: 'SBI Bank',
            type: 'Income',
            category: 'DIVIDEND',
            amount: 1500,
            status: 'CLEARED',
            notes: 'Import duplicate test 2',
            importBatchId,
            sourceProvider: 'HDFC Bank',
            sourceFile: 'HDFC_Statement_Aug2026.csv',
            sourceRowNumber: i
          };
        } else {
          candidate = {
            id: 'tx-import-' + importBatchId + '-' + i,
            date: '2026-08-01',
            dateStr: '01 Aug 2026',
            title: 'Imported Payout ' + i,
            narration: 'ACH/C/DIVIDEND-CREDIT-ROW-' + i,
            account: 'HDFC Bank (...4921)',
            type: 'Income',
            category: 'DIVIDEND',
            amount: 1000,
            status: 'CLEARED',
            notes: 'Imported via 5-Stage Parser',
            importBatchId,
            sourceProvider: 'HDFC Bank',
            sourceFile: 'HDFC_Statement_Aug2026.csv',
            sourceRowNumber: i
          };
        }

        const fp = generateFingerprint(candidate);
        if (existingFingerprints.has(fp)) {
          duplicates++;
          continue;
        }
        existingFingerprints.add(fp);
        candidateRows.push(candidate);
        appended++;
      }
    }

    set(state => ({ transactions: [...candidateRows, ...state.transactions] }));
    const state = get();
    IndexedDBStorageService.saveAll({
      transactions: state.transactions,
      assets: state.assets,
      liabilities: state.liabilities,
      snapshots: state.snapshots
    });
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
      if (type !== 'All' && item.type !== type) return false;
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
