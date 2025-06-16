/**
 * Post Queries
 * TanStack Query hooks for post-related server state
 */

import { 
  useQuery, 
  useMutation, 
  useInfiniteQuery,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { queryKeys, cacheUtils } from '../query-client';
import { toast } from '../zustand/ui-store';
import { errorTracker } from '../zustand/app-store';

/**
 * Post interfaces
 */
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author_id: string;
  author?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  content: string;
  parent_id?: string;
  replies?: Comment[];
  created_at: string;
  updated_at: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  status?: 'draft' | 'published';
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
}

export interface CreateCommentData {
  post_id: string;
  content: string;
  parent_id?: string;
}

/**
 * API functions for post operations
 */
const postApi = {
  // Get posts with pagination
  getPosts: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    author_id?: string;
    tags?: string[];
    search?: string;
  } = {}): Promise<{
    posts: Post[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    // This would be implemented with your actual API
    // For now, returning mock data
    return {
      posts: [],
      total: 0,
      page: params.page || 1,
      totalPages: 1,
    };
  },

  // Get posts for infinite query
  getPostsInfinite: async (params: {
    pageParam?: number;
    limit?: number;
    status?: string;
    author_id?: string;
    tags?: string[];
    search?: string;
  } = {}): Promise<{
    posts: Post[];
    nextCursor?: number;
    hasNextPage: boolean;
  }> => {
    // Mock implementation
    return {
      posts: [],
      nextCursor: undefined,
      hasNextPage: false,
    };
  },

  // Get single post
  getPost: async (postId: string): Promise<Post> => {
    // Mock implementation
    throw new Error('Post not found');
  },

  // Create post
  createPost: async (data: CreatePostData): Promise<Post> => {
    // Mock implementation
    throw new Error('Not implemented');
  },

  // Update post
  updatePost: async (data: UpdatePostData): Promise<Post> => {
    // Mock implementation
    throw new Error('Not implemented');
  },

  // Delete post
  deletePost: async (postId: string): Promise<void> => {
    // Mock implementation
    throw new Error('Not implemented');
  },

  // Get post comments
  getComments: async (postId: string): Promise<Comment[]> => {
    // Mock implementation
    return [];
  },

  // Create comment
  createComment: async (data: CreateCommentData): Promise<Comment> => {
    // Mock implementation
    throw new Error('Not implemented');
  },

  // Delete comment
  deleteComment: async (commentId: string): Promise<void> => {
    // Mock implementation
    throw new Error('Not implemented');
  },
};

/**
 * Query hooks
 */

/**
 * Get posts with pagination
 */
export const usePosts = (
  params: {
    page?: number;
    limit?: number;
    status?: string;
    author_id?: string;
    tags?: string[];
    search?: string;
  } = {},
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.posts.list(params),
    queryFn: () => postApi.getPosts(params),
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
};

/**
 * Get posts with infinite scrolling
 */
export const useInfinitePosts = (
  params: {
    limit?: number;
    status?: string;
    author_id?: string;
    tags?: string[];
    search?: string;
  } = {},
  options?: Omit<UseInfiniteQueryOptions<any>, 'queryKey' | 'queryFn' | 'getNextPageParam'>
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.list(params),
    queryFn: ({ pageParam = 1 }) => postApi.getPostsInfinite({ ...params, pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.nextCursor : undefined;
    },
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
};

/**
 * Get single post
 */
export const usePost = (
  postId: string,
  options?: Omit<UseQueryOptions<Post>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => postApi.getPost(postId),
    enabled: !!postId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Get post comments
 */
export const usePostComments = (
  postId: string,
  options?: Omit<UseQueryOptions<Comment[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.posts.comments(postId),
    queryFn: () => postApi.getComments(postId),
    enabled: !!postId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

/**
 * Mutation hooks
 */

/**
 * Create post mutation
 */
export const useCreatePost = (
  options?: UseMutationOptions<Post, Error, CreatePostData>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.createPost,
    onMutate: async (variables) => {
      // Optimistically add to cache
      const optimisticPost: Post = {
        id: `temp-${Date.now()}`,
        ...variables,
        status: variables.status || 'draft',
        tags: variables.tags || [],
        author_id: 'current-user', // Would get from auth context
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.lists() });

      // Get previous data
      const previousPosts = queryClient.getQueriesData({ queryKey: queryKeys.posts.lists() });

      // Optimistically update
      queryClient.setQueriesData({ queryKey: queryKeys.posts.lists() }, (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          posts: [optimisticPost, ...old.posts],
          total: old.total + 1,
        };
      });

      return { optimisticPost, previousPosts };
    },
    onError: (error, variables, context) => {
      // Revert optimistic updates
      if (context?.previousPosts) {
        context.previousPosts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      toast.error('Failed to create post', error.message);
      errorTracker.captureError(error, { operation: 'createPost', variables });
    },
    onSuccess: (data, variables) => {
      toast.success('Post created successfully');
      
      // Add real post to cache
      cacheUtils.setQueryData(queryKeys.posts.detail(data.id), data);
      
      // Invalidate lists to get fresh data
      cacheUtils.invalidatePosts();
    },
    onSettled: () => {
      // Always refetch lists
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
    },
    ...options,
  });
};

/**
 * Update post mutation
 */
export const useUpdatePost = (
  options?: UseMutationOptions<Post, Error, UpdatePostData>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.updatePost,
    onMutate: async (variables) => {
      const { id, ...updateData } = variables;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(id) });

      // Snapshot previous value
      const previousPost = queryClient.getQueryData<Post>(queryKeys.posts.detail(id));

      // Optimistically update
      if (previousPost) {
        queryClient.setQueryData<Post>(queryKeys.posts.detail(id), {
          ...previousPost,
          ...updateData,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousPost };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.posts.detail(variables.id), context.previousPost);
      }
      
      toast.error('Failed to update post', error.message);
      errorTracker.captureError(error, { operation: 'updatePost', variables });
    },
    onSuccess: (data, variables) => {
      toast.success('Post updated successfully');
      
      // Update cache with real data
      cacheUtils.setQueryData(queryKeys.posts.detail(data.id), data);
      
      // Invalidate lists that might contain this post
      cacheUtils.invalidatePosts();
    },
    onSettled: (data, error, variables) => {
      // Always refetch the specific post
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(variables.id) });
    },
    ...options,
  });
};

