/**
 * Loading States
 * Utilities for managing loading states across the application
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore, loading } from '../zustand/ui-store';

/**
 * Loading state types
 */
export enum LoadingType {
  QUERY = 'query',
  MUTATION = 'mutation',
  NAVIGATION = 'navigation',
  COMPONENT = 'component',
  BACKGROUND = 'background',
}

/**
 * Loading state configuration
 */
export interface LoadingConfig {
  key: string;
  type: LoadingType;
  message?: string;
  cancellable?: boolean;
  timeout?: number;
}

/**
 * Global loading manager
 */
export class LoadingManager {
  private static instance: LoadingManager;
  private activeLoading: Map<string, LoadingConfig & { startTime: number }> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }

  /**
   * Start loading state
   */
  start(config: LoadingConfig): void {
    const { key, timeout } = config;
    
    // Clear existing timeout if any
    const existingTimeout = this.timeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Add to active loading
    this.activeLoading.set(key, {
      ...config,
      startTime: Date.now(),
    });

    // Update UI store
    loading.start(key);

    // Set timeout if specified
    if (timeout) {
      const timeoutId = setTimeout(() => {
        this.stop(key);
        console.warn(`Loading timeout for ${key} after ${timeout}ms`);
      }, timeout);
      
      this.timeouts.set(key, timeoutId);
    }
  }

  /**
   * Stop loading state
   */
  stop(key: string): void {
    // Clear timeout
    const timeoutId = this.timeouts.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(key);
    }

    // Remove from active loading
    this.activeLoading.delete(key);

    // Update UI store
    loading.stop(key);
  }

  /**
   * Check if loading
   */
  isLoading(key: string): boolean {
    return this.activeLoading.has(key);
  }

  /**
   * Get all active loading states
   */
  getActiveLoading(): Array<LoadingConfig & { startTime: number; duration: number }> {
    const now = Date.now();
    return Array.from(this.activeLoading.values()).map(loading => ({
      ...loading,
      duration: now - loading.startTime,
    }));
  }

  /**
   * Get loading by type
   */
  getLoadingByType(type: LoadingType): Array<LoadingConfig & { startTime: number; duration: number }> {
    return this.getActiveLoading().filter(loading => loading.type === type);
  }

  /**
   * Cancel loading (if cancellable)
   */
  cancel(key: string): boolean {
    const loading = this.activeLoading.get(key);
    if (loading?.cancellable) {
      this.stop(key);
      return true;
    }
    return false;
  }

  /**
   * Clear all loading states
   */
  clearAll(): void {
    // Clear all timeouts
    for (const timeoutId of this.timeouts.values()) {
      clearTimeout(timeoutId);
    }
    this.timeouts.clear();

    // Clear active loading
    const keys = Array.from(this.activeLoading.keys());
    this.activeLoading.clear();

    // Update UI store
    keys.forEach(key => loading.stop(key));
  }
}

/**
 * Hook for managing loading states
 */
export const useLoadingManager = () => {
  const manager = LoadingManager.getInstance();

  const startLoading = (config: LoadingConfig) => manager.start(config);
  const stopLoading = (key: string) => manager.stop(key);
  const isLoading = (key: string) => manager.isLoading(key);
  const cancelLoading = (key: string) => manager.cancel(key);
  const getActiveLoading = () => manager.getActiveLoading();
  const clearAllLoading = () => manager.clearAll();

  return {
    startLoading,
    stopLoading,
    isLoading,
    cancelLoading,
    getActiveLoading,
    clearAllLoading,
  };
};

/**
 * Hook for query loading states with automatic management
 */
export const useQueryLoading = <TData = unknown>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: {
    loadingKey?: string;
    message?: string;
    timeout?: number;
  }
) => {
  const { startLoading, stopLoading } = useLoadingManager();
  const loadingKey = options?.loadingKey || `query-${JSON.stringify(queryKey)}`;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      startLoading({
        key: loadingKey,
        type: LoadingType.QUERY,
        message: options?.message,
        timeout: options?.timeout,
      });

      try {
        const result = await queryFn();
        return result;
      } finally {
        stopLoading(loadingKey);
      }
    },
  });

  // Stop loading on unmount or error
  React.useEffect(() => {
    return () => stopLoading(loadingKey);
  }, [loadingKey, stopLoading]);

  return {
    ...query,
    loadingKey,
  };
};

