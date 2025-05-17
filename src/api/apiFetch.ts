import axios from "axios";

const DB_NAME = "FSDFCache";
const STORE_NAME = "apiCache";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = function (event: IDBVersionChangeEvent) {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = function (event: Event) {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    request.onerror = function (event: Event) {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

async function readCache(key: string): Promise<any> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function writeCache(key: string, data: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const req = store.put(data, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

interface FetchWithCacheOptions {
  oneDay?: number;
  oneMonth?: number;
}

export async function fetchWithCache(
  key: string,
  url: string,
  { oneDay = 86400000, oneMonth = 2592000000 }: FetchWithCacheOptions = {}
): Promise<any> {
  let now = Date.now();
  try {
    const cached = await readCache(key);
    if (cached && cached.timestamp) {
      const age = now - cached.timestamp;
      if (age < oneDay) {
        return cached.data;
      } else if (age < oneMonth) {
        axios.get(url)
          .then(res => {
            writeCache(key, { timestamp: Date.now(), data: res.data })
              .catch(e => console.error("Failed to refresh cache in background", e));
          })
          .catch(e => console.error("Failed to refresh data in background", e));
        return cached.data;
      }
    }
  } catch (e) {
    console.error("Failed to read cache", e);
  }
  const res = await axios.get(url);
  const data = res.data;
  try {
    await writeCache(key, { timestamp: Date.now(), data });
  } catch (e) {
    console.error("Failed to write cache", e);
  }
  return data;
}
