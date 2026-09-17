import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { OfflineRecord } from '@/types';

interface MedicineDB extends DBSchema {
  offlineRecords: {
    key: string;
    value: OfflineRecord;
    indexes: { 'by-synced': number };
  };
}

let db: IDBPDatabase<MedicineDB> | null = null;

async function getDB(): Promise<IDBPDatabase<MedicineDB>> {
  if (db) return db;

  db = await openDB<MedicineDB>('medicine-reminder', 1, {
    upgrade(database) {
      const store = database.createObjectStore('offlineRecords', { keyPath: 'id' });
      store.createIndex('by-synced', 'synced');
    },
  });

  return db;
}

export async function saveOfflineRecord(record: OfflineRecord): Promise<void> {
  const database = await getDB();
  await database.put('offlineRecords', record);
}

export async function getUnsynedRecords(): Promise<OfflineRecord[]> {
  const database = await getDB();
  const tx = database.transaction('offlineRecords', 'readonly');
  const index = tx.store.index('by-synced');
  return index.getAll(IDBKeyRange.only(0));
}

export async function markRecordSynced(id: string): Promise<void> {
  const database = await getDB();
  const record = await database.get('offlineRecords', id);
  if (record) {
    record.synced = true;
    await database.put('offlineRecords', record);
  }
}

export async function getAllOfflineRecords(): Promise<OfflineRecord[]> {
  const database = await getDB();
  return database.getAll('offlineRecords');
}

/**
 * Sync offline records to the server
 * Returns number of records synced
 */
export async function syncOfflineRecords(): Promise<number> {
  const unsynced = await getUnsynedRecords();
  if (unsynced.length === 0) return 0;

  let synced = 0;

  for (const record of unsynced) {
    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId: record.medicineId,
          medicineNameEn: record.medicineNameEn,
          medicineNameBn: record.medicineNameBn,
          scheduledTime: record.scheduledTime,
          actualGivenTime: record.actualGivenTime,
          date: record.date,
          clientRecordId: record.id,
        }),
      });

      if (response.ok || response.status === 409) {
        // 409 = already exists (duplicate), still mark as synced
        await markRecordSynced(record.id);
        synced++;
      }
    } catch {
      // Network error, will retry next time
    }
  }

  return synced;
}
