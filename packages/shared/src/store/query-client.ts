/**
 * TanStack Query Client Configuration
 * Centralized configuration for server state management
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

/**
 * Default query options for all queries
 */
const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Time in milliseconds that unused/inactive cache data remains in memory
    gcTime: 5 * 60 * 1000, // 5 minutes
    
    // Time in milliseconds that data is considered fresh
    staleTime: 30 * 1000, // 30 seconds
    
    // Refetch on window focus
    refetchOnWindowFocus: false,
    
    // Refetch on reconnect
    refetchOnReconnect: true,
    
    // Retry failed requests
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors except 408 (timeout)
      if (error?.status >= 400 && error?.status < 500 && error?.status !== 408) {
        return false;
      }
      // Retry up to 3 times with exponential backoff
      return failureCount < 3;
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    // Retry failed mutations once
    retry: 1,
    
    // Retry delay for mutations
    retryDelay: 1000,
  },
};

/**
 * Create a new QueryClient instance
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
    logger: {
      log: console.log,
      warn: console.warn,
      error: (error) => {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.error('QueryClient Error:', error);
        }
      },
    },
  });
}

/**
 * Default QueryClient instance
 */
export const queryClient = createQueryClient();

/**
 * Query keys factory for consistent cache keys
 */
export const queryKeys = {
  // User-related queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: (id: string) => [...queryKeys.users.detail(id), 'profile'] as const,
    permissions: (id: string) => [...queryKeys.users.detail(id), 'permissions'] as const,
  },
  
  // Post-related queries
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.posts.lists(), { filters }] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,
    comments: (postId: string) => [...queryKeys.posts.detail(postId), 'comments'] as const,
  },
  
  // Settings queries
  settings: {
    all: ['settings'] as const,
    user: (userId: string) => [...queryKeys.settings.all, 'user', userId] as const,
    app: () => [...queryKeys.settings.all, 'app'] as const,
  },
  
  // Notifications queries
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.notifications.lists(), { filters }] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    count: () => [...queryKeys.notifications.all, 'count'] as const,
  },
} as const;

/**
 * Cache invalidation utilities
 */
export const cacheUtils = {
  /**
   * Invalidate all user-related queries
   */
  invalidateUsers: () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  },
  
  /**
   * Invalidate specific user queries
   */
  invalidateUser: (userId: string) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
  },
  
  /**
   * Invalidate all post-related queries
   */
  invalidatePosts: () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
  },
  
  /**
   * Invalidate specific post queries
   */
  invalidatePost: (postId: string) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
  },
  
  /**
   * Invalidate notification queries
   */
  invalidateNotifications: () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  },
  
  /**
   * Remove all cached data
   */
  clearAll: () => {
    return queryClient.clear();
  },
  
  /**
   * Remove specific query from cache
   */
  removeQuery: (queryKey: readonly unknown[]) => {
    return queryClient.removeQueries({ queryKey });
  },
  
  /**
   * Prefetch query data
   */
  prefetchQuery: (queryKey: readonly unknown[], queryFn: () => Promise<any>) => {
    return queryClient.prefetchQuery({ queryKey, queryFn });
  },
  
  /**
   * Set query data manually
   */
  setQueryData: (queryKey: readonly unknown[], data: any) => {
    return queryClient.setQueryData(queryKey, data);
  },
  
  /**
   * Update query data with a function
   */
  setQueryDataOptimistic: (queryKey: readonly unknown[], updater: (oldData: any) => any) => {
    return queryClient.setQueryData(queryKey, updater);
  },
};

/**
 * Query client configuration for different environments
 */
export const queryClientConfig = {
  development: {
    ...defaultQueryOptions,
    queries: {
      ...defaultQueryOptions.queries,
      staleTime: 0, // Always refetch in development
      gcTime: 1000 * 60, // 1 minute cache in development
    },
  },
  
  production: {
    ...defaultQueryOptions,
    queries: {
      ...defaultQueryOptions.queries,
      staleTime: 5 * 60 * 1000, // 5 minutes fresh time in production
      gcTime: 30 * 60 * 1000, // 30 minutes cache in production
    },
  },
  
  test: {
    ...defaultQueryOptions,
    queries: {
      ...defaultQueryOptions.queries,
      retry: false, // Don't retry in tests
      staleTime: Infinity, // Never refetch in tests
      gcTime: Infinity, // Never garbage collect in tests
    },
  },
};

/**
 * Create environment-specific query client
 */
export function createQueryClientForEnv(env: 'development' | 'production' | 'test'): QueryClient {
  return new QueryClient({
    defaultOptions: queryClientConfig[env],
  });
}