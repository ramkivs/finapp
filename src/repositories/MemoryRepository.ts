import {
  Transaction, Asset, Liability, NetWorthSnapshot,
  TransactionQuery, TransactionRepository, AssetRepository,
  LiabilityRepository, SnapshotRepository, FinancialRepositoryPort,
  APP_AS_OF_DATE
} from '../domain/types';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { IndexedDBStorageService } from '../services/IndexedDBStorageService';
import { demoTransactions, demoAssets, demoLiabilities, demoSnapshots } from '../domain/demoFixtures';
import { DateRangeService, formatDisplayDate } from '../services/DateRangeService';

export class MemoryTransactionRepository implements TransactionRepository {
  constructor(private root: MemoryRepository) {}

  async findMany(query: TransactionQuery): Promise<Transaction[]> {
    return this.findManySync(query);
  }

  findManySync(query: TransactionQuery): Transaction[] {
    const type = query?.type ?? 'All';
    const dateRange = query?.dateRange ?? '12M';
    const searchQuery = query?.search ?? '';
    const customStart = query?.customStart ?? '2026-07-01';
    const customEnd = query?.customEnd ?? APP_AS_OF_DATE;

    const bounds = DateRangeService.getBounds(dateRange, APP_AS_OF_DATE, customStart, customEnd);

    return this.root.transactionsData.filter(item => {
      if (type !== 'All' && item.type !== type && item.type.toUpperCase() !== type) return false;
      if (item.date < bounds.startDate || item.date > bounds.endDate) return false;
      if (searchQuery) {
        const content = `${item.title} ${item.narration} ${item.account} ${item.category} ${item.notes || ''}`.toLowerCase();
        if (!content.includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    });
  }

  async findAll(): Promise<Transaction[]> {
    return this.findAllSync();
  }

  findAllSync(): Transaction[] {
    return [...this.root.transactionsData];
  }

  async append(transaction: Transaction): Promise<void> {
    const prevTxs = this.root.transactionsData;
    const nextTxs = [transaction, ...prevTxs];
    this.root.transactionsData = nextTxs;
    this.root.syncStore();
    try {
      await IndexedDBStorageService.saveAll({
        transactions: nextTxs,
        assets: this.root.assetsData,
        liabilities: this.root.liabilitiesData,
        snapshots: this.root.snapshotsData
      });
    } catch (err) {
      this.root.transactionsData = prevTxs;
      this.root.syncStore();
      throw err;
    }
  }

  async appendMany(transactions: Transaction[]): Promise<void> {
    const prevTxs = this.root.transactionsData;
    const nextTxs = [...transactions, ...prevTxs];
    this.root.transactionsData = nextTxs;
    this.root.syncStore();
    try {
      await IndexedDBStorageService.saveAll({
        transactions: nextTxs,
        assets: this.root.assetsData,
        liabilities: this.root.liabilitiesData,
        snapshots: this.root.snapshotsData
      });
    } catch (err) {
      this.root.transactionsData = prevTxs;
      this.root.syncStore();
      throw err;
    }
  }
}

export class MemoryAssetRepository implements AssetRepository {
  constructor(private root: MemoryRepository) {}

  async findAll(): Promise<Asset[]> {
    return this.findAllSync();
  }

  findAllSync(): Asset[] {
    return [...this.root.assetsData];
  }

  async add(asset: Asset): Promise<void> {
    const prevAssets = this.root.assetsData;
    const nextAssets = [...prevAssets, asset];
    this.root.assetsData = nextAssets;
    this.root.syncStore();
    try {
      await IndexedDBStorageService.saveAll({
        transactions: this.root.transactionsData,
        assets: nextAssets,
        liabilities: this.root.liabilitiesData,
        snapshots: this.root.snapshotsData
      });
    } catch (err) {
      this.root.assetsData = prevAssets;
      this.root.syncStore();
      throw err;
    }
  }
}

export class MemoryLiabilityRepository implements LiabilityRepository {
  constructor(private root: MemoryRepository) {}

  async findAll(): Promise<Liability[]> {
    return this.findAllSync();
  }

  findAllSync(): Liability[] {
    return [...this.root.liabilitiesData];
  }

  async add(liability: Liability): Promise<void> {
    const prevLiabs = this.root.liabilitiesData;
    const nextLiabs = [...prevLiabs, liability];
    this.root.liabilitiesData = nextLiabs;
    this.root.syncStore();
    try {
      await IndexedDBStorageService.saveAll({
        transactions: this.root.transactionsData,
        assets: this.root.assetsData,
        liabilities: nextLiabs,
        snapshots: this.root.snapshotsData
      });
    } catch (err) {
      this.root.liabilitiesData = prevLiabs;
      this.root.syncStore();
      throw err;
    }
  }
}

export class MemorySnapshotRepository implements SnapshotRepository {
  constructor(private root: MemoryRepository) {}

  async findAll(): Promise<NetWorthSnapshot[]> {
    return this.findAllSync();
  }

  findAllSync(): NetWorthSnapshot[] {
    return [...this.root.snapshotsData];
  }

  async create(snapshot?: NetWorthSnapshot): Promise<void> {
    let snapToAdd = snapshot;
    if (!snapToAdd) {
      const totalAssets = this.root.assetsData.reduce((sum, a) => sum + a.amount, 0);
      const totalLiabilities = this.root.liabilitiesData.reduce((sum, l) => sum + l.amount, 0);
      const netWorth = totalAssets - totalLiabilities;
      snapToAdd = {
        id: 'snap-' + Date.now(),
        dateStr: formatDisplayDate(APP_AS_OF_DATE) + ' (Today)',
        totalAssets,
        totalLiabilities,
        netWorth,
        status: 'Anchored Permanent'
      };
    }
    const prevSnaps = this.root.snapshotsData;
    const nextSnaps = [snapToAdd, ...prevSnaps];
    this.root.snapshotsData = nextSnaps;
    this.root.syncStore();
    try {
      await IndexedDBStorageService.saveAll({
        transactions: this.root.transactionsData,
        assets: this.root.assetsData,
        liabilities: this.root.liabilitiesData,
        snapshots: nextSnaps
      });
    } catch (err) {
      this.root.snapshotsData = prevSnaps;
      this.root.syncStore();
      throw err;
    }
  }
}

export class MemoryRepository implements FinancialRepositoryPort {
  public transactionsData: Transaction[] = [];
  public assetsData: Asset[] = [];
  public liabilitiesData: Liability[] = [];
  public snapshotsData: NetWorthSnapshot[] = [];

  public transactions = new MemoryTransactionRepository(this);
  public assets = new MemoryAssetRepository(this);
  public liabilities = new MemoryLiabilityRepository(this);
  public snapshots = new MemorySnapshotRepository(this);

  syncStore() {
    useCanonicalLedger.getState().syncWithRepository({
      transactions: this.transactionsData,
      assets: this.assetsData,
      liabilities: this.liabilitiesData,
      snapshots: this.snapshotsData
    });
  }

  async clearLocalData(): Promise<void> {
    await IndexedDBStorageService.clearAll();
    this.transactionsData = [];
    this.assetsData = [];
    this.liabilitiesData = [];
    this.snapshotsData = [];
    this.syncStore();
  }

  async loadDemoData(): Promise<void> {
    await IndexedDBStorageService.saveAll({
      transactions: demoTransactions,
      assets: demoAssets,
      liabilities: demoLiabilities,
      snapshots: demoSnapshots
    });
    this.transactionsData = [...demoTransactions];
    this.assetsData = [...demoAssets];
    this.liabilitiesData = [...demoLiabilities];
    this.snapshotsData = [...demoSnapshots];
    this.syncStore();
  }

  async initialize(): Promise<void> {
    try {
      const stored = await IndexedDBStorageService.loadAll();
      if (stored.hasLoadedOnce) {
        this.transactionsData = stored.transactions || [];
        this.assetsData = stored.assets || [];
        this.liabilitiesData = stored.liabilities || [];
        this.snapshotsData = stored.snapshots || [];
      } else {
        this.transactionsData = [];
        this.assetsData = [];
        this.liabilitiesData = [];
        this.snapshotsData = [];
      }
    } catch {
      this.transactionsData = [];
      this.assetsData = [];
      this.liabilitiesData = [];
      this.snapshotsData = [];
    }
    this.syncStore();
  }
}
