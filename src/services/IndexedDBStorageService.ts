import { Transaction, Asset, Liability, NetWorthSnapshot } from '../domain/types';

const DB_NAME = 'finboom_db';
const DB_VERSION = 1;

export interface StoredLedgerState {
  transactions: Transaction[];
  assets: Asset[];
  liabilities: Liability[];
  snapshots: NetWorthSnapshot[];
  hasLoadedOnce: boolean;
}

export class IndexedDBStorageService {
  private static nodeFallbackStore: StoredLedgerState = {
    transactions: [],
    assets: [],
    liabilities: [],
    snapshots: [],
    hasLoadedOnce: false
  };

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
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
      };
    });
  }

  static async loadAll(): Promise<StoredLedgerState> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.resolve({
        transactions: [...this.nodeFallbackStore.transactions],
        assets: [...this.nodeFallbackStore.assets],
        liabilities: [...this.nodeFallbackStore.liabilities],
        snapshots: [...this.nodeFallbackStore.snapshots],
        hasLoadedOnce: this.nodeFallbackStore.hasLoadedOnce
      });
    }

    try {
      const db = await this.getDB();
      const tx = db.transaction(['transactions', 'assets', 'liabilities', 'snapshots', 'meta'], 'readonly');
      const getStore = (name: string) => new Promise<any[]>((resolve) => {
        const req = tx.objectStore(name).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });

      const [txs, assets, liabs, snaps, meta] = await Promise.all([
        getStore('transactions'),
        getStore('assets'),
        getStore('liabilities'),
        getStore('snapshots'),
        getStore('meta')
      ]);

      const hasLoadedMeta = meta.find(m => m.key === 'hasLoadedOnce');
      db.close();
      return {
        transactions: txs as Transaction[],
        assets: assets as Asset[],
        liabilities: liabs as Liability[],
        snapshots: snaps as NetWorthSnapshot[],
        hasLoadedOnce: !!hasLoadedMeta?.value
      };
    } catch (e) {
      return {
        transactions: [...this.nodeFallbackStore.transactions],
        assets: [...this.nodeFallbackStore.assets],
        liabilities: [...this.nodeFallbackStore.liabilities],
        snapshots: [...this.nodeFallbackStore.snapshots],
        hasLoadedOnce: this.nodeFallbackStore.hasLoadedOnce
      };
    }
  }

  static async saveAll(state: {
    transactions: Transaction[];
    assets: Asset[];
    liabilities: Liability[];
    snapshots: NetWorthSnapshot[];
  }): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      this.nodeFallbackStore = {
        transactions: [...state.transactions],
        assets: [...state.assets],
        liabilities: [...state.liabilities],
        snapshots: [...state.snapshots],
        hasLoadedOnce: true
      };
      return Promise.resolve();
    }

    try {
      const db = await this.getDB();
      const tx = db.transaction(['transactions', 'assets', 'liabilities', 'snapshots', 'meta'], 'readwrite');

      const clearAndPut = (name: string, items: any[]) => {
        const store = tx.objectStore(name);
        store.clear();
        items.forEach(item => store.put(item));
      };

      clearAndPut('transactions', state.transactions);
      clearAndPut('assets', state.assets);
      clearAndPut('liabilities', state.liabilities);
      clearAndPut('snapshots', state.snapshots);

      const metaStore = tx.objectStore('meta');
      metaStore.put({ key: 'hasLoadedOnce', value: true });

      return new Promise((resolve, reject) => {
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
        hasLoadedOnce: true
      };
      return Promise.resolve();
    }
  }

  static async clearAll(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      this.nodeFallbackStore = {
        transactions: [],
        assets: [],
        liabilities: [],
        snapshots: [],
        hasLoadedOnce: true
      };
      return Promise.resolve();
    }

    try {
      const db = await this.getDB();
      const tx = db.transaction(['transactions', 'assets', 'liabilities', 'snapshots', 'meta'], 'readwrite');
      tx.objectStore('transactions').clear();
      tx.objectStore('assets').clear();
      tx.objectStore('liabilities').clear();
      tx.objectStore('snapshots').clear();
      tx.objectStore('meta').put({ key: 'hasLoadedOnce', value: true });
      return new Promise((resolve, reject) => {
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
        hasLoadedOnce: true
      };
      return Promise.resolve();
    }
  }
}
