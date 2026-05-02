import axios from "axios";
import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "FSDFCache";
const STORE_NAME = "apiCache";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

async function readCache(key: string): Promise<unknown> {
  const db = await getDB();
  return db.get(STORE_NAME, key);
}

async function writeCache(key: string, data: unknown): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, data, key);
}

interface FetchWithCacheOptions {
  oneDay?: number;
  oneMonth?: number;
}

// Track in-flight requests to deduplicate concurrent calls for the same key
const pendingRequests = new Map<string, Promise<unknown>>();

export async function fetchWithCache(
  key: string,
  url: string,
  { oneDay = 86400000, oneMonth = 2592000000 }: FetchWithCacheOptions = {}
): Promise<unknown> {
  const now = Date.now();

  // Try serving from cache
  try {
    const cached = await readCache(key);
    if (cached && typeof cached === "object" && "timestamp" in cached) {
      const { timestamp, data } = cached as { timestamp: number; data: unknown };
      const age = now - timestamp;
      if (age < oneDay) {
        return data;
      }
      if (age < oneMonth) {
        // Stale-while-revalidate: return cached data, refresh in background
        // Deduplicate background refresh
        const bgKey = `__bg_${key}`;
        if (!pendingRequests.has(bgKey)) {
          const bgPromise = axios
            .get(url)
            .then((res) =>
              writeCache(key, { timestamp: Date.now(), data: res.data })
            )
            .catch((e) =>
              console.error("Failed to refresh cache in background", e)
            )
            .finally(() => pendingRequests.delete(bgKey));
          pendingRequests.set(bgKey, bgPromise);
        }
        return data;
      }
    }
  } catch (e) {
    console.error("Failed to read cache", e);
  }

  // Deduplicate in-flight requests
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const requestPromise = axios
    .get(url)
    .then((res) => {
      const data = res.data;
      writeCache(key, { timestamp: Date.now(), data }).catch((e) =>
        console.error("Failed to write cache", e)
      );
      return data;
    })
    .catch((err) => {
      pendingRequests.delete(key);
      throw err;
    })
    .finally(() => pendingRequests.delete(key));

  pendingRequests.set(key, requestPromise);
  return requestPromise;
}
