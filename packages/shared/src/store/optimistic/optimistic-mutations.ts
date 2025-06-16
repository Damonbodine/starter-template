/**
 * Optimistic Mutations
 * Higher-level hooks for specific optimistic operations
 */

import { useMutation } from '@tanstack/react-query';
import { 
  createOptimisticListAdd,
  createOptimisticListUpdate,
  createOptimisticListRemove,
  createOptimisticToggle 
} from './optimistic-patterns';
import { queryKeys } from '../query-client';
import type { Post, Comment, CreatePostData, UpdatePostData, CreateCommentData } from '../queries/post-queries';

/**
 * Optimistic post creation
 */
export const useOptimisticCreatePost = (mutationFn: (data: CreatePostData) => Promise<Post>) => {
  return useMutation(createOptimisticListAdd(mutationFn, {
    queryKey: queryKeys.posts.lists(),
    generateOptimisticItem: (variables) => ({
      id: `optimistic-${Date.now()}`,
      ...variables,
      status: variables.status || 'draft',
      tags: variables.tags || [],
      author_id: 'current-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Post),
    getListFromData: (data: any) => data?.posts || [],
    setListInData: (data: any, newList: Post[]) => ({
      ...data,
      posts: newList,
      total: (data?.total || 0) + 1,
    }),
    addToBeginning: true,
    successMessage: 'Post created successfully',
    errorMessage: 'Failed to create post',
  }));
};

/**
 * Optimistic post update
 */
export const useOptimisticUpdatePost = (mutationFn: (data: UpdatePostData) => Promise<Post>) => {
  return useMutation(createOptimisticListUpdate(mutationFn, {
    queryKey: queryKeys.posts.lists(),
    updateItem: (item, variables) => ({
      ...item,
      ...variables,
      updated_at: new Date().toISOString(),
    }),
    getListFromData: (data: any) => data?.posts || [],
    setListInData: (data: any, newList: Post[]) => ({
      ...data,
      posts: newList,
    }),
    getItemId: (item) => item.id,
    successMessage: 'Post updated successfully',
    errorMessage: 'Failed to update post',
  }));
};

/**
 * Optimistic post deletion
 */
export const useOptimisticDeletePost = (mutationFn: (data: { id: string }) => Promise<void>) => {
  return useMutation(createOptimisticListRemove(mutationFn, {
    queryKey: queryKeys.posts.lists(),
    getListFromData: (data: any) => data?.posts || [],
    setListInData: (data: any, newList: Post[]) => ({
      ...data,
      posts: newList,
      total: Math.max(0, (data?.total || 0) - 1),
    }),
    getItemId: (item) => item.id,
    successMessage: 'Post deleted successfully',
    errorMessage: 'Failed to delete post',
  }));
};

/**
 * Optimistic comment creation
 */
export const useOptimisticCreateComment = (
  postId: string,
  mutationFn: (data: CreateCommentData) => Promise<Comment>
) => {
  return useMutation(createOptimisticListAdd(mutationFn, {
    queryKey: queryKeys.posts.comments(postId),
    generateOptimisticItem: (variables) => ({
      id: `optimistic-${Date.now()}`,
      ...variables,
      author_id: 'current-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Comment),
    getListFromData: (data: Comment[]) => data || [],
    setListInData: (data: Comment[], newList: Comment[]) => newList,
    addToBeginning: false,
    successMessage: 'Comment added successfully',
    errorMessage: 'Failed to add comment',
  }));
};

/**
 * Optimistic like/unlike post
 */
export const useOptimisticLikePost = (mutationFn: (data: { id: string }) => Promise<Post>) => {
  return useMutation(createOptimisticToggle(mutationFn, {
    queryKey: queryKeys.posts.all,
    toggleProperty: 'liked' as keyof Post, // Assuming you have a liked property
    countProperty: 'likes_count' as keyof Post, // Assuming you have a likes_count property
    getListFromData: (data: any) => data?.posts || [],
    setListInData: (data: any, newList: Post[]) => ({
      ...data,
      posts: newList,
    }),
    getItemId: (item) => item.id,
    successMessage: 'Post liked',
    errorMessage: 'Failed to like post',
  }));
};

/**
 * Optimistic bookmark/unbookmark post
 */
export const useOptimisticBookmarkPost = (mutationFn: (data: { id: string }) => Promise<Post>) => {
  return useMutation(createOptimisticToggle(mutationFn, {
    queryKey: queryKeys.posts.all,
    toggleProperty: 'bookmarked' as keyof Post, // Assuming you have a bookmarked property
    getListFromData: (data: any) => data?.posts || [],
    setListInData: (data: any, newList: Post[]) => ({
      ...data,
      posts: newList,
    }),
    getItemId: (item) => item.id,
    successMessage: 'Bookmark updated',
    errorMessage: 'Failed to update bookmark',
  }));
};

/**
 * Optimistic follow/unfollow user
 */
export const useOptimisticFollowUser = (mutationFn: (data: { id: string }) => Promise<any>) => {
  return useMutation(createOptimisticToggle(mutationFn, {
    queryKey: queryKeys.users.all,
    toggleProperty: 'is_following' as any, // Assuming you have an is_following property
    countProperty: 'followers_count' as any, // Assuming you have a followers_count property
    getListFromData: (data: any) => data?.users || [],
    setListInData: (data: any, newList: any[]) => ({
      ...data,
      users: newList,
    }),
    getItemId: (item: any) => item.id,
    successMessage: 'Follow status updated',
    errorMessage: 'Failed to update follow status',
  }));
};

/**
 * Generic optimistic list operations
 */
export const useOptimisticListOperations = <TItem, TCreate, TUpdate extends { id: string }>(
  config: {
    queryKey: readonly unknown[];
    getListFromData: (data: any) => TItem[];
    setListInData: (data: any, newList: TItem[]) => any;
    getItemId: (item: TItem) => string;
    generateOptimisticItem: (variables: TCreate) => TItem;
    updateItem: (item: TItem, variables: TUpdate) => TItem;
  }
) => {
  return {
    useCreate: (mutationFn: (data: TCreate) => Promise<TItem>) =>
      useMutation(createOptimisticListAdd(mutationFn, {
        queryKey: config.queryKey,
        generateOptimisticItem: config.generateOptimisticItem,
        getListFromData: config.getListFromData,
        setListInData: config.setListInData,
        addToBeginning: true,
      })),

    useUpdate: (mutationFn: (data: TUpdate) => Promise<TItem>) =>
      useMutation(createOptimisticListUpdate(mutationFn, {
        queryKey: config.queryKey,
        updateItem: config.updateItem,
        getListFromData: config.getListFromData,
        setListInData: config.setListInData,
        getItemId: config.getItemId,
      })),

    useDelete: (mutationFn: (data: { id: string }) => Promise<void>) =>
      useMutation(createOptimisticListRemove(mutationFn, {
        queryKey: config.queryKey,
        getListFromData: config.getListFromData,
        setListInData: config.setListInData,
        getItemId: config.getItemId,
      })),
  };
};