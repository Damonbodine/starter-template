/**
 * Optimistic Update Patterns
 * Reusable patterns for optimistic UI updates
 */

import { useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { toast } from '../zustand/ui-store';
import { errorTracker } from '../zustand/app-store';

/**
 * Base optimistic update configuration
 */
export interface OptimisticConfig<TData, TVariables> {
  queryKey: readonly unknown[];
  generateOptimisticData: (variables: TVariables, currentData?: TData) => TData;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Create optimistic mutation pattern
 */
export function createOptimisticMutation<TData, TError, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: OptimisticConfig<TData, TVariables>
): UseMutationOptions<TData, TError, TVariables> {
  const queryClient = useQueryClient();

  return {
    mutationFn,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: config.queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(config.queryKey);

      // Optimistically update to the new value
      const optimisticData = config.generateOptimisticData(variables, previousData);
      queryClient.setQueryData(config.queryKey, optimisticData);

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(config.queryKey, context.previousData);
      }

      // Show error message
      if (config.errorMessage) {
        toast.error(config.errorMessage, (error as Error).message);
      }

      // Track error
      errorTracker.captureError(error as Error, { variables });

      // Call custom error handler
      config.onError?.(error as Error, variables);
    },
    onSuccess: (data, variables) => {
      // Show success message
      if (config.successMessage) {
        toast.success(config.successMessage);
      }

      // Call custom success handler
      config.onSuccess?.(data, variables);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: config.queryKey });
    },
  };
}

/**
 * Create optimistic list addition pattern
 */
export function createOptimisticListAdd<TItem, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TItem>,
  config: {
    queryKey: readonly unknown[];
    generateOptimisticItem: (variables: TVariables) => TItem;
    getListFromData: (data: any) => TItem[];
    setListInData: (data: any, newList: TItem[]) => any;
    addToBeginning?: boolean;
    successMessage?: string;
    errorMessage?: string;
  }
): UseMutationOptions<TItem, Error, TVariables> {
  const queryClient = useQueryClient();

  return {
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: config.queryKey });

      const previousData = queryClient.getQueryData(config.queryKey);
      
      if (previousData) {
        const currentList = config.getListFromData(previousData);
        const optimisticItem = config.generateOptimisticItem(variables);
        
        const newList = config.addToBeginning 
          ? [optimisticItem, ...currentList]
          : [...currentList, optimisticItem];
          
        const newData = config.setListInData(previousData, newList);
        queryClient.setQueryData(config.queryKey, newData);
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(config.queryKey, context.previousData);
      }

      if (config.errorMessage) {
        toast.error(config.errorMessage, error.message);
      }

      errorTracker.captureError(error, { variables });
    },
    onSuccess: (data) => {
      if (config.successMessage) {
        toast.success(config.successMessage);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
    },
  };
}

/**
 * Create optimistic list update pattern
 */
export function createOptimisticListUpdate<TItem, TVariables extends { id: string }>(
  mutationFn: (variables: TVariables) => Promise<TItem>,
  config: {
    queryKey: readonly unknown[];
    updateItem: (item: TItem, variables: TVariables) => TItem;
    getListFromData: (data: any) => TItem[];
    setListInData: (data: any, newList: TItem[]) => any;
    getItemId: (item: TItem) => string;
    successMessage?: string;
    errorMessage?: string;
  }
): UseMutationOptions<TItem, Error, TVariables> {
  const queryClient = useQueryClient();

  return {
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: config.queryKey });

      const previousData = queryClient.getQueryData(config.queryKey);
      
      if (previousData) {
        const currentList = config.getListFromData(previousData);
        const newList = currentList.map(item => 
          config.getItemId(item) === variables.id 
            ? config.updateItem(item, variables)
            : item
        );
        
        const newData = config.setListInData(previousData, newList);
        queryClient.setQueryData(config.queryKey, newData);
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(config.queryKey, context.previousData);
      }

      if (config.errorMessage) {
        toast.error(config.errorMessage, error.message);
      }

      errorTracker.captureError(error, { variables });
    },
    onSuccess: (data) => {
      if (config.successMessage) {
        toast.success(config.successMessage);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
    },
  };
}

