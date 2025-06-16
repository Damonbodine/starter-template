/**
 * Cache Strategies
 * Different caching strategies for various use cases
 */

import { useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Cache strategy types
 */
export enum CacheStrategy {
  CACHE_FIRST = 'cache-first',           // Use cache if available, network if not
  NETWORK_FIRST = 'network-first',       // Always try network first, fallback to cache
  CACHE_ONLY = 'cache-only',             // Only use cache, never network
  NETWORK_ONLY = 'network-only',         // Only use network, never cache
  STALE_WHILE_REVALIDATE = 'swr',        // Return cache immediately, update in background
}

/**
 * Cache timing configurations
 */
export const cacheTimings = {
  // Real-time data (user interactions, notifications)
  realTime: {
    staleTime: 0,
    gcTime: 1000 * 60, // 1 minute
  },
  
  // Fast data (frequently changing)
  fast: {
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  },
  
  // Normal data (moderately changing)
  normal: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  },
  
  // Slow data (rarely changing)
  slow: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  },
  
  // Static data (very rarely changing)
  static: {
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  },
  
  // Infinite data (basically never stale)
  infinite: {
    staleTime: Infinity,
    gcTime: Infinity,
  },
} as const;

/**
 * Create cache strategy configuration
 */
export function createCacheStrategy<TData>(
  strategy: CacheStrategy,
  timing: keyof typeof cacheTimings = 'normal'
): Partial<UseQueryOptions<TData>> {
  const baseConfig = cacheTimings[timing];

  switch (strategy) {
    case CacheStrategy.CACHE_FIRST:
      return {
        ...baseConfig,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        networkMode: 'offlineFirst',
      };

    case CacheStrategy.NETWORK_FIRST:
      return {
        ...baseConfig,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        networkMode: 'online',
      };

    case CacheStrategy.CACHE_ONLY:
      return {
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        networkMode: 'always',
        retry: false,
      };

    case CacheStrategy.NETWORK_ONLY:
      return {
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        networkMode: 'online',
      };

    case CacheStrategy.STALE_WHILE_REVALIDATE:
      return {
        ...baseConfig,
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        networkMode: 'offlineFirst',
      };

    default:
      return baseConfig;
  }
}

/**
 * Cache strategy patterns for common data types
 */
export const cachePatterns = {
  // User data - moderately changing, important to keep fresh
  userData: createCacheStrategy(CacheStrategy.STALE_WHILE_REVALIDATE, 'normal'),
  
  // Settings - rarely changing, can be cached aggressively
  settings: createCacheStrategy(CacheStrategy.CACHE_FIRST, 'slow'),
  
  // Notifications - real-time, always fetch fresh
  notifications: createCacheStrategy(CacheStrategy.NETWORK_FIRST, 'realTime'),
  
  // Static content - rarely changing, cache heavily
  staticContent: createCacheStrategy(CacheStrategy.CACHE_FIRST, 'static'),
  
  // Search results - should be fresh for better UX
  searchResults: createCacheStrategy(CacheStrategy.NETWORK_FIRST, 'fast'),
  
  // Lists with frequent updates
  lists: createCacheStrategy(CacheStrategy.STALE_WHILE_REVALIDATE, 'fast'),
  
  // Detail views - balance between freshness and performance
  details: createCacheStrategy(CacheStrategy.STALE_WHILE_REVALIDATE, 'normal'),
  
  // Analytics data - can be slightly stale
  analytics: createCacheStrategy(CacheStrategy.CACHE_FIRST, 'slow'),
};

/**
 * Hook for dynamic cache strategy selection
 */
export const useCacheStrategy = () => {
  const queryClient = useQueryClient();

  const applyCacheStrategy = useCallback((
    queryKey: readonly unknown[],
    strategy: CacheStrategy,
    timing: keyof typeof cacheTimings = 'normal'
  ) => {
    const config = createCacheStrategy(strategy, timing);
    
    // Apply to existing queries
    queryClient.setQueryDefaults(queryKey, config);
    
    return config;
  }, [queryClient]);

  const getCacheStrategy = useCallback((
    dataType: 'user' | 'settings' | 'notifications' | 'static' | 'search' | 'lists' | 'details' | 'analytics'
  ) => {
    switch (dataType) {
      case 'user': return cachePatterns.userData;
      case 'settings': return cachePatterns.settings;
      case 'notifications': return cachePatterns.notifications;
      case 'static': return cachePatterns.staticContent;
      case 'search': return cachePatterns.searchResults;
      case 'lists': return cachePatterns.lists;
      case 'details': return cachePatterns.details;
      case 'analytics': return cachePatterns.analytics;
      default: return cachePatterns.details;
    }
  }, []);

  return {
    applyCacheStrategy,
    getCacheStrategy,
    createCacheStrategy,
  };
};

/**
 * Cache warming utilities
 */
