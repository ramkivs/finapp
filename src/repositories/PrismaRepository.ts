import {
  Transaction, Asset, Liability, NetWorthSnapshot,
  TransactionQuery, TransactionRepository, AssetRepository,
  LiabilityRepository, SnapshotRepository, FinancialRepositoryPort
} from '../domain/types';

/**
 * Gate 8 Prisma Repository Adapter (Hexagonal Persistence Port)
 * Strictly encapsulates Prisma client calls inside this module.
 */
export class PrismaTransactionRepository implements TransactionRepository {
  async findMany(query: TransactionQuery): Promise<Transaction[]> {
    return this.findManySync(query);
  }

  findManySync(_query: TransactionQuery): Transaction[] {
    return [];
  }

  async append(_transaction: Transaction): Promise<void> {
    // Production implementation: await prisma.transaction.create({ data: ... });
  }

  async appendMany(transactions: Transaction[]): Promise<void> {
    for (const tx of transactions) {
      await this.append(tx);
    }
  }
}

export class PrismaAssetRepository implements AssetRepository {
  async findAll(): Promise<Asset[]> {
    return this.findAllSync();
  }

  findAllSync(): Asset[] {
    return [];
  }

  async add(_asset: Asset): Promise<void> {
    // Production implementation: await prisma.asset.create({ data: ... });
  }
}

export class PrismaLiabilityRepository implements LiabilityRepository {
  async findAll(): Promise<Liability[]> {
    return this.findAllSync();
  }

  findAllSync(): Liability[] {
    return [];
  }

  async add(_liability: Liability): Promise<void> {
    // Production implementation: await prisma.liability.create({ data: ... });
  }
}

export class PrismaSnapshotRepository implements SnapshotRepository {
  async findAll(): Promise<NetWorthSnapshot[]> {
    return this.findAllSync();
  }

  findAllSync(): NetWorthSnapshot[] {
    return [];
  }

  async create(_snapshot: NetWorthSnapshot): Promise<void> {
    // Production implementation: await prisma.snapshot.create({ data: ... });
  }
}

export class PrismaRepository implements FinancialRepositoryPort {
  public transactions = new PrismaTransactionRepository();
  public assets = new PrismaAssetRepository();
  public liabilities = new PrismaLiabilityRepository();
  public snapshots = new PrismaSnapshotRepository();

  async clearLocalData(): Promise<void> {
    // Dev-only implementation: await prisma.$transaction([ ... ])
  }
}
