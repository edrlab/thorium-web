const DB_NAME = "thorium-web";
// Bumped with each new store, created in onupgradeneeded
const DB_VERSION = 1;
const STORES = ["settings"] as const;

export type IndexedDBStoreName = typeof STORES[number];

let databasePromise: Promise<IDBDatabase | null> | null = null;

const warn = (error: unknown) => console.warn("IndexedDB:", error);

// Resolves null where IndexedDB is unavailable, e.g. some private browsing modes
const openDatabase = (): Promise<IDBDatabase | null> => {
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        STORES.forEach((name) => {
          if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name);
        });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        warn(request.error);
        resolve(null);
      };
      request.onblocked = () => resolve(null);
    } catch (error) {
      warn(error);
      resolve(null);
    }
  });

  return databasePromise;
};

const run = async <T>(storeName: IndexedDBStoreName, mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> => {
  const database = await openDatabase();
  if (!database) return undefined;

  return new Promise((resolve) => {
    try {
      const request = operation(database.transaction(storeName, mode).objectStore(storeName));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        warn(request.error);
        resolve(undefined);
      };
    } catch (error) {
      warn(error);
      resolve(undefined);
    }
  });
};

export const getFromIndexedDB = <T>(storeName: IndexedDBStoreName, key: string): Promise<T | undefined> => {
  return run<T>(storeName, "readonly", (store) => store.get(key));
};

export const setInIndexedDB = async (storeName: IndexedDBStoreName, key: string, value: unknown): Promise<void> => {
  await run(storeName, "readwrite", (store) => store.put(value, key));
};
