/**
 * Cache Persistence
 * Strategies for persisting cache data across sessions
 */

import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

/**
 * Storage adapters for different environments
 */
export const storageAdapters = {
  /**
   * Browser localStorage adapter
   */
  localStorage: {
    getItem: (key: string) => {
      if (typeof window === 'undefined') return null;
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(key, value);
      } catch {
        // Ignore storage errors
      }
    },
    removeItem: (key: string) => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore storage errors
      }
    },
  },

  /**
   * Browser sessionStorage adapter
   */
  sessionStorage: {
    getItem: (key: string) => {
      if (typeof window === 'undefined') return null;
      try {
        return sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      if (typeof window === 'undefined') return;
      try {
        sessionStorage.setItem(key, value);
      } catch {
        // Ignore storage errors
      }
    },
    removeItem: (key: string) => {
      if (typeof window === 'undefined') return;
      try {
        sessionStorage.removeItem(key);
      } catch {
        // Ignore storage errors
      }
    },
  },

  /**
   * IndexedDB adapter for larger storage
   */
  indexedDB: {
    dbName: 'QueryCache',
    storeName: 'queries',
    version: 1,

    async getItem(key: string): Promise<string | null> {
      if (typeof window === 'undefined') return null;
      
      try {
        const db = await this.openDB();
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const result = await this.promisifyRequest(store.get(key));
        db.close();
        
        return result?.value || null;
      } catch {
        return null;
      }
    },

    async setItem(key: string, value: string): Promise<void> {
      if (typeof window === 'undefined') return;
      
      try {
        const db = await this.openDB();
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        await this.promisifyRequest(store.put({ key, value, timestamp: Date.now() }));
        db.close();
      } catch {
        // Ignore storage errors
      }
    },

    async removeItem(key: string): Promise<void> {
      if (typeof window === 'undefined') return;
      
      try {
        const db = await this.openDB();
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        await this.promisifyRequest(store.delete(key));
        db.close();
      } catch {
        // Ignore storage errors
      }
    },

    openDB(): Promise<IDBDatabase> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };
      });
    },

    promisifyRequest(request: IDBRequest): Promise<any> {
      return new Promise((resolve, reject) => {
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    },
  },

  /**
   * React Native AsyncStorage adapter
   */
  asyncStorage: (() => {
    let AsyncStorage: any;
    
    try {
      AsyncStorage = require('@react-native-async-storage/async-storage').default;
    } catch {
      return null;
    }

    return {
      getItem: (key: string) => AsyncStorage.getItem(key),
      setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
      removeItem: (key: string) => AsyncStorage.removeItem(key),
    };
  })(),
};

/**
 * Cache persistence configuration
 */
export interface CachePersistenceConfig {
  storage: typeof storageAdapters.localStorage;
  key?: string;
  maxAge?: number;
  buster?: string;
  serialize?: (client: QueryClient) => string;
  deserialize?: (serialized: string) => QueryClient;
  hydrateOptions?: {
    defaultOptions?: any;
  };
}

/**
 * Default persistence configurations
 */
export const persistenceConfigs = {
  /**
   * Aggressive caching for offline-first apps
   */
  aggressive: {
    storage: storageAdapters.localStorage,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    key: 'react-query-cache-aggressive',
  },

  /**
   * Balanced caching for most apps
   */
  balanced: {
    storage: storageAdapters.localStorage,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    key: 'react-query-cache-balanced',
  },

  /**
   * Conservative caching for sensitive data
   */
  conservative: {
    storage: storageAdapters.sessionStorage,
    maxAge: 1000 * 60 * 60, // 1 hour
    key: 'react-query-cache-conservative',
  },

  /**
   * Large storage for heavy data
   */
  heavy: {
    storage: storageAdapters.indexedDB,
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    key: 'react-query-cache-heavy',
  },
};

/**
 * Custom serializer that handles special data types
 */
export const customSerializer = {
  serialize: (client: QueryClient): string => {
    const data = client.getQueryCache().getAll().map(query => ({
      queryKey: query.queryKey,
      queryHash: query.queryHash,
      state: {
        ...query.state,
        // Convert dates to ISO strings
        dataUpdatedAt: query.state.dataUpdatedAt,
        errorUpdatedAt: query.state.errorUpdatedAt,
      },
    }));

    return JSON.stringify({
      timestamp: Date.now(),
      queries: data,
    });
  },

  deserialize: (serialized: string): any => {
    try {
      const parsed = JSON.parse(serialized);
      
      // Check if data is too old
      const maxAge = 1000 * 60 * 60 * 24; // 1 day
      if (Date.now() - parsed.timestamp > maxAge) {
        return null;
      }

      return parsed.queries.reduce((acc: any, query: any) => {
        acc[query.queryHash] = {
          ...query.state,
          dataUpdatedAt: query.state.dataUpdatedAt,
          errorUpdatedAt: query.state.errorUpdatedAt,
        };
        return acc;
      }, {});
    } catch {
      return null;
    }
  },
};

/**
 * Selective persistence - only persist certain queries
 */
