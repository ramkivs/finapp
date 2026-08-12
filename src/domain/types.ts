export type TransactionType = 'Income' | 'Expense' | 'Transfer' | 'INCOME' | 'EXPENSE' | 'TRANSFER';

export type AccountType = 'SAVINGS' | 'CURRENT' | 'CREDIT_CARD' | 'CASH' | 'WALLET' | 'BROKERAGE' | 'OTHER';

export type FilterType = 'All' | TransactionType;

export type DateRangeFilter =
  | 'This Month'
  | 'Last Month'
  | 'Last 30 Days'
  | '3M'
  | '6M'
  | '12M'
  | 'YTD'
  | 'Custom'
  | 'ALL';

export type TransactionStatus = 'CLEARED' | 'PENDING' | 'RECONCILED' | 'ESTIMATED';

export interface Transaction {
  id: string;
  dateStr: string;
  date: string;
  title: string;
  narration: string;
  account: string;
  type: TransactionType;
  category: string;
  amount: number;
  status: TransactionStatus;
  notes?: string;
  transferId?: string;
  importBatchId?: string;
  sourceProvider?: string;
  sourceFile?: string;
  sourceRowNumber?: number;
  fingerprint?: string;
}

/** Controlled WP-17 asset category vocabulary (no | string escape hatch) */
export type AssetType =
  | 'Equity'
  | 'Debt'
  | 'Real Estate'
  | 'Commodities'
  | 'Cash & Savings'
  | 'Crypto'
  | 'Alternatives'
  | 'Other';

/** Controlled WP-17 liability loan vocabulary (no | string escape hatch) */
export type LiabilityType =
  | 'Home Loan'
  | 'Vehicle Loan'
  | 'Personal Loan'
  | 'Education Loan'
  | 'Credit Card'
  | 'Gold Loan'
  | 'Business Loan'
  | 'Friends / Family'
  | 'Other';

/** Controlled WP-17 geography exposure vocabulary */
export type GeographyType = 'India' | 'International' | 'Other';

export interface Asset {
  name: string;
  amount: number;
  type?: AssetType;
  tag?: string;
  currency?: string;      // Descriptive metadata only; no FX conversion
  geography?: GeographyType; // Explicit geography; not inferred from currency
}

export interface Liability {
  name: string;
  amount: number;
  type?: LiabilityType;
  currency?: string;      // Descriptive metadata only; no FX conversion
}

export interface NetWorthSnapshot {
  id: string;
  dateStr: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  status: 'Active Preview' | 'Anchored Permanent' | 'Anchored';
  label?: string;         // Optional descriptive label for historical entries
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
  status: 'RECONCILED' | 'ESTIMATED' | 'NOT_CONFIGURED';
  displayLabel?: string;
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

export type FinancialMetricName =
  | 'NET_WORTH'
  | 'NET_WORTH_CAGR'
  | 'TTM_REALIZED_DIVIDEND'
  | 'MONTHLY_AVERAGE_DIVIDEND'
  | 'DIVIDEND_YIELD_TTM'
  | 'MTD_REALIZED_DIVIDEND'
  | 'EMERGENCY_FUND_COVERAGE'
  | 'ACTIVE_INSURANCE_POLICY_TOTAL'
  | 'SIP_COMMITMENT_MONTHLY'
  | 'EMERGENCY_FUND_GOAL';

export type FinancialSeriesName = 'MONTHLY_DIVIDEND_HISTOGRAM';

export const APP_AS_OF_DATE = '2026-08-09';

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
