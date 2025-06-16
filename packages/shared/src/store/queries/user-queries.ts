/**
 * User Queries
 * TanStack Query hooks for user-related server state
 */

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { authClient } from '@starter-template/database/auth';
import type { UserProfile, ProfileUpdateRequest } from '@starter-template/database/auth';
import { queryKeys, cacheUtils } from '../query-client';
import { toast } from '../zustand/ui-store';
import { errorTracker } from '../zustand/app-store';

/**
 * API functions for user operations
 */
const userApi = {
  // Get current user profile
  getCurrentUser: async (): Promise<UserProfile | null> => {
    const { profile, error } = await authClient.getUserProfile();
    if (error) throw error;
    return profile;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<UserProfile | null> => {
    const { profile, error } = await authClient.getUserProfile(userId);
    if (error) throw error;
    return profile;
  },

  // Update user profile
  updateProfile: async (data: ProfileUpdateRequest): Promise<UserProfile> => {
    const { profile, error } = await authClient.updateProfile(data);
    if (error) throw error;
    if (!profile) throw new Error('Failed to update profile');
    return profile;
  },

  // Search users
  searchUsers: async (query: string, filters: Record<string, any> = {}): Promise<UserProfile[]> => {
    // This would be implemented with your actual search API
    // For now, returning empty array as placeholder
    return [];
  },

  // Get user permissions
  getUserPermissions: async (userId: string): Promise<any[]> => {
    // This would fetch user permissions from your API
    return [];
  },
};

/**
 * Query hooks
 */

/**
 * Get current user profile
 */
export const useCurrentUser = (options?: Omit<UseQueryOptions<UserProfile | null>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: queryKeys.users.profile('current'),
    queryFn: userApi.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Get user by ID
 */
export const useUser = (
  userId: string,
  options?: Omit<UseQueryOptions<UserProfile | null>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => userApi.getUserById(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Search users
 */
export const useUserSearch = (
  query: string,
  filters: Record<string, any> = {},
  options?: Omit<UseQueryOptions<UserProfile[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.users.list({ query, ...filters }),
    queryFn: () => userApi.searchUsers(query, filters),
    enabled: query.length >= 2, // Only search with 2+ characters
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
};

/**
 * Get user permissions
 */
export const useUserPermissions = (
  userId: string,
  options?: Omit<UseQueryOptions<any[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.users.permissions(userId),
    queryFn: () => userApi.getUserPermissions(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Mutation hooks
 */

/**
 * Update user profile mutation
 */
export const useUpdateProfile = (
  options?: UseMutationOptions<UserProfile, Error, ProfileUpdateRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.updateProfile,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.profile('current') });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData<UserProfile>(queryKeys.users.profile('current'));

      // Optimistically update to the new value
      if (previousUser) {
        queryClient.setQueryData<UserProfile>(queryKeys.users.profile('current'), {
          ...previousUser,
          ...variables,
          updated_at: new Date().toISOString(),
        });
      }

      // Return a context object with the snapshotted value
      return { previousUser };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.profile('current'), context.previousUser);
      }
      
      // Show error toast
      toast.error('Failed to update profile', error.message);
      
      // Track error
      errorTracker.captureError(error, { operation: 'updateProfile', variables });
    },
    onSuccess: (data, variables) => {
      // Show success toast
      toast.success('Profile updated successfully');
      
      // Invalidate and refetch related queries
      cacheUtils.invalidateUser(data.id);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile('current') });
    },
    ...options,
  });
};

/**
 * Prefetch user data
 */
export const usePrefetchUser = () => {
  const queryClient = useQueryClient();

  return {
    prefetchUser: (userId: string) => {
      return queryClient.prefetchQuery({
        queryKey: queryKeys.users.detail(userId),
        queryFn: () => userApi.getUserById(userId),
        staleTime: 2 * 60 * 1000,
      });
    },
    
    prefetchUserPermissions: (userId: string) => {
      return queryClient.prefetchQuery({
        queryKey: queryKeys.users.permissions(userId),
        queryFn: () => userApi.getUserPermissions(userId),
        staleTime: 10 * 60 * 1000,
      });
    },
  };
};

/**
 * User query utilities
 */
export const userQueryUtils = {
  /**
   * Invalidate all user queries
   */
  invalidateAll: () => cacheUtils.invalidateUsers(),

  /**
   * Invalidate specific user
   */
  invalidateUser: (userId: string) => cacheUtils.invalidateUser(userId),

  /**
   * Set user data manually
   */
  setUserData: (userId: string, data: UserProfile) => {
    cacheUtils.setQueryData(queryKeys.users.detail(userId), data);
  },

  /**
   * Update user data optimistically
   */
  updateUserData: (userId: string, updater: (oldData: UserProfile | undefined) => UserProfile) => {
    cacheUtils.setQueryDataOptimistic(queryKeys.users.detail(userId), updater);
  },

  /**
   * Remove user from cache
   */
  removeUser: (userId: string) => {
    cacheUtils.removeQuery(queryKeys.users.detail(userId));
  },
};

/**
 * Custom hooks for common user operations
 */

/**
 * Hook for checking if current user has permission
 */
export const useHasPermission = (resource: string, action: string) => {
  const { data: user } = useCurrentUser();
  
  return user?.permissions?.some(
    p => p.resource === resource && p.action === action
  ) || false;
};

/**
 * Hook for checking if current user has role
 */
export const useHasRole = (role: string) => {
  const { data: user } = useCurrentUser();
  return user?.role === role;
};

/**
 * Hook for user profile completion status
 */
export const useProfileCompletion = () => {
  const { data: user } = useCurrentUser();
  
  if (!user) return { completion: 0, missingFields: [] };
  
  const fields = [
    { key: 'first_name', weight: 20 },
    { key: 'last_name', weight: 20 },
    { key: 'avatar_url', weight: 15 },
    { key: 'bio', weight: 15 },
    { key: 'phone', weight: 10 },
    { key: 'email_verified', weight: 20 },
  ];
  
  let completion = 0;
  const missingFields: string[] = [];
  
  fields.forEach(field => {
    if (user[field.key as keyof UserProfile]) {
      completion += field.weight;
    } else {
      missingFields.push(field.key);
    }
  });
  
  return { completion, missingFields };
};