export const createSelectivePersistence = (
  shouldPersist: (queryKey: readonly unknown[]) => boolean
) => {
  return {
    serialize: (client: QueryClient): string => {
      const queries = client.getQueryCache().getAll()
        .filter(query => shouldPersist(query.queryKey))
        .map(query => ({
          queryKey: query.queryKey,
          queryHash: query.queryHash,
          state: query.state,
        }));

      return JSON.stringify({
        timestamp: Date.now(),
        queries,
      });
    },

    deserialize: (serialized: string): any => {
      try {
        const parsed = JSON.parse(serialized);
        return parsed.queries.reduce((acc: any, query: any) => {
          acc[query.queryHash] = query.state;
          return acc;
        }, {});
      } catch {
        return null;
      }
    },
  };
};

/**
 * Compression utilities for large cache data
 */
export const compressionUtils = {
  /**
   * Simple LZ-string compression (requires lz-string library)
   */
  compress: (data: string): string => {
    // This would use a compression library like lz-string
    // For now, just return the original data
    return data;
  },

  decompress: (compressed: string): string => {
    // This would decompress the data
    // For now, just return the original data
    return compressed;
  },

  /**
   * JSON compression by removing unnecessary whitespace and keys
   */
  compressJSON: (obj: any): string => {
    // Remove null/undefined values and empty objects/arrays
    const cleaned = JSON.parse(JSON.stringify(obj, (key, value) => {
      if (value === null || value === undefined) return undefined;
      if (Array.isArray(value) && value.length === 0) return undefined;
      if (typeof value === 'object' && Object.keys(value).length === 0) return undefined;
      return value;
    }));

    return JSON.stringify(cleaned);
  },
};

/**
 * Cache migration utilities for version updates
 */
export const migrationUtils = {
  /**
   * Migrate cache data between versions
   */
  migrate: (
    data: any,
    fromVersion: number,
    toVersion: number,
    migrations: Record<number, (data: any) => any>
  ): any => {
    let migratedData = data;
    
    for (let version = fromVersion + 1; version <= toVersion; version++) {
      const migration = migrations[version];
      if (migration) {
        migratedData = migration(migratedData);
      }
    }
    
    return migratedData;
  },

  /**
   * Example migration functions
   */
  exampleMigrations: {
    // Migration from version 1 to 2
    2: (data: any) => {
      // Example: rename a field
      if (data.queries) {
        data.queries.forEach((query: any) => {
          if (query.state.lastUpdated) {
            query.state.dataUpdatedAt = query.state.lastUpdated;
            delete query.state.lastUpdated;
          }
        });
      }
      return data;
    },

    // Migration from version 2 to 3
    3: (data: any) => {
      // Example: restructure data
      if (data.queries) {
        data.queries = data.queries.map((query: any) => ({
          ...query,
          metadata: {
            version: 3,
            migrated: true,
          },
        }));
      }
      return data;
    },
  },
};

/**
 * Cache cleanup utilities
 */
export const cleanupUtils = {
  /**
   * Clean up expired cache entries
   */
  cleanupExpired: async (storage: any, keyPrefix: string, maxAge: number) => {
    if (typeof storage.getItem !== 'function') return;

    try {
      const allKeys = await storage.getAllKeys?.() || [];
      const cacheKeys = allKeys.filter((key: string) => key.startsWith(keyPrefix));
      
      for (const key of cacheKeys) {
        const data = await storage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (Date.now() - parsed.timestamp > maxAge) {
            await storage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  },

  /**
   * Clean up storage by size limit
   */
  cleanupBySize: async (storage: any, keyPrefix: string, maxSizeBytes: number) => {
    if (typeof storage.getItem !== 'function') return;

    try {
      const allKeys = await storage.getAllKeys?.() || [];
      const cacheKeys = allKeys.filter((key: string) => key.startsWith(keyPrefix));
      
      let totalSize = 0;
      const keysSizes: Array<{ key: string; size: number; timestamp: number }> = [];
      
      for (const key of cacheKeys) {
        const data = await storage.getItem(key);
        if (data) {
          const size = new Blob([data]).size;
          const parsed = JSON.parse(data);
          keysSizes.push({
            key,
            size,
            timestamp: parsed.timestamp || 0,
          });
          totalSize += size;
        }
      }
      
      if (totalSize > maxSizeBytes) {
        // Sort by timestamp (oldest first) and remove until under limit
        keysSizes.sort((a, b) => a.timestamp - b.timestamp);
        
        for (const { key, size } of keysSizes) {
          await storage.removeItem(key);
          totalSize -= size;
          
          if (totalSize <= maxSizeBytes) break;
        }
      }
    } catch (error) {
      console.warn('Cache size cleanup failed:', error);
    }
  },
};

/**
 * Hook for setting up cache persistence
 */
export const useCachePersistence = (
  queryClient: QueryClient,
  config: CachePersistenceConfig
) => {
  const persist = () => {
    return persistQueryClient({
      queryClient,
      persister: {
        persistClient: async (client) => {
          const serialized = config.serialize ? 
            config.serialize(client) : 
            customSerializer.serialize(client);
          
          await config.storage.setItem(config.key || 'react-query-cache', serialized);
        },
        restoreClient: async () => {
          const serialized = await config.storage.getItem(config.key || 'react-query-cache');
          if (!serialized) return;
          
          return config.deserialize ? 
            config.deserialize(serialized) : 
            customSerializer.deserialize(serialized);
        },
        removeClient: async () => {
          await config.storage.removeItem(config.key || 'react-query-cache');
        },
      },
      maxAge: config.maxAge,
      buster: config.buster,
      hydrateOptions: config.hydrateOptions,
    });
  };

  return { persist };
};