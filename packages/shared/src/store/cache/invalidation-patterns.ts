/**
 * Cache Invalidation Patterns
 * Smart cache invalidation strategies and patterns
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { queryKeys } from '../query-client';

/**
 * Invalidation strategies
 */
export enum InvalidationStrategy {
  IMMEDIATE = 'immediate',           // Invalidate immediately
  DEBOUNCED = 'debounced',          // Invalidate after delay
  BATCHED = 'batched',              // Batch multiple invalidations
  SCHEDULED = 'scheduled',          // Invalidate at specific times
  ON_FOCUS = 'on-focus',            // Invalidate when window gains focus
  ON_ONLINE = 'on-online',          // Invalidate when coming back online
  SMART = 'smart',                  // Intelligent invalidation based on data relationships
}

/**
 * Invalidation context for tracking relationships
 */
interface InvalidationContext {
  trigger: string;
  affectedQueries: readonly unknown[][];
  timestamp: Date;
  reason: string;
}

/**
 * Smart invalidation manager
 */
export class InvalidationManager {
  private queryClient: any;
  private relationships: Map<string, Set<string>> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private batchQueue: Set<readonly unknown[]> = new Set();
  private batchTimer: NodeJS.Timeout | null = null;
  private invalidationHistory: InvalidationContext[] = [];

  constructor(queryClient: any) {
    this.queryClient = queryClient;
    this.setupEventListeners();
  }

  /**
   * Register relationship between queries
   */
  registerRelationship(parentKey: string, childKey: string): void {
    if (!this.relationships.has(parentKey)) {
      this.relationships.set(parentKey, new Set());
    }
    this.relationships.get(parentKey)!.add(childKey);
  }

  /**
   * Register multiple relationships
   */
  registerRelationships(relationships: Record<string, string[]>): void {
    Object.entries(relationships).forEach(([parent, children]) => {
      children.forEach(child => this.registerRelationship(parent, child));
    });
  }

  /**
   * Immediate invalidation
   */
  async invalidateImmediate(
    queryKey: readonly unknown[],
    options?: { exact?: boolean; refetchType?: 'active' | 'all' | 'none' }
  ): Promise<void> {
    const { exact = false, refetchType = 'active' } = options || {};

    await this.queryClient.invalidateQueries({
      queryKey,
      exact,
      refetchType,
    });

    this.recordInvalidation('immediate', [queryKey], 'Manual immediate invalidation');
  }

  /**
   * Debounced invalidation
   */
  invalidateDebounced(
    queryKey: readonly unknown[],
    delay: number = 1000,
    options?: { exact?: boolean }
  ): void {
    const keyString = JSON.stringify(queryKey);
    
    // Clear existing timer
    if (this.debounceTimers.has(keyString)) {
      clearTimeout(this.debounceTimers.get(keyString)!);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      await this.invalidateImmediate(queryKey, options);
      this.debounceTimers.delete(keyString);
    }, delay);

