import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface TabData {
  id: string;
  title: string;
  content: string;
  type: 'application/json' | 'text/csv';
  lastModified: number;
}

interface TabsDB extends DBSchema {
  tabs: {
    key: string;
    value: TabData;
    indexes: { 'by-last-modified': number };
  };
}

const DB_NAME = 'indexr-tabs-db';
const STORE_NAME = 'tabs';
const DB_VERSION = 1;

export async function initTabsDB(): Promise<IDBPDatabase<TabsDB>> {
  return openDB<TabsDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('by-last-modified', 'lastModified');
    },
  });
}

export async function getAllTabs(): Promise<TabData[]> {
  const db = await initTabsDB();
  return db.getAllFromIndex(STORE_NAME, 'by-last-modified');
}

export async function saveTab(tab: TabData): Promise<void> {
  const db = await initTabsDB();
  await db.put(STORE_NAME, {
    ...tab,
    lastModified: Date.now(),
  });
}

export async function deleteTab(id: string): Promise<void> {
  const db = await initTabsDB();
  await db.delete(STORE_NAME, id);
}

export async function clearAllTabs(): Promise<void> {
  const db = await initTabsDB();
  await db.clear(STORE_NAME);
}