/**
 * Delete post mutation
 */
export const useDeletePost = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.deletePost,
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(postId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.lists() });

      // Snapshot previous values
      const previousPost = queryClient.getQueryData<Post>(queryKeys.posts.detail(postId));
      const previousLists = queryClient.getQueriesData({ queryKey: queryKeys.posts.lists() });

      // Optimistically remove from lists
      queryClient.setQueriesData({ queryKey: queryKeys.posts.lists() }, (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          posts: old.posts.filter((post: Post) => post.id !== postId),
          total: Math.max(0, old.total - 1),
        };
      });

      // Remove from detail cache
      queryClient.removeQueries({ queryKey: queryKeys.posts.detail(postId) });

      return { previousPost, previousLists };
    },
    onError: (error, postId, context) => {
      // Revert optimistic updates
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.posts.detail(postId), context.previousPost);
      }
      
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      toast.error('Failed to delete post', error.message);
      errorTracker.captureError(error, { operation: 'deletePost', postId });
    },
    onSuccess: (data, postId) => {
      toast.success('Post deleted successfully');
    },
    onSettled: () => {
      // Refetch lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
    },
    ...options,
  });
};

/**
 * Create comment mutation
 */
export const useCreateComment = (
  options?: UseMutationOptions<Comment, Error, CreateCommentData>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postApi.createComment,
    onMutate: async (variables) => {
      const { post_id } = variables;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.comments(post_id) });

      // Snapshot previous value
      const previousComments = queryClient.getQueryData<Comment[]>(queryKeys.posts.comments(post_id));

      // Optimistically add comment
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        ...variables,
        author_id: 'current-user', // Would get from auth context
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (previousComments) {
        queryClient.setQueryData<Comment[]>(queryKeys.posts.comments(post_id), [
          ...previousComments,
          optimisticComment,
        ]);
      }

      return { previousComments, optimisticComment };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context?.previousComments) {
        queryClient.setQueryData(queryKeys.posts.comments(variables.post_id), context.previousComments);
      }
      
      toast.error('Failed to add comment', error.message);
      errorTracker.captureError(error, { operation: 'createComment', variables });
    },
    onSuccess: (data, variables) => {
      toast.success('Comment added successfully');
      
      // Invalidate comments to get fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.comments(variables.post_id) });
    },
    ...options,
  });
};

/**
 * Post query utilities
 */
export const postQueryUtils = {
  /**
   * Invalidate all post queries
   */
  invalidateAll: () => cacheUtils.invalidatePosts(),

  /**
   * Invalidate specific post
   */
  invalidatePost: (postId: string) => cacheUtils.invalidatePost(postId),

  /**
   * Prefetch post
   */
  prefetchPost: (postId: string) => {
    return cacheUtils.prefetchQuery(
      queryKeys.posts.detail(postId),
      () => postApi.getPost(postId)
    );
  },

  /**
   * Set post data manually
   */
  setPostData: (postId: string, data: Post) => {
    cacheUtils.setQueryData(queryKeys.posts.detail(postId), data);
  },

  /**
   * Update post data optimistically
   */
  updatePostData: (postId: string, updater: (oldData: Post | undefined) => Post) => {
    cacheUtils.setQueryDataOptimistic(queryKeys.posts.detail(postId), updater);
  },
};