export const cacheWarmingStrategies = {
  /**
   * Prefetch related data
   */
  prefetchRelated: async (
    queryClient: any,
    baseQueryKey: readonly unknown[],
    relatedQueries: Array<{
      queryKey: readonly unknown[];
      queryFn: () => Promise<any>;
      priority?: 'high' | 'low';
    }>
  ) => {
    const prefetchPromises = relatedQueries.map(({ queryKey, queryFn, priority = 'low' }) => {
      if (priority === 'high') {
        return queryClient.prefetchQuery({ queryKey, queryFn });
      } else {
        // Use requestIdleCallback for low priority prefetching
        return new Promise(resolve => {
          if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => {
              queryClient.prefetchQuery({ queryKey, queryFn }).then(resolve);
            });
          } else {
            setTimeout(() => {
              queryClient.prefetchQuery({ queryKey, queryFn }).then(resolve);
            }, 0);
          }
        });
      }
    });

    await Promise.allSettled(prefetchPromises);
  },

  /**
   * Intelligent prefetching based on user behavior
   */
  intelligentPrefetch: {
    // Prefetch on hover (for links/buttons)
    onHover: (queryKey: readonly unknown[], queryFn: () => Promise<any>) => {
      return {
        onMouseEnter: () => {
          // Debounce to avoid excessive prefetching
          setTimeout(() => {
            const queryClient = useQueryClient();
            queryClient.prefetchQuery({ queryKey, queryFn });
          }, 100);
        },
      };
    },

    // Prefetch on focus (for forms/inputs)
    onFocus: (queryKey: readonly unknown[], queryFn: () => Promise<any>) => {
      return {
        onFocus: () => {
          const queryClient = useQueryClient();
          queryClient.prefetchQuery({ queryKey, queryFn });
        },
      };
    },

    // Prefetch on scroll into viewport
    onIntersection: (
      queryKey: readonly unknown[], 
      queryFn: () => Promise<any>,
      threshold = 0.5
    ) => {
      return {
        ref: (element: HTMLElement | null) => {
          if (!element) return;

          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  const queryClient = useQueryClient();
                  queryClient.prefetchQuery({ queryKey, queryFn });
                  observer.unobserve(element);
                }
              });
            },
            { threshold }
          );

          observer.observe(element);
          
          return () => observer.disconnect();
        },
      };
    },
  },
};

/**
 * Cache performance monitoring
 */
export class CachePerformanceMonitor {
  private metrics: Map<string, {
    hits: number;
    misses: number;
    totalQueries: number;
    avgResponseTime: number;
    lastAccessed: Date;
  }> = new Map();

  recordCacheHit(queryKey: string, responseTime: number): void {
    const existing = this.metrics.get(queryKey) || {
      hits: 0,
      misses: 0,
      totalQueries: 0,
      avgResponseTime: 0,
      lastAccessed: new Date(),
    };

    existing.hits++;
    existing.totalQueries++;
    existing.avgResponseTime = 
      (existing.avgResponseTime * (existing.totalQueries - 1) + responseTime) / existing.totalQueries;
    existing.lastAccessed = new Date();

    this.metrics.set(queryKey, existing);
  }

  recordCacheMiss(queryKey: string, responseTime: number): void {
    const existing = this.metrics.get(queryKey) || {
      hits: 0,
      misses: 0,
      totalQueries: 0,
      avgResponseTime: 0,
      lastAccessed: new Date(),
    };

    existing.misses++;
    existing.totalQueries++;
    existing.avgResponseTime = 
      (existing.avgResponseTime * (existing.totalQueries - 1) + responseTime) / existing.totalQueries;
    existing.lastAccessed = new Date();

    this.metrics.set(queryKey, existing);
  }

  getCacheStats(queryKey?: string) {
    if (queryKey) {
      const stats = this.metrics.get(queryKey);
      if (!stats) return null;

      return {
        ...stats,
        hitRate: stats.hits / stats.totalQueries,
        missRate: stats.misses / stats.totalQueries,
      };
    }

    // Return aggregate stats
    let totalHits = 0;
    let totalMisses = 0;
    let totalQueries = 0;
    let totalResponseTime = 0;

    for (const stats of this.metrics.values()) {
      totalHits += stats.hits;
      totalMisses += stats.misses;
      totalQueries += stats.totalQueries;
      totalResponseTime += stats.avgResponseTime * stats.totalQueries;
    }

    return {
      totalHits,
      totalMisses,
      totalQueries,
      hitRate: totalQueries > 0 ? totalHits / totalQueries : 0,
      missRate: totalQueries > 0 ? totalMisses / totalQueries : 0,
      avgResponseTime: totalQueries > 0 ? totalResponseTime / totalQueries : 0,
    };
  }

  getTopPerformers(limit = 10) {
    return Array.from(this.metrics.entries())
      .map(([queryKey, stats]) => ({
        queryKey,
        ...stats,
        hitRate: stats.hits / stats.totalQueries,
      }))
      .sort((a, b) => b.hitRate - a.hitRate)
      .slice(0, limit);
  }

  getPoorPerformers(limit = 10) {
    return Array.from(this.metrics.entries())
      .map(([queryKey, stats]) => ({
        queryKey,
        ...stats,
        hitRate: stats.hits / stats.totalQueries,
      }))
      .sort((a, b) => a.hitRate - b.hitRate)
      .slice(0, limit);
  }
}