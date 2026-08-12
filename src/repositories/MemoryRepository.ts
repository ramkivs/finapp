import {
  FinancialRepositoryPort,
  Transaction,
  Asset,
  Liability,
  NetWorthSnapshot,
  APP_AS_OF_DATE,
  TransactionQuery,
  TransactionRepository,
  AssetRepository,
  LiabilityRepository,
  SnapshotRepository
} from '../domain/types';
import { useCanonicalLedger } from '../store/useCanonicalLedger';
import { IndexedDBStorageService } from '../services/IndexedDBStorageService';
import { demoTransactions, demoAssets, demoLiabilities, demoSnapshots } from '../domain/demoFixtures';
import { DateRangeService, formatDisplayDate } from '../services/DateRangeService';

function hashTx(tx: { account: string; date: string; amount: number; narration: string }): string {
  const str = `${tx.account}|${tx.date}|${tx.amount}|${tx.narration.toLowerCase().trim()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return 'fp-' + Math.abs(hash).toString(36);
}

export class MemoryTransactionRepository implements TransactionRepository {
  constructor(private root: MemoryRepository) {}

  async findMany(query: TransactionQuery): Promise<Transaction[]> {
    return this.findManySync(query);
  }

  findManySync(query: TransactionQuery): Transaction[] {
    const all = this.root.transactionsData;
    const type = query.type ?? 'All';
    const range = query.dateRange ?? 'This Month';
    const search = query.search ?? '';
    const start = query.customStart ?? undefined;
    const end = query.customEnd ?? undefined;
    const asOf = query.asOfDateStr ?? APP_AS_OF_DATE;

    const bounds = DateRangeService.getBounds(range, asOf, start, end);

    return all.filter(tx => {
      if (type !== 'All' && tx.type !== type && tx.type.toUpperCase() !== type) return false;
      if (tx.date < bounds.startDate || tx.date > bounds.endDate) return false;
      if (search) {
        const text = `${tx.title} ${tx.narration} ${tx.account} ${tx.category} ${tx.notes || ''}`.toLowerCase();
        if (!text.includes(search.toLowerCase())) return false;
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

  async append(tx: Transaction): Promise<void> {
    const prev = this.root.transactionsData;
    const fp = tx.fingerprint || hashTx(tx);
    const updated = { ...tx, fingerprint: fp };
    const next = [...prev, updated];

    this.root.transactionsData = next;
    this.root.syncStore();

    try {
      await IndexedDBStorageService.saveAll({
        transactions: next,
        assets: this.root.assetsData,
        liabilities: this.root.liabilitiesData,
        snapshots: this.root.snapshotsData
      });
    } catch (err) {
      this.root.transactionsData = prev;
      this.root.syncStore();
      throw err;
    }
  }

  async appendMany(txs: Transaction[]): Promise<void> {
    const prev = this.root.transactionsData;
    const seen = new Set(prev.map(t => t.fingerprint || hashTx(t)));
    const toAppend: Transaction[] = [];

    for (const tx of txs) {
      const fp = tx.fingerprint || hashTx(tx);
      if (seen.has(fp)) continue;
      seen.add(fp);
      toAppend.push({ ...tx, fingerprint: fp });
    }

    if (toAppend.length === 0) return;

    const next = [...prev, ...toAppend];
    this.root.transactionsData = next;
    this.root.syncStore();

    try {
      await IndexedDBStorageService.saveAll({
        transactions: next,
        assets: this.root.assetsData,
        liabilities: this.root.liabilitiesData,
        snapshots: this.root.snapshotsData
      });
    } catch (err) {
      this.root.transactionsData = prev;
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
    const prev = this.root.assetsData;
    const existingIdx = prev.findIndex(a => a.name === asset.name);
    let next: Asset[];
    if (existingIdx >= 0) {
      next = [...prev];
      next[existingIdx] = { ...next[existingIdx], ...asset };
    } else {
      next = [...prev, asset];
    }

    this.root.assetsData = next;
    this.root.syncStore();

    try {
      await IndexedDBStorageService.saveAll({
        transactions: this.root.transactionsData,
        assets: next,
        liabilities: this.root.liabilitiesData,
        snapshots: this.root.snapshotsData
      });
    } catch (err) {
      this.root.assetsData = prev;
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
    const prev = this.root.liabilitiesData;
    const existingIdx = prev.findIndex(l => l.name === liability.name);
    let next: Liability[];
    if (existingIdx >= 0) {
      next = [...prev];
      next[existingIdx] = { ...next[existingIdx], ...liability };
    } else {
      next = [...prev, liability];
    }

    this.root.liabilitiesData = next;
    this.root.syncStore();

    try {
      await IndexedDBStorageService.saveAll({
        transactions: this.root.transactionsData,
        assets: this.root.assetsData,
        liabilities: next,
        snapshots: this.root.snapshotsData
      });
    } catch (err) {
      this.root.liabilitiesData = prev;
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
    const existingIdx = prevSnaps.findIndex(s => s.dateStr.trim().toLowerCase() === snapToAdd!.dateStr.trim().toLowerCase());
    let nextSnaps: NetWorthSnapshot[];
    if (existingIdx >= 0) {
      nextSnaps = [...prevSnaps];
      nextSnaps[existingIdx] = { ...nextSnaps[existingIdx], ...snapToAdd };
    } else {
      nextSnaps = [snapToAdd, ...prevSnaps];
    }

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

  public transactions: TransactionRepository = new MemoryTransactionRepository(this);
  public assets: AssetRepository = new MemoryAssetRepository(this);
  public liabilities: LiabilityRepository = new MemoryLiabilityRepository(this);
  public snapshots: SnapshotRepository = new MemorySnapshotRepository(this);

  public syncStore() {
    useCanonicalLedger.getState().syncWithRepository({
      transactions: [...this.transactionsData],
      assets: [...this.assetsData],
      liabilities: [...this.liabilitiesData],
      snapshots: [...this.snapshotsData]
    });
  }

  async initialize(): Promise<void> {
    const data = await IndexedDBStorageService.loadAll();
    this.transactionsData = data.transactions;
    this.assetsData = data.assets;
    this.liabilitiesData = data.liabilities;
    this.snapshotsData = data.snapshots;
    this.syncStore();
  }

  async loadDemoData(): Promise<void> {
    this.transactionsData = [...demoTransactions];
    this.assetsData = [...demoAssets];
    this.liabilitiesData = [...demoLiabilities];
    this.snapshotsData = [...demoSnapshots];
    this.syncStore();
    await IndexedDBStorageService.saveAll({
      transactions: this.transactionsData,
      assets: this.assetsData,
      liabilities: this.liabilitiesData,
      snapshots: this.snapshotsData
    });
  }

  async clearLocalData(): Promise<void> {
    this.transactionsData = [];
    this.assetsData = [];
    this.liabilitiesData = [];
    this.snapshotsData = [];
    this.syncStore();
    await IndexedDBStorageService.clearAll();
  }
}