/**
 * Hook for mutation loading states with automatic management
 */
export const useMutationLoading = <TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    loadingKey?: string;
    message?: string;
    timeout?: number;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: any, variables: TVariables) => void;
  }
) => {
  const { startLoading, stopLoading } = useLoadingManager();

  const mutation = useMutation({
    mutationFn: async (variables: TVariables) => {
      const loadingKey = options?.loadingKey || `mutation-${Date.now()}`;
      
      startLoading({
        key: loadingKey,
        type: LoadingType.MUTATION,
        message: options?.message,
        timeout: options?.timeout,
      });

      try {
        const result = await mutationFn(variables);
        options?.onSuccess?.(result, variables);
        return result;
      } catch (error) {
        options?.onError?.(error, variables);
        throw error;
      } finally {
        stopLoading(loadingKey);
      }
    },
  });

  return mutation;
};

/**
 * Hook for component-level loading states
 */
export const useComponentLoading = (componentName: string) => {
  const { startLoading, stopLoading, isLoading } = useLoadingManager();
  const loadingKey = `component-${componentName}`;

  const setLoading = (loading: boolean, message?: string) => {
    if (loading) {
      startLoading({
        key: loadingKey,
        type: LoadingType.COMPONENT,
        message,
      });
    } else {
      stopLoading(loadingKey);
    }
  };

  const isComponentLoading = isLoading(loadingKey);

  React.useEffect(() => {
    return () => stopLoading(loadingKey);
  }, [loadingKey, stopLoading]);

  return {
    isLoading: isComponentLoading,
    setLoading,
  };
};

/**
 * Hook for navigation loading states
 */
export const useNavigationLoading = () => {
  const { startLoading, stopLoading } = useLoadingManager();

  const startNavigation = (destination: string) => {
    startLoading({
      key: 'navigation',
      type: LoadingType.NAVIGATION,
      message: `Navigating to ${destination}...`,
      timeout: 10000, // 10 second timeout
    });
  };

  const stopNavigation = () => {
    stopLoading('navigation');
  };

  return {
    startNavigation,
    stopNavigation,
  };
};

/**
 * Hook for background task loading states
 */
export const useBackgroundLoading = () => {
  const { startLoading, stopLoading, getLoadingByType } = useLoadingManager();

  const startBackgroundTask = (taskId: string, message?: string) => {
    startLoading({
      key: `background-${taskId}`,
      type: LoadingType.BACKGROUND,
      message,
      cancellable: true,
    });
  };

  const stopBackgroundTask = (taskId: string) => {
    stopLoading(`background-${taskId}`);
  };

  const getActiveTasks = () => {
    return getLoadingByType(LoadingType.BACKGROUND);
  };

  return {
    startBackgroundTask,
    stopBackgroundTask,
    getActiveTasks,
  };
};

/**
 * Loading state context for React
 */
import React, { createContext, useContext, ReactNode } from 'react';

interface LoadingContextType {
  isGlobalLoading: boolean;
  loadingCount: number;
  activeLoading: Array<LoadingConfig & { startTime: number; duration: number }>;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const manager = LoadingManager.getInstance();
  const [state, setState] = React.useState<LoadingContextType>({
    isGlobalLoading: false,
    loadingCount: 0,
    activeLoading: [],
  });

  React.useEffect(() => {
    const updateState = () => {
      const activeLoading = manager.getActiveLoading();
      setState({
        isGlobalLoading: activeLoading.length > 0,
        loadingCount: activeLoading.length,
        activeLoading,
      });
    };

    // Update state periodically
    const interval = setInterval(updateState, 100);

    return () => clearInterval(interval);
  }, [manager]);

  return (
    <LoadingContext.Provider value={state}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useGlobalLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useGlobalLoading must be used within LoadingProvider');
  }
  return context;
};

/**
 * Loading state selectors for UI store
 */
export const loadingSelectors = {
  isAnyLoading: useUIStore.getState().loading,
  isSpecificLoading: (key: string) => useUIStore.getState().loading[key] || false,
  getLoadingKeys: () => Object.keys(useUIStore.getState().loading),
  getLoadingCount: () => Object.keys(useUIStore.getState().loading).length,
};