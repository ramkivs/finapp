import { create } from 'zustand';
import { APP_AS_OF_DATE, Transaction, Asset, Liability, NetWorthSnapshot, TransactionType } from '../domain/types';
import { formatDisplayDate, DateRangeService } from '../services/DateRangeService';

interface LedgerState {
  transactions: Transaction[];
  assets: Asset[];
  liabilities: Liability[];
  snapshots: NetWorthSnapshot[];
  privacyMasked: boolean;
  filterType: TransactionType | 'All';
  dateRange: string;
  searchQuery: string;
  customStart: string;
  customEnd: string;

  // Actions
  setFilterType: (type: TransactionType | 'All') => void;
  setDateRange: (range: string) => void;
  setSearchQuery: (query: string) => void;
  setCustomRange: (start: string, end: string) => void;
  togglePrivacy: () => void;

  addIncome: (title: string, amount: number, account: string, category: string, notes?: string) => void;
  addExpense: (title: string, amount: number, account: string, category: string, notes?: string) => void;
  addTransfer: (source: string, destination: string, amount: number) => void;
  addAsset: (name: string, amount: number) => void;
  addLiability: (name: string, amount: number) => void;
  captureSnapshot: () => void;
  appendTransactionsDirect: (txs: Transaction[]) => void;
  clearLocalData: () => void;

  // Queries
  getFilteredTransactions: (params?: {
    type?: TransactionType | 'All';
    dateRange?: string;
    search?: string;
    customStart?: string | null;
    customEnd?: string | null;
  }) => Transaction[];
  getNetWorth: () => number;
}

const initialTransactions: Transaction[] = [
  { id: 'tx-1', date: '2026-08-06', dateStr: '06 Aug 2026', title: 'ITC Limited', narration: 'ACH/C-/ITC LTD DIVIDEND/NSE0098', account: 'HDFC Bank', type: 'INCOME', category: 'DIVIDEND', amount: 2100, status: 'CLEARED', notes: 'Final dividend 2026' },
  { id: 'tx-2', date: '2026-08-04', dateStr: '04 Aug 2026', title: 'Coal India Ltd', narration: 'ECS/C/COAL INDIA INT DIVIDEND', account: 'SBI Bank', type: 'INCOME', category: 'DIVIDEND', amount: 1500, status: 'CLEARED', notes: 'PSU quarterly payout' },
  { id: 'tx-3', date: '2026-08-02', dateStr: '02 Aug 2026', title: 'TCS Limited', narration: 'NEFT-DIV/TCS Q1 INTERIM DIVIDEND', account: 'ICICI Bank', type: 'INCOME', category: 'DIVIDEND', amount: 600, status: 'CLEARED', notes: 'Q1 interim dividend' },
  { id: 'tx-4', date: '2026-07-28', dateStr: '28 Jul 2026', title: 'HDFC Bank Ltd', narration: 'ACH/C/HDFC BANK ANNUAL DIVIDEND', account: 'HDFC Bank', type: 'INCOME', category: 'DIVIDEND', amount: 9400, status: 'CLEARED', notes: 'Annual dividend' },
  { id: 'tx-5', date: '2026-07-25', dateStr: '25 Jul 2026', title: 'Swiggy Food Delivery', narration: 'UPI/SWIGGY/DINING OUT', account: 'HDFC Bank', type: 'EXPENSE', category: 'DINING', amount: 1450, status: 'CLEARED', notes: 'Weekend dinner' },
  { id: 'tx-6', date: '2026-07-19', dateStr: '19 Jul 2026', title: 'ONGC Ltd', narration: 'ECS/C/ONGC FINAL DIVIDEND', account: 'Axis Bank', type: 'INCOME', category: 'DIVIDEND', amount: 9000, status: 'CLEARED', notes: 'Final dividend' },
  { id: 'tx-7', date: '2026-06-26', dateStr: '26 Jun 2026', title: 'ITC Limited', narration: 'ACH/C/ITC LTD FINAL DIVIDEND', account: 'HDFC Bank', type: 'INCOME', category: 'DIVIDEND', amount: 24100, status: 'CLEARED', notes: 'Annual AGM payout' },
  { id: 'tx-8', date: '2026-05-15', dateStr: '15 May 2026', title: 'Infosys Ltd', narration: 'NEFT/INFOSYS DIVIDEND', account: 'HDFC Bank', type: 'INCOME', category: 'DIVIDEND', amount: 9800, status: 'CLEARED', notes: 'IT sector yield' },
  { id: 'tx-9', date: '2026-04-10', dateStr: '10 Apr 2026', title: 'NTPC Ltd', narration: 'ACH/NTPC INTERIM DIVIDEND', account: 'SBI Bank', type: 'INCOME', category: 'DIVIDEND', amount: 6500, status: 'CLEARED', notes: 'Power utility dividend' },
  { id: 'tx-10', date: '2026-03-20', dateStr: '20 Mar 2026', title: 'ITC Limited', narration: 'ACH/ITC INTERIM DIVIDEND', account: 'HDFC Bank', type: 'INCOME', category: 'DIVIDEND', amount: 14200, status: 'CLEARED', notes: 'Interim payout' },
  { id: 'tx-11', date: '2026-02-14', dateStr: '14 Feb 2026', title: 'Coal India Ltd', narration: 'ECS/COALINDIA INT DIVIDEND', account: 'SBI Bank', type: 'INCOME', category: 'DIVIDEND', amount: 16800, status: 'CLEARED', notes: 'Q3 interim payout' },
  { id: 'tx-12', date: '2026-01-18', dateStr: '18 Jan 2026', title: 'TCS Limited', narration: 'NEFT/TCS INT DIVIDEND', account: 'ICICI Bank', type: 'INCOME', category: 'DIVIDEND', amount: 11500, status: 'CLEARED', notes: 'Q3 dividend' },
  { id: 'tx-13', date: '2025-12-22', dateStr: '22 Dec 2025', title: 'ONGC Ltd', narration: 'ECS/ONGC DIVIDEND CREDIT', account: 'Axis Bank', type: 'INCOME', category: 'DIVIDEND', amount: 13100, status: 'CLEARED', notes: 'Oil sector dividend' },
  { id: 'tx-14', date: '2025-11-10', dateStr: '10 Nov 2025', title: 'HDFC Bank Ltd', narration: 'ACH/HDFC BANK DIVIDEND', account: 'HDFC Bank', type: 'INCOME', category: 'DIVIDEND', amount: 9200, status: 'CLEARED', notes: 'Interim bank dividend' },
  { id: 'tx-15', date: '2025-10-15', dateStr: '15 Oct 2025', title: 'Infosys Ltd', narration: 'ACH/INFOSYS INT DIVIDEND', account: 'HDFC Bank', type: 'INCOME', category: 'DIVIDEND', amount: 12000, status: 'CLEARED', notes: 'Q2 interim dividend' },
  { id: 'tx-16', date: '2025-09-12', dateStr: '12 Sep 2025', title: 'NTPC Ltd', narration: 'ACH/NTPC FINAL DIVIDEND', account: 'SBI Bank', type: 'INCOME', category: 'DIVIDEND', amount: 8500, status: 'CLEARED', notes: 'Final utility dividend' }
];

