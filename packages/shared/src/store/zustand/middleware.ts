/**
 * Zustand Middleware
 * Custom middleware for state persistence, logging, and dev tools
 */

import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { StoreMiddlewareOptions } from './types';

/**
 * Logger middleware for development
 */
export const logger = <T>(
  f: StateCreator<T, [], [], T>,
  name?: string
): StateCreator<T, [], [], T> =>
  (set, get, store) => {
    const loggedSet: typeof set = (...args) => {
      if (process.env.NODE_ENV === 'development') {
        console.group(`🏪 ${name || 'Store'} Update`);
        console.log('Previous State:', get());
      }
      
      set(...args);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('New State:', get());
        console.groupEnd();
      }
    };

    store.setState = loggedSet;
    return f(loggedSet, get, store);
  };

/**
 * Persistence middleware for local storage
 */
interface PersistOptions<T> {
  name: string;
  storage?: {
    getItem: (name: string) => string | null | Promise<string | null>;
    setItem: (name: string, value: string) => void | Promise<void>;
    removeItem: (name: string) => void | Promise<void>;
  };
  partialize?: (state: T) => Partial<T>;
  version?: number;
  migrate?: (persistedState: any, version: number) => T;
  onRehydrateStorage?: (state: T) => void;
}

export const persist = <T>(
  f: StateCreator<T, [], [], T>,
  options: PersistOptions<T>
): StateCreator<T, [], [], T> =>
  (set, get, store) => {
    const { name, storage = localStorage, partialize, version = 0, migrate } = options;

    // Initialize with persisted state
    const initializeFromStorage = async () => {
      try {
        const item = await storage.getItem(name);
        if (item) {
          const persistedState = JSON.parse(item);
          
          if (migrate && persistedState.version !== version) {
            const migratedState = migrate(persistedState.state, persistedState.version || 0);
            set(migratedState);
          } else {
            set(persistedState.state);
          }
        }
      } catch (error) {
        console.warn(`Failed to load persisted state for ${name}:`, error);
      }
      
      options.onRehydrateStorage?.(get());
    };

    // Enhanced set function that persists to storage
    const persistedSet: typeof set = (...args) => {
      set(...args);
      
      try {
        const state = get();
        const stateToStore = partialize ? partialize(state) : state;
        const persistedData = {
          state: stateToStore,
          version,
        };
        
        storage.setItem(name, JSON.stringify(persistedData));
      } catch (error) {
        console.warn(`Failed to persist state for ${name}:`, error);
      }
    };

    store.setState = persistedSet;
    
    // Initialize from storage
    initializeFromStorage();
    
    return f(persistedSet, get, store);
  };

/**
 * React Native AsyncStorage adapter
 */
export const createAsyncStorageAdapter = () => {
  let AsyncStorage: any;
  
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch {
    console.warn('AsyncStorage not available');
    return undefined;
  }

  return {
    getItem: (name: string) => AsyncStorage.getItem(name),
    setItem: (name: string, value: string) => AsyncStorage.setItem(name, value),
    removeItem: (name: string) => AsyncStorage.removeItem(name),
  };
};

/**
 * Expo SecureStore adapter
 */
export const createSecureStoreAdapter = () => {
  let SecureStore: any;
  
  try {
    SecureStore = require('expo-secure-store');
  } catch {
    console.warn('SecureStore not available');
    return undefined;
  }

  return {
    getItem: (name: string) => SecureStore.getItemAsync(name),
    setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
    removeItem: (name: string) => SecureStore.deleteItemAsync(name),
  };
};

/**
 * Storage adapter factory
 */
export const createStorageAdapter = (type: 'localStorage' | 'asyncStorage' | 'secureStore' = 'localStorage') => {
  switch (type) {
    case 'asyncStorage':
      return createAsyncStorageAdapter();
    case 'secureStore':
      return createSecureStoreAdapter();
    default:
      if (typeof window !== 'undefined') {
        return {
          getItem: (name: string) => localStorage.getItem(name),
          setItem: (name: string, value: string) => localStorage.setItem(name, value),
          removeItem: (name: string) => localStorage.removeItem(name),
        };
      }
      return undefined;
  }
};

/**
 * Combined middleware composer
 */
export const createStoreWithMiddleware = <T>(
  storeCreator: StateCreator<T, [], [], T>,
  options: StoreMiddlewareOptions
) => {
  const { name, partialize, version, migrate } = options;
  
  let middleware = storeCreator;
  
  // Apply immer middleware for immutable updates
  middleware = immer(middleware);
  
  // Apply logger in development
  if (process.env.NODE_ENV === 'development') {
    middleware = logger(middleware, name);
  }
  
  // Apply devtools in development
  if (process.env.NODE_ENV === 'development') {
    middleware = devtools(middleware, { name });
  }
  
  // Apply persistence if storage is available
  const storage = options.storage || createStorageAdapter();
  if (storage) {
    middleware = persist(middleware, {
      name,
      storage,
      partialize,
      version,
      migrate,
    });
  }
  
  return middleware;
};

/**
 * Middleware for tracking store subscriptions
 */
export const subscriptions = <T>(
  f: StateCreator<T, [], [], T>
): StateCreator<T, [], [], T> =>
  (set, get, store) => {
    const subscribers = new Set<(state: T, prevState: T) => void>();
    
    const enhancedSet: typeof set = (...args) => {
      const prevState = get();
      set(...args);
      const newState = get();
      
      // Notify all subscribers
      subscribers.forEach((callback) => {
        try {
          callback(newState, prevState);
        } catch (error) {
          console.error('Store subscription error:', error);
        }
      });
    };

    store.setState = enhancedSet;
    
    // Add subscription methods to the store
    (store as any).subscribe = (callback: (state: T, prevState: T) => void) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    };
    
    return f(enhancedSet, get, store);
  };

/**
 * Middleware for automatic state cleanup
 */
export const autoCleanup = <T extends { reset?: () => void }>(
  f: StateCreator<T, [], [], T>,
  cleanupEvents: string[] = ['beforeunload']
): StateCreator<T, [], [], T> =>
  (set, get, store) => {
    const cleanup = () => {
      const state = get();
      if (state.reset) {
        state.reset();
      }
    };

    // Add event listeners for cleanup
    if (typeof window !== 'undefined') {
      cleanupEvents.forEach(event => {
        window.addEventListener(event, cleanup);
      });
    }

    return f(set, get, store);
  };