/**
 * Create optimistic list removal pattern
 */
export function createOptimisticListRemove<TVariables extends { id: string }>(
  mutationFn: (variables: TVariables) => Promise<void>,
  config: {
    queryKey: readonly unknown[];
    getListFromData: (data: any) => any[];
    setListInData: (data: any, newList: any[]) => any;
    getItemId: (item: any) => string;
    successMessage?: string;
    errorMessage?: string;
  }
): UseMutationOptions<void, Error, TVariables> {
  const queryClient = useQueryClient();

  return {
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: config.queryKey });

      const previousData = queryClient.getQueryData(config.queryKey);
      
      if (previousData) {
        const currentList = config.getListFromData(previousData);
        const newList = currentList.filter(item => 
          config.getItemId(item) !== variables.id
        );
        
        const newData = config.setListInData(previousData, newList);
        queryClient.setQueryData(config.queryKey, newData);
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(config.queryKey, context.previousData);
      }

      if (config.errorMessage) {
        toast.error(config.errorMessage, error.message);
      }

      errorTracker.captureError(error, { variables });
    },
    onSuccess: () => {
      if (config.successMessage) {
        toast.success(config.successMessage);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
    },
  };
}

/**
 * Create optimistic like/unlike pattern
 */
export function createOptimisticToggle<TItem, TVariables extends { id: string }>(
  mutationFn: (variables: TVariables) => Promise<TItem>,
  config: {
    queryKey: readonly unknown[];
    toggleProperty: keyof TItem;
    countProperty?: keyof TItem;
    getListFromData?: (data: any) => TItem[];
    setListInData?: (data: any, newList: TItem[]) => any;
    getItemId: (item: TItem) => string;
    successMessage?: string;
    errorMessage?: string;
  }
): UseMutationOptions<TItem, Error, TVariables> {
  const queryClient = useQueryClient();

  return {
    mutationFn,
    onMutate: async (variables) => {
      // Handle both single item and list updates
      const queries = queryClient.getQueriesData({ queryKey: config.queryKey });
      const previousData = queries.map(([queryKey, data]) => ({ queryKey, data }));

      for (const { queryKey, data } of previousData) {
        if (data) {
          if (config.getListFromData && config.setListInData) {
            // Update in list
            const currentList = config.getListFromData(data);
            const newList = currentList.map(item => {
              if (config.getItemId(item) === variables.id) {
                const newItem = { ...item };
                newItem[config.toggleProperty] = !newItem[config.toggleProperty] as any;
                
                if (config.countProperty && typeof newItem[config.countProperty] === 'number') {
                  const currentCount = newItem[config.countProperty] as number;
                  newItem[config.countProperty] = (newItem[config.toggleProperty] 
                    ? currentCount + 1 
                    : currentCount - 1) as any;
                }
                
                return newItem;
              }
              return item;
            });
            
            const newData = config.setListInData(data, newList);
            queryClient.setQueryData(queryKey, newData);
          } else {
            // Update single item
            const item = data as TItem;
            if (config.getItemId(item) === variables.id) {
              const newItem = { ...item };
              newItem[config.toggleProperty] = !newItem[config.toggleProperty] as any;
              
              if (config.countProperty && typeof newItem[config.countProperty] === 'number') {
                const currentCount = newItem[config.countProperty] as number;
                newItem[config.countProperty] = (newItem[config.toggleProperty] 
                  ? currentCount + 1 
                  : currentCount - 1) as any;
              }
              
              queryClient.setQueryData(queryKey, newItem);
            }
          }
        }
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Restore all previous data
      if (context?.previousData) {
        context.previousData.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      if (config.errorMessage) {
        toast.error(config.errorMessage, error.message);
      }

      errorTracker.captureError(error, { variables });
    },
    onSuccess: () => {
      if (config.successMessage) {
        toast.success(config.successMessage);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
    },
  };
}

/**
 * Optimistic update hook for common patterns
 */
export const useOptimisticPatterns = () => {
  return {
    createAdd: createOptimisticListAdd,
    createUpdate: createOptimisticListUpdate,
    createRemove: createOptimisticListRemove,
    createToggle: createOptimisticToggle,
    createMutation: createOptimisticMutation,
  };
};