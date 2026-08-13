import {
  Transaction,
  TransactionQuery,
  TransactionRepository,
  Asset,
  AssetRepository,
  Liability,
  LiabilityRepository,
  NetWorthSnapshot,
  SnapshotRepository,
  Account,
  AccountRepository,
  MonthlyBudget,
  BudgetRepository,
  FinancialRepositoryPort,
  APP_AS_OF_DATE
} from '../domain/types';
import { DateRangeService, formatDisplayDate } from '../services/DateRangeService';
import { Sha256Service } from '../services/Sha256Service';
import { IndexedDBStorageService } from '../services/IndexedDBStorageService';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { demoTransactions, demoAssets, demoLiabilities, demoSnapshots } from '../domain/demoFixtures';

function generateFingerprint(tx: { account: string; date: string; amount: number; narration: string }): string {
  const canonicalString = `${tx.account}|${tx.date}|${tx.amount}|${tx.narration.toLowerCase().trim()}`;
  return Sha256Service.hash(canonicalString);
}

export class MemoryTransactionRepository implements TransactionRepository {
  constructor(private parent: MemoryRepository) {}

  async findMany(query: TransactionQuery): Promise<Transaction[]> {
    return this.findManySync(query);
  }

  findManySync(query: TransactionQuery): Transaction[] {
    const { type, dateRange, search, customStart, customEnd, asOfDateStr = APP_AS_OF_DATE } = query;
    const bounds = DateRangeService.getBounds(dateRange || 'This Month', asOfDateStr, customStart, customEnd);

    return this.parent.transactionsData.filter(item => {
      if (type && type !== 'All' && item.type !== type && item.type.toUpperCase() !== type) return false;
      if (item.date < bounds.startDate || item.date > bounds.endDate) return false;
      if (search) {
        const content = `${item.title} ${item.narration} ${item.account} ${item.category} ${item.notes || ''}`.toLowerCase();
        if (!content.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }

  async findAll(): Promise<Transaction[]> {
    return this.findAllSync();
  }

  findAllSync(): Transaction[] {
    return [...this.parent.transactionsData];
  }

  async append(transaction: Transaction): Promise<void> {
    const fp = transaction.fingerprint || generateFingerprint(transaction);
    const withFp = { ...transaction, fingerprint: fp };
    this.parent.transactionsData = [withFp, ...this.parent.transactionsData];
    this.parent.syncStore();
    await IndexedDBStorageService.saveAll({
      transactions: this.parent.transactionsData,
      assets: this.parent.assetsData,
      liabilities: this.parent.liabilitiesData,
      snapshots: this.parent.snapshotsData,
      accounts: this.parent.accountsData,
      budgets: this.parent.budgetsData
    });
  }

  async appendMany(transactions: Transaction[]): Promise<void> {
    const seen = new Set(this.parent.transactionsData.map(t => t.fingerprint || generateFingerprint(t)));
    const unique: Transaction[] = [];

    for (const t of transactions) {
      const fp = t.fingerprint || generateFingerprint(t);
      if (!seen.has(fp)) {
        seen.add(fp);
        unique.push({ ...t, fingerprint: fp });
      }
    }

    if (unique.length > 0) {
      this.parent.transactionsData = [...unique, ...this.parent.transactionsData];
      this.parent.syncStore();
      await IndexedDBStorageService.saveAll({
        transactions: this.parent.transactionsData,
        assets: this.parent.assetsData,
        liabilities: this.parent.liabilitiesData,
        snapshots: this.parent.snapshotsData,
        accounts: this.parent.accountsData,
        budgets: this.parent.budgetsData
      });
    }
  }
}

export class MemoryAssetRepository implements AssetRepository {
  constructor(private parent: MemoryRepository) {}

  async findAll(): Promise<Asset[]> {
    return this.findAllSync();
  }

  findAllSync(): Asset[] {
    return [...this.parent.assetsData];
  }

  async add(asset: Asset): Promise<void> {
    const existingIndex = this.parent.assetsData.findIndex(a => a.name === asset.name);
    if (existingIndex >= 0) {
      this.parent.assetsData[existingIndex] = { ...asset };
    } else {
      this.parent.assetsData = [...this.parent.assetsData, { ...asset }];
    }
    this.parent.syncStore();
    await IndexedDBStorageService.saveAll({
      transactions: this.parent.transactionsData,
      assets: this.parent.assetsData,
      liabilities: this.parent.liabilitiesData,
      snapshots: this.parent.snapshotsData,
      accounts: this.parent.accountsData,
      budgets: this.parent.budgetsData
    });
  }
}

export class MemoryLiabilityRepository implements LiabilityRepository {
  constructor(private parent: MemoryRepository) {}

  async findAll(): Promise<Liability[]> {
    return this.findAllSync();
  }

  findAllSync(): Liability[] {
    return [...this.parent.liabilitiesData];
  }

  async add(liability: Liability): Promise<void> {
    const existingIndex = this.parent.liabilitiesData.findIndex(l => l.name === liability.name);
    if (existingIndex >= 0) {
      this.parent.liabilitiesData[existingIndex] = { ...liability };
    } else {
      this.parent.liabilitiesData = [...this.parent.liabilitiesData, { ...liability }];
    }
    this.parent.syncStore();
    await IndexedDBStorageService.saveAll({
      transactions: this.parent.transactionsData,
      assets: this.parent.assetsData,
      liabilities: this.parent.liabilitiesData,
      snapshots: this.parent.snapshotsData,
      accounts: this.parent.accountsData,
      budgets: this.parent.budgetsData
    });
  }
}

export class MemorySnapshotRepository implements SnapshotRepository {
  constructor(private parent: MemoryRepository) {}

  async findAll(): Promise<NetWorthSnapshot[]> {
    return this.findAllSync();
  }

  findAllSync(): NetWorthSnapshot[] {
    return [...this.parent.snapshotsData];
  }

  async create(snapshot?: NetWorthSnapshot): Promise<void> {
    if (snapshot) {
      const existingIdx = this.parent.snapshotsData.findIndex(s => s.dateStr === snapshot.dateStr);
      if (existingIdx >= 0) {
        this.parent.snapshotsData[existingIdx] = { ...snapshot };
      } else {
        this.parent.snapshotsData = [snapshot, ...this.parent.snapshotsData];
      }
    } else {
      const totAssets = this.parent.assetsData.reduce((sum, a) => sum + a.amount, 0);
      const totLiabs = this.parent.liabilitiesData.reduce((sum, l) => sum + l.amount, 0);
      const netWorth = totAssets - totLiabs;

      const newSnap: NetWorthSnapshot = {
        id: 'snap-' + Date.now(),
        dateStr: formatDisplayDate(APP_AS_OF_DATE) + ' (Today)',
        totalAssets: totAssets,
        totalLiabilities: totLiabs,
        netWorth,
        status: 'Anchored Permanent'
      };
      this.parent.snapshotsData = [newSnap, ...this.parent.snapshotsData];
    }
    this.parent.syncStore();
    await IndexedDBStorageService.saveAll({
      transactions: this.parent.transactionsData,
      assets: this.parent.assetsData,
      liabilities: this.parent.liabilitiesData,
      snapshots: this.parent.snapshotsData,
      accounts: this.parent.accountsData,
      budgets: this.parent.budgetsData
    });
  }
}

export class MemoryAccountRepository implements AccountRepository {
  constructor(private parent: MemoryRepository) {}

  async findAll(): Promise<Account[]> {
    return this.findAllSync();
  }

  findAllSync(): Account[] {
    return [...this.parent.accountsData];
  }

  async add(account: Account): Promise<void> {
    // Enforce unique account name within Account registry
    const duplicate = this.parent.accountsData.find(
      a => a.name.trim().toLowerCase() === account.name.trim().toLowerCase() && a.id !== account.id
    );
    if (duplicate) {
      throw new Error(`Account name "${account.name}" already exists. Account names must be unique.`);
    }

    const existingIdx = this.parent.accountsData.findIndex(a => a.id === account.id);
    if (existingIdx >= 0) {
      this.parent.accountsData[existingIdx] = { ...account };
    } else {
      this.parent.accountsData = [...this.parent.accountsData, { ...account }];
    }
    this.parent.syncStore();
    await IndexedDBStorageService.saveAll({
      transactions: this.parent.transactionsData,
      assets: this.parent.assetsData,
      liabilities: this.parent.liabilitiesData,
      snapshots: this.parent.snapshotsData,
      accounts: this.parent.accountsData,
      budgets: this.parent.budgetsData
    });
  }

  async remove(id: string): Promise<void> {
    this.parent.accountsData = this.parent.accountsData.filter(a => a.id !== id);
    this.parent.syncStore();
    await IndexedDBStorageService.saveAll({
      transactions: this.parent.transactionsData,
      assets: this.parent.assetsData,
      liabilities: this.parent.liabilitiesData,
      snapshots: this.parent.snapshotsData,
      accounts: this.parent.accountsData,
      budgets: this.parent.budgetsData
    });
  }
}

export class MemoryBudgetRepository implements BudgetRepository {
  constructor(private parent: MemoryRepository) {}

  async findForMonth(monthStr: string): Promise<MonthlyBudget | null> {
    return this.findForMonthSync(monthStr);
  }

  findForMonthSync(monthStr: string): MonthlyBudget | null {
    const found = this.parent.budgetsData.find(b => b.monthStr === monthStr);
    return found ? { ...found } : null;
  }

  async findAll(): Promise<MonthlyBudget[]> {
    return this.findAllSync();
  }

  findAllSync(): MonthlyBudget[] {
    return [...this.parent.budgetsData];
  }

  async save(budget: MonthlyBudget): Promise<void> {
    const existingIdx = this.parent.budgetsData.findIndex(b => b.monthStr === budget.monthStr);
    if (existingIdx >= 0) {
      this.parent.budgetsData[existingIdx] = { ...budget };
    } else {
      this.parent.budgetsData = [...this.parent.budgetsData, { ...budget }];
    }
    this.parent.syncStore();
    await IndexedDBStorageService.saveAll({
      transactions: this.parent.transactionsData,
      assets: this.parent.assetsData,
      liabilities: this.parent.liabilitiesData,
      snapshots: this.parent.snapshotsData,
      accounts: this.parent.accountsData,
      budgets: this.parent.budgetsData
    });
  }
}

export class MemoryRepository implements FinancialRepositoryPort {
  public transactionsData: Transaction[] = [];
  public assetsData: Asset[] = [];
  public liabilitiesData: Liability[] = [];
  public snapshotsData: NetWorthSnapshot[] = [];
  public accountsData: Account[] = [];
  public budgetsData: MonthlyBudget[] = [];

  public transactions: TransactionRepository = new MemoryTransactionRepository(this);
  public assets: AssetRepository = new MemoryAssetRepository(this);
  public liabilities: LiabilityRepository = new MemoryLiabilityRepository(this);
  public snapshots: SnapshotRepository = new MemorySnapshotRepository(this);
  public accounts: AccountRepository = new MemoryAccountRepository(this);
  public budgets: BudgetRepository = new MemoryBudgetRepository(this);

  public syncStore() {
    useCanonicalLedger.getState().syncWithRepository({
      transactions: [...this.transactionsData],
      assets: [...this.assetsData],
      liabilities: [...this.liabilitiesData],
      snapshots: [...this.snapshotsData],
      accounts: [...this.accountsData],
      budgets: [...this.budgetsData]
    });
  }

  async initialize(): Promise<void> {
    const data = await IndexedDBStorageService.loadAll();
    this.transactionsData = data.transactions;
    this.assetsData = data.assets;
    this.liabilitiesData = data.liabilities;
    this.snapshotsData = data.snapshots;
    this.accountsData = data.accounts;
    this.budgetsData = data.budgets;
    this.syncStore();
  }

  async loadDemoData(): Promise<void> {
    this.transactionsData = [...demoTransactions];
    this.assetsData = [...demoAssets];
    this.liabilitiesData = [...demoLiabilities];
    this.snapshotsData = [...demoSnapshots];
    this.accountsData = [];
    this.budgetsData = [];
    this.syncStore();
    await IndexedDBStorageService.saveAll({
      transactions: this.transactionsData,
      assets: this.assetsData,
      liabilities: this.liabilitiesData,
      snapshots: this.snapshotsData,
      accounts: this.accountsData,
      budgets: this.budgetsData
    });
  }

  async clearLocalData(): Promise<void> {
    this.transactionsData = [];
    this.assetsData = [];
    this.liabilitiesData = [];
    this.snapshotsData = [];
    this.accountsData = [];
    this.budgetsData = [];
    this.syncStore();
    await IndexedDBStorageService.clearAll();
  }
}
