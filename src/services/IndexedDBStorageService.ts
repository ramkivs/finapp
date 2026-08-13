import {
  Transaction,
  Asset,
  Liability,
  NetWorthSnapshot,
  Account,
  MonthlyBudget,
  InsurancePolicy,
  FinancialGoal,
  FinancialProfile
} from '../domain/types';

const DB_NAME = 'finboom_db';
const DB_VERSION = 3;

export interface StoredLedgerState {
  transactions: Transaction[];
  assets: Asset[];
  liabilities: Liability[];
  snapshots: NetWorthSnapshot[];
  accounts: Account[];
  budgets: MonthlyBudget[];
  policies: InsurancePolicy[];
  goals: FinancialGoal[];
  profile: FinancialProfile | null;
  hasLoadedOnce: boolean;
}

export class IndexedDBStorageService {
  private static nodeFallbackStore: StoredLedgerState = {
    transactions: [],
    assets: [],
    liabilities: [],
    snapshots: [],
    accounts: [],
    budgets: [],
    policies: [],
    goals: [],
    profile: null,
    hasLoadedOnce: false
  };

  private static mutex: Promise<any> = Promise.resolve();
  public static simulateFailureOnce: boolean = false;

  static enqueueSave<T>(task: () => Promise<T>): Promise<T> {
    const resultPromise = this.mutex.then(() => task());
    this.mutex = resultPromise.then(() => {}).catch(() => {});
    return resultPromise;
  }

