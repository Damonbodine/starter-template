/**
 * Database Mutation Functions
 * Type-safe database write operations with proper error handling
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type {
  UserProfile,
  ProfileCreateInput,
  ProfileUpdateInput,
  UserUpdateInput,
  ApiResponse,
} from './types';
import {
  withErrorHandling,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from './errors';
import {
  createApiResponse,
  formatDatabaseRecord,
  validateRequiredFields,
  sanitizeData,
  checkResourceAccess,
} from './utils';

/**
 * User Profile Mutations
 */
export class UserMutations {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Create user profile
   */
  createUserProfile = withErrorHandling(async (
    input: ProfileCreateInput
  ): Promise<ApiResponse<UserProfile>> => {
    // Validate required fields
    validateRequiredFields(input, ['user_id', 'full_name']);

    // Check if profile already exists
    const { data: existingProfile } = await this.supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', input.user_id)
      .single();

    if (existingProfile) {
      throw new ValidationError('User profile already exists');
    }

    // Sanitize input data
    const allowedFields = [
      'user_id',
      'full_name',
      'avatar_url',
      'bio',
      'location',
      'website',
      'preferences',
    ] as (keyof ProfileCreateInput)[];

    const sanitizedData = sanitizeData(input, allowedFields);

    // Create profile
    const { data, error } = await this.supabase
      .from('profiles')
      .insert(sanitizedData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const formattedData = formatDatabaseRecord(data) as UserProfile;
    return createApiResponse(formattedData, 'User profile created successfully');
  });

  /**
   * Update user profile
   */
  updateUserProfile = withErrorHandling(async (
    userId: string,
    input: ProfileUpdateInput
  ): Promise<ApiResponse<UserProfile>> => {
    // Check if user can update this profile
    const { data: { user }, error: authError } = await this.supabase.auth.getUser();

    if (authError || !user) {
      throw new UnauthorizedError('User not authenticated');
    }

    if (user.id !== userId) {
      const hasAccess = await checkResourceAccess(
        this.supabase,
        user.id,
        userId,
        'profile'
      );
      if (!hasAccess) {
        throw new UnauthorizedError('Cannot update another user\'s profile');
      }
    }

    // Sanitize input data
    const allowedFields = [
      'full_name',
      'avatar_url',
      'bio',
      'location',
      'website',
      'preferences',
    ] as (keyof ProfileUpdateInput)[];

    const sanitizedData = sanitizeData(input, allowedFields);

    if (Object.keys(sanitizedData).length === 0) {
      throw new ValidationError('No valid fields provided for update');
    }

    // Add updated_at timestamp
    const updateData = {
      ...sanitizedData,
      updated_at: new Date().toISOString(),
    };

    // Update profile
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError(`User profile not found for ID: ${userId}`);
      }
      throw error;
    }

    const formattedData = formatDatabaseRecord(data) as UserProfile;
    return createApiResponse(formattedData, 'User profile updated successfully');
  });

  /**
   * Update current user profile
   */
  updateCurrentUserProfile = withErrorHandling(async (
    input: ProfileUpdateInput
  ): Promise<ApiResponse<UserProfile>> => {
    const { data: { user }, error: authError } = await this.supabase.auth.getUser();

    if (authError || !user) {
      throw new UnauthorizedError('User not authenticated');
    }

    return this.updateUserProfile(user.id, input);
  });

  /**
   * Delete user profile
   */
  deleteUserProfile = withErrorHandling(async (
    userId: string
  ): Promise<ApiResponse<boolean>> => {
    // Check if user can delete this profile
    const { data: { user }, error: authError } = await this.supabase.auth.getUser();

    if (authError || !user) {
      throw new UnauthorizedError('User not authenticated');
    }

    if (user.id !== userId) {
      const hasAccess = await checkResourceAccess(
        this.supabase,
        user.id,
        userId,
        'profile'
      );
      if (!hasAccess) {
        throw new UnauthorizedError('Cannot delete another user\'s profile');
      }
    }

    // Delete profile
    const { error } = await this.supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return createApiResponse(true, 'User profile deleted successfully');
  });

  /**
   * Upload user avatar
   */
  uploadUserAvatar = withErrorHandling(async (
    userId: string,
    file: File
  ): Promise<ApiResponse<string>> => {
    // Check if user can update this profile
    const { data: { user }, error: authError } = await this.supabase.auth.getUser();

    if (authError || !user) {
      throw new UnauthorizedError('User not authenticated');
    }

    if (user.id !== userId) {
      throw new UnauthorizedError('Cannot upload avatar for another user');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new ValidationError('File must be an image');
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new ValidationError('File size must be less than 5MB');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Upload file
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(uploadData.path);

    // Update profile with new avatar URL
    await this.updateUserProfile(userId, { avatar_url: publicUrl });

    return createApiResponse(publicUrl, 'Avatar uploaded successfully');
  });
}

/**
 * Generic Table Mutations
 */
export class TableMutations {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Insert record into any table
   */
  insertRecord = withErrorHandling(async <T = Record<string, unknown>>(
    tableName: string,
    data: Partial<T>,
    userId?: string
  ): Promise<ApiResponse<T>> => {
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

    const { data: result, error } = await this.supabase
      .from(tableName)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const formattedData = formatDatabaseRecord(result) as T;
    return createApiResponse(formattedData, `Record created in ${tableName}`);
  });

  /**
   * Update record in any table
   */
  updateRecord = withErrorHandling(async <T = Record<string, unknown>>(
    tableName: string,
    id: string,
    data: Partial<T>,
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

    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await this.supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError(`Record not found in ${tableName} with ID: ${id}`);
      }
      throw error;
    }

    const formattedData = formatDatabaseRecord(result) as T;
    return createApiResponse(formattedData, `Record updated in ${tableName}`);
  });

  /**
   * Delete record from any table
   */
  deleteRecord = withErrorHandling(async (
    tableName: string,
    id: string,
    userId?: string
  ): Promise<ApiResponse<boolean>> => {
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

    const { error } = await this.supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return createApiResponse(true, `Record deleted from ${tableName}`);
  });

  /**
   * Bulk insert records
   */
  bulkInsert = withErrorHandling(async <T = Record<string, unknown>>(
    tableName: string,
    records: Partial<T>[],
    userId?: string
  ): Promise<ApiResponse<T[]>> => {
    if (records.length === 0) {
      throw new ValidationError('No records provided for bulk insert');
    }

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

    const { data, error } = await this.supabase
      .from(tableName)
      .insert(records)
      .select();

    if (error) {
      throw error;
    }

    const formattedData = data?.map(item => formatDatabaseRecord(item)) as T[];
    return createApiResponse(
      formattedData || [],
      `${formattedData?.length || 0} records created in ${tableName}`
    );
  });
}

/**
 * Database Mutations Factory
 */
export function createDatabaseMutations(supabase: SupabaseClient) {
  return {
    users: new UserMutations(supabase),
    tables: new TableMutations(supabase),
  };
}

// Note: UserMutations and TableMutations are already exported above