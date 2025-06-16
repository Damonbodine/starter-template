/**
 * Cache Warming
 * Strategies for preloading and warming cache data
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { queryKeys } from '../query-client';

/**
 * Cache warming strategies
 */
export enum WarmingStrategy {
  IMMEDIATE = 'immediate',           // Warm cache immediately
  IDLE = 'idle',                    // Warm during browser idle time
  INTERSECTION = 'intersection',     // Warm when element enters viewport
  HOVER = 'hover',                  // Warm on mouse hover
  ROUTE_CHANGE = 'route-change',    // Warm on route transitions
  SCHEDULED = 'scheduled',          // Warm at scheduled intervals
  PREDICTIVE = 'predictive',        // Warm based on user behavior patterns
}

/**
 * Cache warming configuration
 */
interface WarmingConfig {
  strategy: WarmingStrategy;
  priority: 'high' | 'medium' | 'low';
  delay?: number;
  threshold?: number;
  conditions?: () => boolean;
}

/**
 * User behavior tracker for predictive warming
 */
class UserBehaviorTracker {
  private patterns: Map<string, {
    transitions: Map<string, number>;
    frequency: number;
    lastAccessed: Date;
  }> = new Map();

  recordPageView(page: string, previousPage?: string): void {
    if (!this.patterns.has(page)) {
      this.patterns.set(page, {
        transitions: new Map(),
        frequency: 0,
        lastAccessed: new Date(),
      });
    }

    const pattern = this.patterns.get(page)!;
    pattern.frequency++;
    pattern.lastAccessed = new Date();

    if (previousPage) {
      pattern.transitions.set(
        previousPage,
        (pattern.transitions.get(previousPage) || 0) + 1
      );
    }
  }

  getPredictedPages(currentPage: string, limit = 5): string[] {
    const pattern = this.patterns.get(currentPage);
    if (!pattern) return [];

    return Array.from(pattern.transitions.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([page]) => page);
  }

  getFrequentPages(limit = 10): string[] {
    return Array.from(this.patterns.entries())
      .sort(([, a], [, b]) => b.frequency - a.frequency)
      .slice(0, limit)
      .map(([page]) => page);
  }

  shouldWarmCache(page: string): boolean {
    const pattern = this.patterns.get(page);
    if (!pattern) return false;

    // Warm if frequently accessed or recently accessed
    const isFrequent = pattern.frequency > 5;
    const isRecent = Date.now() - pattern.lastAccessed.getTime() < 1000 * 60 * 30; // 30 minutes

    return isFrequent || isRecent;
  }
}

/**
 * Cache warming manager
 */
export class CacheWarmingManager {
  private queryClient: any;
  private behaviorTracker = new UserBehaviorTracker();
  private warmingQueue: Array<{
    queryKey: readonly unknown[];
    queryFn: () => Promise<any>;
    config: WarmingConfig;
  }> = [];
  private isWarming = false;

  constructor(queryClient: any) {
    this.queryClient = queryClient;
    this.setupIdleWarming();
  }

  /**
   * Add query to warming queue
   */
  addToWarmingQueue(
    queryKey: readonly unknown[],
    queryFn: () => Promise<any>,
    config: WarmingConfig
  ): void {
    // Check if already in cache and fresh
    const existingQuery = this.queryClient.getQueryData(queryKey);
    if (existingQuery) return;

    // Check conditions
    if (config.conditions && !config.conditions()) return;

    this.warmingQueue.push({ queryKey, queryFn, config });
    this.processWarmingQueue();
  }

  /**
   * Immediate cache warming
   */
  async warmImmediate(
    queryKey: readonly unknown[],
    queryFn: () => Promise<any>
  ): Promise<void> {
    try {
      await this.queryClient.prefetchQuery({
        queryKey,
        queryFn,
      });
    } catch (error) {
      console.warn('Cache warming failed:', error);
    }
  }

