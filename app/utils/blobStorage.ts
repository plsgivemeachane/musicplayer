import { openDB, IDBPDatabase } from 'idb';

const BLOB_STORE_NAME = 'songBlobStore';
const BLOB_DB_NAME = 'MusicPlayerBlobCache';
const BLOB_DB_VERSION = 1;
const BLOB_EXPIRATION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30days

export interface BlobStorageItem {
  songId: string;
  blob: Blob;
  expiresAt: number;
  createdAt: number;
}

class BlobStorageManager {
  private static instance: BlobStorageManager;
  private db: IDBPDatabase | null = null;

  private constructor() {}

  public static getInstance(): BlobStorageManager {
    if (!BlobStorageManager.instance) {
      BlobStorageManager.instance = new BlobStorageManager();
    }
    return BlobStorageManager.instance;
  }

  private async initializeDB(): Promise<IDBPDatabase | null> {
    if (typeof window === 'undefined') return null;
    
    if (!this.db) {
      this.db = await openDB(BLOB_DB_NAME, BLOB_DB_VERSION, {
        upgrade(db) {
          // Create an object store for song blobs
          if (!db.objectStoreNames.contains(BLOB_STORE_NAME)) {
            const store = db.createObjectStore(BLOB_STORE_NAME, { 
              keyPath: 'songId'
            });

            // Create indexes for efficient querying
            store.createIndex('expiresAt', 'expiresAt', { unique: false });
          }
        },
      });
    }
    return this.db;
  }

  public async saveBlob(songId: string, blob: Blob, expirationDuration: number = BLOB_EXPIRATION_DURATION): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const db = await this.initializeDB();
      if (!db) return;

      const tx = db.transaction(BLOB_STORE_NAME, 'readwrite');
      const store = tx.objectStore(BLOB_STORE_NAME);
      
      await store.put({
        songId,
        blob,
        expiresAt: Date.now() + expirationDuration,
        createdAt: Date.now()
      });

      await tx.done;
      console.log(`[IndexedDB] Saved blob for song ${songId}`);
    } catch (error) {
      console.error('[IndexedDB] Error saving blob:', error);
    }
  }

  public async getBlob(songId: string): Promise<Blob | null> {
    if (typeof window === 'undefined') return null;

    try {
      const db = await this.initializeDB();
      if (!db) return null;

      const tx = db.transaction(BLOB_STORE_NAME, 'readonly');
      const store = tx.objectStore(BLOB_STORE_NAME);
      
      const item = await store.get(songId);
      
      if (item && item.expiresAt > Date.now()) {
        console.log(`[IndexedDB] Retrieved blob for song ${songId}`);
        return item.blob;
      }
      
      // If expired or not found, return null
      return null;
    } catch (error) {
      console.error('[IndexedDB] Error retrieving blob:', error);
      return null;
    }
  }

  public async cleanupExpiredBlobs(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const db = await this.initializeDB();
      if (!db) return;

      const tx = db.transaction(BLOB_STORE_NAME, 'readwrite');
      const store = tx.objectStore(BLOB_STORE_NAME);
      
      const index = store.index('expiresAt');
      const expiredRange = IDBKeyRange.upperBound(Date.now());
      
      let cursor = await index.openCursor(expiredRange);
      
      while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
      }

      await tx.done;
      console.log('[IndexedDB] Cleaned up expired blobs');
    } catch (error) {
      console.error('[IndexedDB] Error cleaning up blobs:', error);
    }
  }
}

export const blobStorage = BlobStorageManager.getInstance();