    this.debounceTimers.set(keyString, timer);
  }

  /**
   * Batched invalidation
   */
  invalidateBatched(queryKey: readonly unknown[], batchDelay: number = 100): void {
    this.batchQueue.add(queryKey);

    if (!this.batchTimer) {
      this.batchTimer = setTimeout(async () => {
        const queries = Array.from(this.batchQueue);
        this.batchQueue.clear();
        this.batchTimer = null;

        // Invalidate all queued queries
        await Promise.all(
          queries.map(key => this.queryClient.invalidateQueries({ queryKey: key }))
        );

        this.recordInvalidation('batched', queries, 'Batched invalidation');
      }, batchDelay);
    }
  }

  /**
   * Smart invalidation with relationship tracking
   */
  async invalidateSmart(
    triggerKey: readonly unknown[],
    options?: { maxDepth?: number; includeParents?: boolean }
  ): Promise<void> {
    const { maxDepth = 3, includeParents = false } = options || {};
    const invalidated = new Set<string>();
    const toInvalidate: readonly unknown[][] = [triggerKey];

    // Find related queries using BFS
    const queue: Array<{ key: string; depth: number }> = [
      { key: JSON.stringify(triggerKey), depth: 0 }
    ];

    while (queue.length > 0 && queue[0].depth < maxDepth) {
      const { key, depth } = queue.shift()!;
      
      if (invalidated.has(key)) continue;
      invalidated.add(key);

      const related = this.relationships.get(key);
      if (related) {
        related.forEach(relatedKey => {
          if (!invalidated.has(relatedKey)) {
            queue.push({ key: relatedKey, depth: depth + 1 });
            try {
              toInvalidate.push(JSON.parse(relatedKey));
            } catch {
              // Skip invalid JSON keys
            }
          }
        });
      }

      // Also check reverse relationships if includeParents is true
      if (includeParents) {
        this.relationships.forEach((children, parent) => {
          if (children.has(key) && !invalidated.has(parent)) {
            queue.push({ key: parent, depth: depth + 1 });
            try {
              toInvalidate.push(JSON.parse(parent));
            } catch {
              // Skip invalid JSON keys
            }
          }
        });
      }
    }

    // Invalidate all related queries
    await Promise.all(
      toInvalidate.map(key => this.queryClient.invalidateQueries({ queryKey: key }))
    );

    this.recordInvalidation('smart', toInvalidate, 'Smart invalidation with relationships');
  }

  /**
   * Scheduled invalidation
   */
  scheduleInvalidation(
    queryKey: readonly unknown[],
    schedule: Date | number,
    options?: { exact?: boolean }
  ): () => void {
    const delay = typeof schedule === 'number' ? schedule : schedule.getTime() - Date.now();
    
    if (delay <= 0) {
      this.invalidateImmediate(queryKey, options);
      return () => {};
    }

    const timer = setTimeout(() => {
      this.invalidateImmediate(queryKey, options);
    }, delay);

    return () => clearTimeout(timer);
  }

  /**
   * Conditional invalidation
   */
  async invalidateConditional(
    queryKey: readonly unknown[],
    condition: () => boolean | Promise<boolean>,
    options?: { exact?: boolean }
  ): Promise<boolean> {
    const shouldInvalidate = await condition();
    
    if (shouldInvalidate) {
      await this.invalidateImmediate(queryKey, options);
      return true;
    }
    
    return false;
  }

  /**
   * Setup event listeners for automatic invalidation
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Invalidate on window focus
    window.addEventListener('focus', () => {
      this.queryClient.invalidateQueries({
        refetchType: 'active',
        stale: true,
      });
    });

    // Invalidate on network reconnection
    window.addEventListener('online', () => {
      this.queryClient.invalidateQueries({
        refetchType: 'active',
      });
    });

    // Invalidate on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.queryClient.invalidateQueries({
          refetchType: 'active',
          stale: true,
        });
      }
    });
  }

  /**
   * Record invalidation for debugging/analytics
   */
  private recordInvalidation(
    trigger: string,
    affectedQueries: readonly unknown[][],
    reason: string
  ): void {
    this.invalidationHistory.push({
      trigger,
      affectedQueries,
      timestamp: new Date(),
      reason,
    });

    // Keep only last 100 invalidations
    if (this.invalidationHistory.length > 100) {
      this.invalidationHistory = this.invalidationHistory.slice(-100);
    }
  }

  /**
   * Get invalidation history
   */
  getInvalidationHistory(): InvalidationContext[] {
    return this.invalidationHistory;
  }

  /**
   * Clear all pending invalidations
   */
  clearPending(): void {
    // Clear debounce timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();

    // Clear batch timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    this.batchQueue.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const queries = this.queryClient.getQueryCache().getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter((q: any) => q.isStale()).length,
      invalidQueries: queries.filter((q: any) => q.isInvalidated()).length,
      fetchingQueries: queries.filter((q: any) => q.isFetching()).length,
      cachedQueries: queries.filter((q: any) => q.state.data !== undefined).length,
    };
  }
}

/**
 * Hook for using invalidation manager
 */
export const useInvalidation = () => {
  const queryClient = useQueryClient();
  const managerRef = useRef<InvalidationManager>();

  if (!managerRef.current) {
    managerRef.current = new InvalidationManager(queryClient);
  }

  const invalidate = useCallback(async (
    queryKey: readonly unknown[],
    strategy: InvalidationStrategy = InvalidationStrategy.IMMEDIATE,
    options?: any
  ) => {
    const manager = managerRef.current!;

    switch (strategy) {
      case InvalidationStrategy.IMMEDIATE:
        return manager.invalidateImmediate(queryKey, options);
        
      case InvalidationStrategy.DEBOUNCED:
        return manager.invalidateDebounced(queryKey, options?.delay, options);
        
      case InvalidationStrategy.BATCHED:
        return manager.invalidateBatched(queryKey, options?.batchDelay);
        
      case InvalidationStrategy.SCHEDULED:
        return manager.scheduleInvalidation(queryKey, options?.schedule, options);
        
      case InvalidationStrategy.SMART:
        return manager.invalidateSmart(queryKey, options);
        
      default:
        return manager.invalidateImmediate(queryKey, options);
    }
  }, []);

  return {
    invalidate,
    registerRelationship: (parent: string, child: string) => 
      managerRef.current!.registerRelationship(parent, child),
    registerRelationships: (relationships: Record<string, string[]>) => 
      managerRef.current!.registerRelationships(relationships),
    invalidateConditional: (queryKey: readonly unknown[], condition: () => boolean | Promise<boolean>, options?: any) =>
      managerRef.current!.invalidateConditional(queryKey, condition, options),
    getHistory: () => managerRef.current!.getInvalidationHistory(),
    getCacheStats: () => managerRef.current!.getCacheStats(),
    clearPending: () => managerRef.current!.clearPending(),
  };
};