  /**
   * Warm cache during idle time
   */
  warmDuringIdle(
    queryKey: readonly unknown[],
    queryFn: () => Promise<any>,
    options?: { timeout?: number }
  ): void {
    const { timeout = 1000 } = options || {};

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(
        () => this.warmImmediate(queryKey, queryFn),
        { timeout }
      );
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => this.warmImmediate(queryKey, queryFn), 0);
    }
  }

  /**
   * Warm cache on intersection
   */
  createIntersectionWarmer(
    queryKey: readonly unknown[],
    queryFn: () => Promise<any>,
    options?: { threshold?: number; rootMargin?: string }
  ) {
    const { threshold = 0.1, rootMargin = '50px' } = options || {};

    return (element: HTMLElement | null) => {
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.warmImmediate(queryKey, queryFn);
              observer.unobserve(element);
            }
          });
        },
        { threshold, rootMargin }
      );

      observer.observe(element);
      return () => observer.disconnect();
    };
  }

  /**
   * Warm cache on hover
   */
  createHoverWarmer(
    queryKey: readonly unknown[],
    queryFn: () => Promise<any>,
    delay = 100
  ) {
    let timeoutId: NodeJS.Timeout;

    return {
      onMouseEnter: () => {
        timeoutId = setTimeout(() => {
          this.warmImmediate(queryKey, queryFn);
        }, delay);
      },
      onMouseLeave: () => {
        if (timeoutId) clearTimeout(timeoutId);
      },
    };
  }

  /**
   * Predictive cache warming based on user behavior
   */
  warmPredictive(currentPage: string): void {
    const predictedPages = this.behaviorTracker.getPredictedPages(currentPage);
    
    predictedPages.forEach((page) => {
      // Map pages to query keys (this would be app-specific)
      const queryKey = this.mapPageToQueryKey(page);
      if (queryKey) {
        this.warmDuringIdle(queryKey, () => this.fetchPageData(page));
      }
    });
  }

  /**
   * Warm related data based on current data
   */
  warmRelated(
    baseQueryKey: readonly unknown[],
    getRelatedQueries: (data: any) => Array<{
      queryKey: readonly unknown[];
      queryFn: () => Promise<any>;
    }>
  ): void {
    const baseData = this.queryClient.getQueryData(baseQueryKey);
    if (!baseData) return;

    const relatedQueries = getRelatedQueries(baseData);
    relatedQueries.forEach(({ queryKey, queryFn }) => {
      this.warmDuringIdle(queryKey, queryFn);
    });
  }

  /**
   * Batch warm multiple queries
   */
  async warmBatch(
    queries: Array<{
      queryKey: readonly unknown[];
      queryFn: () => Promise<any>;
      priority?: 'high' | 'medium' | 'low';
    }>,
    options?: { concurrency?: number; delay?: number }
  ): Promise<void> {
    const { concurrency = 3, delay = 100 } = options || {};

    // Sort by priority
    const sortedQueries = queries.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium'];
    });

    // Process in batches
    for (let i = 0; i < sortedQueries.length; i += concurrency) {
      const batch = sortedQueries.slice(i, i + concurrency);
      
      await Promise.allSettled(
        batch.map(({ queryKey, queryFn }) => 
          this.warmImmediate(queryKey, queryFn)
        )
      );

      // Delay between batches to avoid overwhelming the server
      if (i + concurrency < sortedQueries.length && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Process warming queue
   */
  private async processWarmingQueue(): Promise<void> {
    if (this.isWarming || this.warmingQueue.length === 0) return;

    this.isWarming = true;

    while (this.warmingQueue.length > 0) {
      const item = this.warmingQueue.shift()!;
      const { queryKey, queryFn, config } = item;

      try {
        switch (config.strategy) {
          case WarmingStrategy.IMMEDIATE:
            await this.warmImmediate(queryKey, queryFn);
            break;
            
          case WarmingStrategy.IDLE:
            this.warmDuringIdle(queryKey, queryFn);
            break;
            
          case WarmingStrategy.SCHEDULED:
            if (config.delay) {
              setTimeout(() => this.warmImmediate(queryKey, queryFn), config.delay);
            }
            break;
        }

        // Add delay between items based on priority
        const delay = config.priority === 'high' ? 50 : config.priority === 'medium' ? 100 : 200;
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error) {
        console.warn('Cache warming failed for', queryKey, error);
      }
    }

    this.isWarming = false;
  }

  /**
   * Setup idle warming
   */
  private setupIdleWarming(): void {
    if (typeof window === 'undefined') return;

    // Warm frequently accessed data during idle time
    const warmFrequentData = () => {
      const frequentPages = this.behaviorTracker.getFrequentPages(5);
      frequentPages.forEach(page => {
        const queryKey = this.mapPageToQueryKey(page);
        if (queryKey) {
          this.warmDuringIdle(queryKey, () => this.fetchPageData(page));
        }
      });
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(warmFrequentData, { timeout: 5000 });
    }
  }

  /**
   * Map page to query key (app-specific implementation)
   */
  private mapPageToQueryKey(page: string): readonly unknown[] | null {
    // This would be implemented based on your app's routing structure
    const pageMap: Record<string, readonly unknown[]> = {
      '/dashboard': queryKeys.users.profile('current'),
      '/posts': queryKeys.posts.lists(),
      '/notifications': queryKeys.notifications.lists(),
      // Add more mappings as needed
    };

    return pageMap[page] || null;
  }

  /**
   * Fetch page data (app-specific implementation)
   */
  private async fetchPageData(page: string): Promise<any> {
    // This would be implemented based on your app's data fetching logic
    return Promise.resolve({});
  }

  /**
   * Record page view for behavior tracking
   */
  recordPageView(page: string, previousPage?: string): void {
    this.behaviorTracker.recordPageView(page, previousPage);
  }
}

/**
 * Hook for cache warming
 */
export const useCacheWarming = () => {
  const queryClient = useQueryClient();
  const managerRef = useRef<CacheWarmingManager>();

  if (!managerRef.current) {
    managerRef.current = new CacheWarmingManager(queryClient);
  }

  const warmCache = useCallback((
    queryKey: readonly unknown[],
    queryFn: () => Promise<any>,
    strategy: WarmingStrategy = WarmingStrategy.IDLE,
    options?: Partial<WarmingConfig>
  ) => {
    const config: WarmingConfig = {
      strategy,
      priority: 'medium',
      ...options,
    };

    managerRef.current!.addToWarmingQueue(queryKey, queryFn, config);
  }, []);

  const warmImmediate = useCallback((
    queryKey: readonly unknown[],
    queryFn: () => Promise<any>
  ) => {
    return managerRef.current!.warmImmediate(queryKey, queryFn);
  }, []);

  const warmBatch = useCallback((
    queries: Array<{
      queryKey: readonly unknown[];
      queryFn: () => Promise<any>;
      priority?: 'high' | 'medium' | 'low';
    }>,
    options?: { concurrency?: number; delay?: number }
  ) => {
    return managerRef.current!.warmBatch(queries, options);
  }, []);

  const warmPredictive = useCallback((currentPage: string) => {
    managerRef.current!.warmPredictive(currentPage);
  }, []);

  const createIntersectionWarmer = useCallback((
    queryKey: readonly unknown[],
    queryFn: () => Promise<any>,
    options?: { threshold?: number; rootMargin?: string }
  ) => {
    return managerRef.current!.createIntersectionWarmer(queryKey, queryFn, options);
  }, []);

  const createHoverWarmer = useCallback((
    queryKey: readonly unknown[],
    queryFn: () => Promise<any>,
    delay?: number
  ) => {
    return managerRef.current!.createHoverWarmer(queryKey, queryFn, delay);
  }, []);

  const recordPageView = useCallback((page: string, previousPage?: string) => {
    managerRef.current!.recordPageView(page, previousPage);
  }, []);

  return {
    warmCache,
    warmImmediate,
    warmBatch,
    warmPredictive,
    createIntersectionWarmer,
    createHoverWarmer,
    recordPageView,
  };
};

/**
 * Predefined warming patterns
 */
export const warmingPatterns = {
  /**
   * User dashboard warming pattern
   */
  userDashboard: (userId: string) => [
    {
      queryKey: queryKeys.users.profile(userId),
      priority: 'high' as const,
    },
    {
      queryKey: queryKeys.notifications.unread(),
      priority: 'high' as const,
    },
    {
      queryKey: queryKeys.posts.lists(),
      priority: 'medium' as const,
    },
    {
      queryKey: queryKeys.settings.user(userId),
      priority: 'low' as const,
    },
  ],

  /**
   * Post detail warming pattern
   */
  postDetail: (postId: string) => [
    {
      queryKey: queryKeys.posts.detail(postId),
      priority: 'high' as const,
    },
    {
      queryKey: queryKeys.posts.comments(postId),
      priority: 'medium' as const,
    },
  ],

  /**
   * Navigation warming pattern
   */
  navigation: (currentPath: string) => {
    const pathMap: Record<string, Array<{ queryKey: readonly unknown[]; priority: 'high' | 'medium' | 'low' }>> = {
      '/dashboard': warmingPatterns.userDashboard('current'),
      '/posts': [
        { queryKey: queryKeys.posts.lists(), priority: 'high' },
      ],
      '/notifications': [
        { queryKey: queryKeys.notifications.lists(), priority: 'high' },
        { queryKey: queryKeys.notifications.unread(), priority: 'medium' },
      ],
    };

    return pathMap[currentPath] || [];
  },
};

/**
 * Hook for automatic warming based on route changes
 */
export const useRouteWarming = (currentRoute: string, previousRoute?: string) => {
  const { warmBatch, recordPageView } = useCacheWarming();

  useEffect(() => {
    // Record page view for behavior tracking
    recordPageView(currentRoute, previousRoute);

    // Warm cache for current route
    const pattern = warmingPatterns.navigation(currentRoute);
    if (pattern.length > 0) {
      // Convert pattern to queries (this would need actual query functions)
      const queries = pattern.map(({ queryKey, priority }) => ({
        queryKey,
        queryFn: () => Promise.resolve({}), // Replace with actual query function
        priority,
      }));

      warmBatch(queries, { concurrency: 2, delay: 200 });
    }
  }, [currentRoute, previousRoute, warmBatch, recordPageView]);
};