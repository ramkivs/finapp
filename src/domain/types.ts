export const APP_AS_OF_DATE = '2026-08-09';

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'DIVIDEND' | 'INTEREST' | 'REFUND' | 'FEE' | 'ADJUSTMENT';
export type DirectionType = 'CREDIT' | 'DEBIT';

export type FinancialMetricName =
  | 'TOTAL_ASSETS'
  | 'TOTAL_LIABILITIES'
  | 'NET_WORTH'
  | 'TTM_REALIZED_DIVIDEND'
  | 'MONTHLY_AVERAGE_DIVIDEND'
  | 'MTD_REALIZED_DIVIDEND';

export type FinancialSeriesName =
  | 'MONTHLY_DIVIDEND_HISTOGRAM';

export interface Transaction {
  id: string;
  date: string;       // ISO YYYY-MM-DD
  dateStr: string;    // Formatted display e.g. "06 Aug 2026"
  title: string;
  narration: string;
  account: string;
  type: 'Income' | 'Expense' | 'Transfer';
  category: string;
  amount: number;
  status: 'CLEARED' | 'PENDING';
  notes?: string;
  transferId?: string;
  importBatchId?: string;
  sourceProvider?: string;
  sourceFile?: string;
  sourceRowNumber?: number;
  fingerprint?: string;
}

export interface Asset {
  name: string;
  amount: number;
}

export interface Liability {
  name: string;
  amount: number;
}

export interface NetWorthSnapshot {
  id: string;
  dateStr: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  status: 'Active Preview' | 'Anchored Permanent' | 'Anchored';
}

export interface MonthBucket {
  yyyyMm: string;
  label: string;
  isMtd: boolean;
}

export interface FinancialMetric {
  metric: FinancialMetricName | string;
  value: number;
  currency: string;
  asOf: string;
  source: string;
  filters: Record<string, any>;
  formula: string;
  status: 'RECONCILED' | 'ESTIMATED';
}

export interface FinancialSeries {
  series: FinancialSeriesName | string;
  asOf: string;
  points: Array<{
    month: string;
    amount: number;
    payoutCount: number;
    isMtd: boolean;
  }>;
  source: string;
  filters: Record<string, any>;
  status: 'RECONCILED' | 'ESTIMATED';
}

export interface DateBounds {
  startDate: string;
  endDate: string;
}

// Gate 8: Hexagonal Repository Port Interfaces
export interface TransactionQuery {
  type?: 'Expense' | 'Income' | 'Transfer' | 'All';
  dateRange?: string;
  search?: string;
  customStart?: string | null;
  customEnd?: string | null;
  asOfDateStr?: string;
}

export interface TransactionRepository {
  findMany(query: TransactionQuery): Promise<Transaction[]>;
  findManySync(query: TransactionQuery): Transaction[];
  findAll(): Promise<Transaction[]>;
  findAllSync(): Transaction[];
  append(transaction: Transaction): Promise<void>;
  appendMany(transactions: Transaction[]): Promise<void>;
}

export interface AssetRepository {
  findAll(): Promise<Asset[]>;
  findAllSync(): Asset[];
  add(asset: Asset): Promise<void>;
}

export interface LiabilityRepository {
  findAll(): Promise<Liability[]>;
  findAllSync(): Liability[];
  add(liability: Liability): Promise<void>;
}

export interface SnapshotRepository {
  findAll(): Promise<NetWorthSnapshot[]>;
  findAllSync(): NetWorthSnapshot[];
  create(snapshot?: NetWorthSnapshot): Promise<void>;
}

export interface FinancialRepositoryPort {
  transactions: TransactionRepository;
  assets: AssetRepository;
  liabilities: LiabilityRepository;
  snapshots: SnapshotRepository;
  clearLocalData(): Promise<void> | void;
  loadDemoData(): Promise<void> | void;
  initialize(): Promise<void> | void;
}