/**
 * Predefined invalidation patterns
 */
export const invalidationPatterns = {
  /**
   * User data invalidation pattern
   */
  userData: {
    onProfileUpdate: (userId: string) => [
      queryKeys.users.detail(userId),
      queryKeys.users.profile(userId),
      queryKeys.users.lists(),
    ],
    
    onPermissionChange: (userId: string) => [
      queryKeys.users.permissions(userId),
      queryKeys.users.detail(userId),
    ],
  },

  /**
   * Post data invalidation pattern
   */
  postData: {
    onCreate: () => [
      queryKeys.posts.lists(),
    ],
    
    onUpdate: (postId: string) => [
      queryKeys.posts.detail(postId),
      queryKeys.posts.lists(),
    ],
    
    onDelete: (postId: string) => [
      queryKeys.posts.detail(postId),
      queryKeys.posts.lists(),
      queryKeys.posts.comments(postId),
    ],
    
    onComment: (postId: string) => [
      queryKeys.posts.comments(postId),
      queryKeys.posts.detail(postId), // May have comment count
    ],
  },

  /**
   * Settings invalidation pattern
   */
  settings: {
    onUpdate: (userId: string) => [
      queryKeys.settings.user(userId),
      queryKeys.settings.app(),
    ],
  },

  /**
   * Notification invalidation pattern
   */
  notifications: {
    onRead: () => [
      queryKeys.notifications.lists(),
      queryKeys.notifications.unread(),
      queryKeys.notifications.count(),
    ],
    
    onNew: () => [
      queryKeys.notifications.lists(),
      queryKeys.notifications.unread(),
      queryKeys.notifications.count(),
    ],
  },
};

/**
 * Hook for setting up automatic invalidation patterns
 */
export const useInvalidationPatterns = () => {
  const { registerRelationships } = useInvalidation();

  useEffect(() => {
    // Register common relationships
    registerRelationships({
      // User relationships
      [JSON.stringify(queryKeys.users.all)]: [
        JSON.stringify(queryKeys.users.lists()),
      ],
      
      // Post relationships
      [JSON.stringify(queryKeys.posts.all)]: [
        JSON.stringify(queryKeys.posts.lists()),
      ],
      
      // Settings relationships
      [JSON.stringify(queryKeys.settings.all)]: [
        JSON.stringify(queryKeys.settings.app()),
      ],
    });
  }, [registerRelationships]);
};

/**
 * Cache invalidation utilities
 */
export const invalidationUtils = {
  /**
   * Invalidate by pattern
   */
  invalidateByPattern: async (
    queryClient: any,
    pattern: RegExp,
    options?: { exact?: boolean }
  ) => {
    const queries = queryClient.getQueryCache().getAll();
    const matchingQueries = queries.filter((query: any) => 
      pattern.test(JSON.stringify(query.queryKey))
    );

    await Promise.all(
      matchingQueries.map((query: any) => 
        queryClient.invalidateQueries({ 
          queryKey: query.queryKey, 
          exact: options?.exact 
        })
      )
    );
  },

  /**
   * Invalidate stale queries only
   */
  invalidateStale: async (queryClient: any) => {
    await queryClient.invalidateQueries({
      stale: true,
      refetchType: 'active',
    });
  },

  /**
   * Selective invalidation based on data changes
   */
  invalidateSelective: async (
    queryClient: any,
    dataChanges: Record<string, any>,
    mappings: Record<string, readonly unknown[][]>
  ) => {
    const queriesToInvalidate = new Set<readonly unknown[]>();

    Object.keys(dataChanges).forEach(changeType => {
      const queries = mappings[changeType];
      if (queries) {
        queries.forEach(queryKey => queriesToInvalidate.add(queryKey));
      }
    });

    await Promise.all(
      Array.from(queriesToInvalidate).map(queryKey => 
        queryClient.invalidateQueries({ queryKey })
      )
    );
  },
};