  private static getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('transactions')) db.createObjectStore('transactions', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('assets')) db.createObjectStore('assets', { keyPath: 'name' });
        if (!db.objectStoreNames.contains('liabilities')) db.createObjectStore('liabilities', { keyPath: 'name' });
        if (!db.objectStoreNames.contains('snapshots')) db.createObjectStore('snapshots', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('accounts')) db.createObjectStore('accounts', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('budgets')) db.createObjectStore('budgets', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('policies')) db.createObjectStore('policies', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('goals')) db.createObjectStore('goals', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('profile')) db.createObjectStore('profile', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
      };
    });
  }

  static async loadAll(): Promise<StoredLedgerState> {
    return this.enqueueSave(async () => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return {
          transactions: [...this.nodeFallbackStore.transactions],
          assets: [...this.nodeFallbackStore.assets],
          liabilities: [...this.nodeFallbackStore.liabilities],
          snapshots: [...this.nodeFallbackStore.snapshots],
          accounts: [...this.nodeFallbackStore.accounts],
          budgets: [...this.nodeFallbackStore.budgets],
          policies: [...this.nodeFallbackStore.policies],
          goals: [...this.nodeFallbackStore.goals],
          profile: this.nodeFallbackStore.profile ? { ...this.nodeFallbackStore.profile } : null,
          hasLoadedOnce: this.nodeFallbackStore.hasLoadedOnce
        };
      }

      try {
        const db = await this.getDB();
        const storeNames = ['transactions', 'assets', 'liabilities', 'snapshots', 'accounts', 'budgets', 'policies', 'goals', 'profile', 'meta']
          .filter(name => db.objectStoreNames.contains(name));

        const tx = db.transaction(storeNames, 'readonly');
        const getStore = (name: string) => new Promise<any[]>((resolve) => {
          if (!db.objectStoreNames.contains(name)) return resolve([]);
          const req = tx.objectStore(name).getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        });

        const [
          transactions,
          assets,
          liabilities,
          snapshots,
          accounts,
          budgets,
          policies,
          goals,
          profiles,
          meta
        ] = await Promise.all([
          getStore('transactions'),
          getStore('assets'),
          getStore('liabilities'),
          getStore('snapshots'),
          getStore('accounts'),
          getStore('budgets'),
          getStore('policies'),
          getStore('goals'),
          getStore('profile'),
          getStore('meta')
        ]);

        const hasLoadedMeta = meta.find((m: any) => m.key === 'hasLoadedOnce');

        return {
          transactions: transactions as Transaction[],
          assets: assets as Asset[],
          liabilities: liabilities as Liability[],
          snapshots: snapshots as NetWorthSnapshot[],
          accounts: accounts as Account[],
          budgets: budgets as MonthlyBudget[],
          policies: policies as InsurancePolicy[],
          goals: goals as FinancialGoal[],
          profile: (profiles.length > 0 ? profiles[0] : null) as FinancialProfile | null,
          hasLoadedOnce: !!hasLoadedMeta?.value
        };
      } catch (e) {
        return {
          transactions: [...this.nodeFallbackStore.transactions],
          assets: [...this.nodeFallbackStore.assets],
          liabilities: [...this.nodeFallbackStore.liabilities],
          snapshots: [...this.nodeFallbackStore.snapshots],
          accounts: [...this.nodeFallbackStore.accounts],
          budgets: [...this.nodeFallbackStore.budgets],
          policies: [...this.nodeFallbackStore.policies],
          goals: [...this.nodeFallbackStore.goals],
          profile: this.nodeFallbackStore.profile ? { ...this.nodeFallbackStore.profile } : null,
          hasLoadedOnce: this.nodeFallbackStore.hasLoadedOnce
        };
      }
    });
  }

  static async saveAll(state: {
    transactions: Transaction[];
    assets: Asset[];
    liabilities: Liability[];
    snapshots: NetWorthSnapshot[];
    accounts?: Account[];
    budgets?: MonthlyBudget[];
    policies?: InsurancePolicy[];
    goals?: FinancialGoal[];
    profile?: FinancialProfile | null;
  }): Promise<void> {
    return this.enqueueSave(async () => {
      if (this.simulateFailureOnce) {
        this.simulateFailureOnce = false;
        throw new Error('Simulated IndexedDB persistence failure');
      }

      const accounts = state.accounts || [];
      const budgets = state.budgets || [];
      const policies = state.policies || [];
      const goals = state.goals || [];
      const profile = state.profile ? [state.profile] : [];

      if (typeof window === 'undefined' || !window.indexedDB) {
        this.nodeFallbackStore = {
          transactions: [...state.transactions],
          assets: [...state.assets],
          liabilities: [...state.liabilities],
          snapshots: [...state.snapshots],
          accounts: [...accounts],
          budgets: [...budgets],
          policies: [...policies],
          goals: [...goals],
          profile: state.profile ? { ...state.profile } : null,
          hasLoadedOnce: true
        };
        return;
      }

      try {
        const db = await this.getDB();
        const storeNames = ['transactions', 'assets', 'liabilities', 'snapshots', 'accounts', 'budgets', 'policies', 'goals', 'profile', 'meta']
          .filter(name => db.objectStoreNames.contains(name));

        const tx = db.transaction(storeNames, 'readwrite');

        const clearAndPut = (name: string, items: any[]) => {
          if (db.objectStoreNames.contains(name)) {
            const store = tx.objectStore(name);
            store.clear();
            items.forEach(item => store.put(item));
          }
        };

        clearAndPut('transactions', state.transactions);
        clearAndPut('assets', state.assets);
        clearAndPut('liabilities', state.liabilities);
        clearAndPut('snapshots', state.snapshots);
        clearAndPut('accounts', accounts);
        clearAndPut('budgets', budgets);
        clearAndPut('policies', policies);
        clearAndPut('goals', goals);
        clearAndPut('profile', profile);

        if (db.objectStoreNames.contains('meta')) {
          const metaStore = tx.objectStore('meta');
          metaStore.put({ key: 'hasLoadedOnce', value: true });
        }

        await new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
        });
      } catch (e) {
        this.nodeFallbackStore = {
          transactions: [...state.transactions],
          assets: [...state.assets],
          liabilities: [...state.liabilities],
          snapshots: [...state.snapshots],
          accounts: [...accounts],
          budgets: [...budgets],
          policies: [...policies],
          goals: [...goals],
          profile: state.profile ? { ...state.profile } : null,
          hasLoadedOnce: true
        };
      }
    });
  }

  static async clearAll(): Promise<void> {
    return this.enqueueSave(async () => {
      if (this.simulateFailureOnce) {
        this.simulateFailureOnce = false;
        throw new Error('Simulated IndexedDB persistence failure');
      }

      if (typeof window === 'undefined' || !window.indexedDB) {
        this.nodeFallbackStore = {
          transactions: [],
          assets: [],
          liabilities: [],
          snapshots: [],
          accounts: [],
          budgets: [],
          policies: [],
          goals: [],
          profile: null,
          hasLoadedOnce: true
        };
        return;
      }

      try {
        const db = await this.getDB();
        const storeNames = ['transactions', 'assets', 'liabilities', 'snapshots', 'accounts', 'budgets', 'policies', 'goals', 'profile', 'meta']
          .filter(name => db.objectStoreNames.contains(name));

        const tx = db.transaction(storeNames, 'readwrite');
        storeNames.forEach(name => {
          if (name !== 'meta') {
            tx.objectStore(name).clear();
          }
        });
        if (db.objectStoreNames.contains('meta')) {
          tx.objectStore('meta').put({ key: 'hasLoadedOnce', value: true });
        }

        await new Promise<void>((resolve, reject) => {
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
        });
      } catch (e) {
        this.nodeFallbackStore = {
          transactions: [],
          assets: [],
          liabilities: [],
          snapshots: [],
          accounts: [],
          budgets: [],
          policies: [],
          goals: [],
          profile: null,
          hasLoadedOnce: true
        };
      }
    });
  }
}