export const useCanonicalLedger = create<LedgerState>((set, get) => ({
  transactions: initialTransactions,
  assets: [
    { name: '4 Bank Accounts (HDFC, ICICI, SBI, Axis)', amount: 482910 },
    { name: '3 Brokerages (Zerodha, Groww, Upstox)', amount: 3640000 },
    { name: 'Real Estate Property', amount: 4982500 }
  ],
  liabilities: [
    { name: 'Home Loan (ICICI Bank)', amount: 1850000 }
  ],
  snapshots: [
    {
      id: 'snap-live-0',
      dateStr: formatDisplayDate(APP_AS_OF_DATE) + ' (Today)',
      totalAssets: 482910 + 3640000 + 4982500,
      totalLiabilities: 1850000,
      netWorth: (482910 + 3640000 + 4982500) - 1850000,
      status: 'Active Preview'
    },
    { id: 'snap-1', dateStr: '01 Jul 2026', totalAssets: 9060000, totalLiabilities: 1880000, netWorth: 7180000, status: 'Anchored' },
    { id: 'snap-2', dateStr: '01 Jun 2026', totalAssets: 8950000, totalLiabilities: 1910000, netWorth: 7040000, status: 'Anchored' }
  ],
  privacyMasked: typeof window !== 'undefined' ? localStorage.getItem('finapp.privacy.masked') === 'true' : false,
  filterType: 'EXPENSE',
  dateRange: 'This Month',
  searchQuery: '',
  customStart: '2026-07-01',
  customEnd: APP_AS_OF_DATE,

  setFilterType: (type) => set({ filterType: type }),
  setDateRange: (range) => {
    set({ dateRange: range });
    if (range === '12M') {
      set({ filterType: 'INCOME' });
    }
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCustomRange: (start, end) => set({ customStart: start, customEnd: end, dateRange: 'Custom' }),
  togglePrivacy: () => {
    const next = !get().privacyMasked;
    localStorage.setItem('finapp.privacy.masked', String(next));
    set({ privacyMasked: next });
  },

  addIncome: (title, amount, account, category, notes) => {
    const newTx: Transaction = {
      id: 'tx-new-' + Date.now(),
      date: APP_AS_OF_DATE,
      dateStr: formatDisplayDate(APP_AS_OF_DATE),
      title,
      narration: 'MANUAL-MODAL/' + title.toUpperCase(),
      account,
      type: 'INCOME',
      category,
      amount,
      status: 'CLEARED',
      notes
    };
    set(state => ({ transactions: [newTx, ...state.transactions] }));
  },

  addExpense: (title, amount, account, category, notes) => {
    const newTx: Transaction = {
      id: 'tx-exp-' + Date.now(),
      date: APP_AS_OF_DATE,
      dateStr: formatDisplayDate(APP_AS_OF_DATE),
      title,
      narration: 'MANUAL/' + title.toUpperCase(),
      account,
      type: 'EXPENSE',
      category,
      amount,
      status: 'CLEARED',
      notes: notes || 'Manual expense entry'
    };
    set(state => ({ transactions: [newTx, ...state.transactions] }));
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
      type: 'TRANSFER',
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
      type: 'TRANSFER',
      category: 'TRANSFER',
      amount,
      status: 'CLEARED',
      notes: 'Bank-to-Bank Transfer (Credit)'
    };
    set(state => ({ transactions: [debitTx, creditTx, ...state.transactions] }));
  },

  addAsset: (name, amount) => {
    set(state => ({ assets: [...state.assets, { name, amount }] }));
  },

  addLiability: (name, amount) => {
    set(state => ({ liabilities: [...state.liabilities, { name, amount }] }));
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
  },

  appendTransactionsDirect: (txs) => {
    set(state => ({ transactions: [...txs, ...state.transactions] }));
  },

  clearLocalData: () => {
    set({
      transactions: [],
      assets: [],
      liabilities: [],
      snapshots: []
    });
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
