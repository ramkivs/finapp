import {
  Transaction, Asset, Liability, NetWorthSnapshot,
  TransactionQuery, TransactionRepository, AssetRepository,
  LiabilityRepository, SnapshotRepository, FinancialRepositoryPort
} from '../domain/types';
import { useCanonicalLedger } from '../store/useCanonicalLedger';

export class MemoryTransactionRepository implements TransactionRepository {
  async findMany(query: TransactionQuery): Promise<Transaction[]> {
    return this.findManySync(query);
  }

  findManySync(query: TransactionQuery): Transaction[] {
    return useCanonicalLedger.getState().getFilteredTransactions(query);
  }

  async append(transaction: Transaction): Promise<void> {
    const store = useCanonicalLedger.getState();
    if (transaction.type === 'INCOME') {
      store.addIncome(transaction.title, transaction.amount, transaction.account, transaction.category, transaction.notes);
    } else if (transaction.type === 'EXPENSE') {
      store.addExpense(transaction.title, transaction.amount, transaction.account, transaction.category, transaction.notes);
    } else if (transaction.type === 'TRANSFER') {
      store.addTransfer(transaction.account, transaction.title, transaction.amount);
    }
  }

  async appendMany(transactions: Transaction[]): Promise<void> {
    const store = useCanonicalLedger.getState();
    store.appendTransactionsDirect(transactions);
  }
}

export class MemoryAssetRepository implements AssetRepository {
  async findAll(): Promise<Asset[]> {
    return this.findAllSync();
  }

  findAllSync(): Asset[] {
    return useCanonicalLedger.getState().assets;
  }

  async add(asset: Asset): Promise<void> {
    useCanonicalLedger.getState().addAsset(asset.name, asset.amount);
  }
}

export class MemoryLiabilityRepository implements LiabilityRepository {
  async findAll(): Promise<Liability[]> {
    return this.findAllSync();
  }

  findAllSync(): Liability[] {
    return useCanonicalLedger.getState().liabilities;
  }

  async add(liability: Liability): Promise<void> {
    useCanonicalLedger.getState().addLiability(liability.name, liability.amount);
  }
}

export class MemorySnapshotRepository implements SnapshotRepository {
  async findAll(): Promise<NetWorthSnapshot[]> {
    return this.findAllSync();
  }

  findAllSync(): NetWorthSnapshot[] {
    return useCanonicalLedger.getState().snapshots;
  }

  async create(): Promise<void> {
    useCanonicalLedger.getState().captureSnapshot();
  }
}

export class MemoryRepository implements FinancialRepositoryPort {
  public transactions = new MemoryTransactionRepository();
  public assets = new MemoryAssetRepository();
  public liabilities = new MemoryLiabilityRepository();
  public snapshots = new MemorySnapshotRepository();

  clearLocalData(): void {
    useCanonicalLedger.getState().clearLocalData();
  }
}
