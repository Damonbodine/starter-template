/**
 * Rollback Manager
 * Manages rollback strategies for failed optimistic updates
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

/**
 * Rollback context interface
 */
export interface RollbackContext {
  id: string;
  queryKey: readonly unknown[];
  previousData: unknown;
  timestamp: number;
  operation: string;
  metadata?: Record<string, any>;
}

/**
 * Rollback manager for handling complex optimistic update failures
 */
export class RollbackManager {
  private contexts: Map<string, RollbackContext> = new Map();
  private queryClient: any;

  constructor(queryClient: any) {
    this.queryClient = queryClient;
  }

  /**
   * Create a rollback context
   */
  createContext(
    operation: string,
    queryKey: readonly unknown[],
    metadata?: Record<string, any>
  ): RollbackContext {
    const id = `rollback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const previousData = this.queryClient.getQueryData(queryKey);
    
    const context: RollbackContext = {
      id,
      queryKey,
      previousData,
      timestamp: Date.now(),
      operation,
      metadata,
    };

    this.contexts.set(id, context);
    return context;
  }

  /**
   * Execute rollback for a specific context
   */
  rollback(contextId: string): boolean {
    const context = this.contexts.get(contextId);
    if (!context) return false;

    this.queryClient.setQueryData(context.queryKey, context.previousData);
    this.contexts.delete(contextId);
    return true;
  }

  /**
   * Rollback all contexts for a specific query key
   */
  rollbackQuery(queryKey: readonly unknown[]): number {
    let rolledBack = 0;
    
    for (const [id, context] of this.contexts.entries()) {
      if (this.areQueryKeysEqual(context.queryKey, queryKey)) {
        this.rollback(id);
        rolledBack++;
      }
    }
    
    return rolledBack;
  }

  /**
   * Rollback all contexts for a specific operation
   */
  rollbackOperation(operation: string): number {
    let rolledBack = 0;
    
    for (const [id, context] of this.contexts.entries()) {
      if (context.operation === operation) {
        this.rollback(id);
        rolledBack++;
      }
    }
    
    return rolledBack;
  }

  /**
   * Clear successful contexts (called after successful mutation)
   */
  clearContext(contextId: string): void {
    this.contexts.delete(contextId);
  }

  /**
   * Clear old contexts (older than specified time)
   */
  clearOldContexts(maxAge: number = 5 * 60 * 1000): number {
    const now = Date.now();
    let cleared = 0;
    
    for (const [id, context] of this.contexts.entries()) {
      if (now - context.timestamp > maxAge) {
        this.contexts.delete(id);
        cleared++;
      }
    }
    
    return cleared;
  }

  /**
   * Get all active contexts
   */
  getActiveContexts(): RollbackContext[] {
    return Array.from(this.contexts.values());
  }

  /**
   * Get contexts for a specific query key
   */
  getContextsForQuery(queryKey: readonly unknown[]): RollbackContext[] {
    return Array.from(this.contexts.values()).filter(context =>
      this.areQueryKeysEqual(context.queryKey, queryKey)
    );
  }

  /**
   * Helper to compare query keys
   */
  private areQueryKeysEqual(key1: readonly unknown[], key2: readonly unknown[]): boolean {
    if (key1.length !== key2.length) return false;
    return key1.every((item, index) => item === key2[index]);
  }
}

/**
 * Hook for using rollback manager
 */
export const useRollbackManager = () => {
  const queryClient = useQueryClient();
  const managerRef = useRef<RollbackManager>();

  if (!managerRef.current) {
    managerRef.current = new RollbackManager(queryClient);
  }

  const createRollbackContext = useCallback((
    operation: string,
    queryKey: readonly unknown[],
    metadata?: Record<string, any>
  ) => {
    return managerRef.current!.createContext(operation, queryKey, metadata);
  }, []);

  const rollback = useCallback((contextId: string) => {
    return managerRef.current!.rollback(contextId);
  }, []);

  const rollbackQuery = useCallback((queryKey: readonly unknown[]) => {
    return managerRef.current!.rollbackQuery(queryKey);
  }, []);

  const rollbackOperation = useCallback((operation: string) => {
    return managerRef.current!.rollbackOperation(operation);
  }, []);

  const clearContext = useCallback((contextId: string) => {
    managerRef.current!.clearContext(contextId);
  }, []);

  const clearOldContexts = useCallback((maxAge?: number) => {
    return managerRef.current!.clearOldContexts(maxAge);
  }, []);

  const getActiveContexts = useCallback(() => {
    return managerRef.current!.getActiveContexts();
  }, []);

  return {
    createRollbackContext,
    rollback,
    rollbackQuery,
    rollbackOperation,
    clearContext,
    clearOldContexts,
    getActiveContexts,
  };
};

/**
 * Enhanced optimistic mutation with rollback support
 */
export const useOptimisticMutationWithRollback = <TData, TError, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: {
    queryKey: readonly unknown[];
    operation: string;
    generateOptimisticData: (variables: TVariables, currentData?: TData) => TData;
    onSuccess?: (data: TData, variables: TVariables, contextId: string) => void;
    onError?: (error: TError, variables: TVariables, contextId: string) => void;
    onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, contextId: string) => void;
  }
) => {
  const queryClient = useQueryClient();
  const { createRollbackContext, rollback, clearContext } = useRollbackManager();

  return {
    mutationFn,
    onMutate: async (variables: TVariables) => {
      // Create rollback context
      const rollbackContext = createRollbackContext(config.operation, config.queryKey, { variables });

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: config.queryKey });

      // Get current data for optimistic update
      const currentData = queryClient.getQueryData<TData>(config.queryKey);

      // Apply optimistic update
      const optimisticData = config.generateOptimisticData(variables, currentData);
      queryClient.setQueryData(config.queryKey, optimisticData);

      return { rollbackContextId: rollbackContext.id };
    },
    onError: (error: TError, variables: TVariables, context: any) => {
      // Perform rollback
      if (context?.rollbackContextId) {
        rollback(context.rollbackContextId);
      }

      // Call custom error handler
      config.onError?.(error, variables, context?.rollbackContextId);
    },
    onSuccess: (data: TData, variables: TVariables, context: any) => {
      // Clear rollback context on success
      if (context?.rollbackContextId) {
        clearContext(context.rollbackContextId);
      }

      // Call custom success handler
      config.onSuccess?.(data, variables, context?.rollbackContextId);
    },
    onSettled: (data: TData | undefined, error: TError | null, variables: TVariables, context: any) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: config.queryKey });

      // Call custom settled handler
      config.onSettled?.(data, error, variables, context?.rollbackContextId);
    },
  };
};

/**
 * Batch rollback manager for handling multiple related operations
 */
export class BatchRollbackManager {
  private batches: Map<string, string[]> = new Map();
  private rollbackManager: RollbackManager;

  constructor(rollbackManager: RollbackManager) {
    this.rollbackManager = rollbackManager;
  }

  /**
   * Create a new batch
   */
  createBatch(): string {
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.batches.set(batchId, []);
    return batchId;
  }

  /**
   * Add context to batch
   */
  addToBatch(batchId: string, contextId: string): void {
    const batch = this.batches.get(batchId);
    if (batch) {
      batch.push(contextId);
    }
  }

  /**
   * Rollback entire batch
   */
  rollbackBatch(batchId: string): number {
    const batch = this.batches.get(batchId);
    if (!batch) return 0;

    let rolledBack = 0;
    for (const contextId of batch) {
      if (this.rollbackManager.rollback(contextId)) {
        rolledBack++;
      }
    }

    this.batches.delete(batchId);
    return rolledBack;
  }

  /**
   * Clear successful batch
   */
  clearBatch(batchId: string): void {
    const batch = this.batches.get(batchId);
    if (batch) {
      for (const contextId of batch) {
        this.rollbackManager.clearContext(contextId);
      }
      this.batches.delete(batchId);
    }
  }
}

/**
 * Hook for batch rollback operations
 */
export const useBatchRollback = () => {
  const { createRollbackContext, rollback, clearContext } = useRollbackManager();
  const batchManagerRef = useRef<BatchRollbackManager>();

  if (!batchManagerRef.current) {
    batchManagerRef.current = new BatchRollbackManager({
      rollback,
      clearContext,
    } as any);
  }

  return {
    createBatch: () => batchManagerRef.current!.createBatch(),
    addToBatch: (batchId: string, contextId: string) => 
      batchManagerRef.current!.addToBatch(batchId, contextId),
    rollbackBatch: (batchId: string) => 
      batchManagerRef.current!.rollbackBatch(batchId),
    clearBatch: (batchId: string) => 
      batchManagerRef.current!.clearBatch(batchId),
    createRollbackContext,
  };
};