/**
 * Database Query Functions
 * Type-safe database read operations with proper error handling
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type {
  UserProfile,
  ListQueryParams,
  PaginatedResponse,
  ApiResponse,
} from './types';
import {
  withErrorHandling,
  NotFoundError,
  UnauthorizedError,
} from './errors';
import {
  createApiResponse,
  createPaginatedResponse,
  buildListQuery,
  getTotalCount,
  formatDatabaseRecord,
  checkResourceAccess,
} from './utils';

/**
 * User Profile Queries
 */
export class UserQueries {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get user profile by ID
   */
  getUserProfile = withErrorHandling(async (
    userId: string
  ): Promise<ApiResponse<UserProfile>> => {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError(`User profile not found for ID: ${userId}`);
      }
      throw error;
    }

    const formattedData = formatDatabaseRecord(data);
    return createApiResponse(formattedData as UserProfile, 'User profile retrieved successfully');
  });

  /**
   * Get current user profile
   */
  getCurrentUserProfile = withErrorHandling(async (): Promise<ApiResponse<UserProfile>> => {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser();

    if (authError || !user) {
      throw new UnauthorizedError('User not authenticated');
    }

    return this.getUserProfile(user.id);
  });

  /**
   * Search user profiles
   */
  searchUserProfiles = withErrorHandling(async (
    query: string,
    params: Partial<ListQueryParams> = {}
  ): Promise<PaginatedResponse<UserProfile>> => {
    const { page = 1, limit = 20 } = params;

    // Get total count
    const total = await getTotalCount(
      this.supabase,
      'profiles',
      { search: query }
    );

    // Build and execute query
    let dbQuery = this.supabase
      .from('profiles')
      .select('*');

    if (query) {
      dbQuery = dbQuery.or(`full_name.ilike.%${query}%,bio.ilike.%${query}%,location.ilike.%${query}%`);
    }

    dbQuery = buildListQuery(dbQuery, { 
      ...params, 
      page, 
      limit,
      sort_direction: params.sort_direction || 'desc'
    });

    const { data, error } = await dbQuery;

    if (error) {
      throw error;
    }

    const formattedData = data?.map(item => formatDatabaseRecord(item)) as UserProfile[];

    return createPaginatedResponse(
      formattedData || [],
      { page, limit, total },
      `Found ${total} user profiles`
    );
  });

  /**
   * Get user profiles by IDs
   */
  getUserProfilesByIds = withErrorHandling(async (
    userIds: string[]
  ): Promise<ApiResponse<UserProfile[]>> => {
    if (userIds.length === 0) {
      return createApiResponse([], 'No user IDs provided');
    }

    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .in('user_id', userIds);

    if (error) {
      throw error;
    }

    const formattedData = data?.map(item => formatDatabaseRecord(item)) as UserProfile[];

    return createApiResponse(
      formattedData || [],
      `Retrieved ${formattedData?.length || 0} user profiles`
    );
  });

  /**
   * Check if user profile exists
   */
  checkUserProfileExists = withErrorHandling(async (
    userId: string
  ): Promise<ApiResponse<boolean>> => {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return createApiResponse(
      !!data,
      data ? 'User profile exists' : 'User profile does not exist'
    );
  });
}

/**
 * Generic Table Queries
 */
export class TableQueries {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get records from any table with pagination and filtering
   */
  getRecords = withErrorHandling(async <T = Record<string, unknown>>(
    tableName: string,
    params: Partial<ListQueryParams> = {},
    userId?: string
  ): Promise<PaginatedResponse<T>> => {
    const { page = 1, limit = 20 } = params;

    // Check access if userId provided
    if (userId) {
      const hasAccess = await checkResourceAccess(
        this.supabase,
        userId,
        tableName,
        'table'
      );
      if (!hasAccess) {
        throw new UnauthorizedError('Access denied to this resource');
      }
    }

    // Get total count
    const total = await getTotalCount(
      this.supabase,
      tableName,
      params.filters
    );

    // Build and execute query
    let query = this.supabase
      .from(tableName)
      .select('*');

    query = buildListQuery(query, { 
      ...params, 
      page, 
      limit,
      sort_direction: params.sort_direction || 'desc'
    });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const formattedData = data?.map(item => formatDatabaseRecord(item)) as T[];

    return createPaginatedResponse(
      formattedData || [],
      { page, limit, total },
      `Retrieved ${formattedData?.length || 0} records from ${tableName}`
    );
  });

  /**
   * Get single record by ID
   */
  getRecordById = withErrorHandling(async <T = Record<string, unknown>>(
    tableName: string,
    id: string,
    userId?: string
  ): Promise<ApiResponse<T>> => {
    // Check access if userId provided
    if (userId) {
      const hasAccess = await checkResourceAccess(
        this.supabase,
        userId,
        id,
        tableName
      );
      if (!hasAccess) {
        throw new UnauthorizedError('Access denied to this resource');
      }
    }

    const { data, error } = await this.supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError(`Record not found in ${tableName} with ID: ${id}`);
      }
      throw error;
    }

    const formattedData = formatDatabaseRecord(data) as T;
    return createApiResponse(formattedData, 'Record retrieved successfully');
  });

  /**
   * Count records in table
   */
  countRecords = withErrorHandling(async (
    tableName: string,
    filters?: Record<string, unknown>
  ): Promise<ApiResponse<number>> => {
    const count = await getTotalCount(this.supabase, tableName, filters);
    return createApiResponse(count, `Found ${count} records in ${tableName}`);
  });
}

/**
 * Database Queries Factory
 */
export function createDatabaseQueries(supabase: SupabaseClient) {
  return {
    users: new UserQueries(supabase),
    tables: new TableQueries(supabase),
  };
}

// Note: UserQueries and TableQueries are already exported above