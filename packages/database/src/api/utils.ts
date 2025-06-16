/**
 * API Utilities
 * Helper functions for database operations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  PaginationParams, 
  SortParams, 
  FilterParams,
  ListQueryParams 
} from './types';
import { withErrorHandling } from './errors';

/**
 * Create a standardized API response
 */
export function createApiResponse<T>(
  data?: T,
  message?: string
): ApiResponse<T> {
  return {
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string
): PaginatedResponse<T> {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  return {
    data,
    message,
    timestamp: new Date().toISOString(),
    pagination: {
      ...pagination,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    },
  };
}

/**
 * Build Supabase query with pagination
 */
export function applyPagination<T>(
  query: any,
  params: PaginationParams
) {
  const { page = 1, limit = 20, offset } = params;
  
  if (offset !== undefined) {
    return query.range(offset, offset + limit - 1);
  }
  
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  
  return query.range(start, end);
}

/**
 * Apply sorting to Supabase query
 */
export function applySorting(
  query: any,
  sort?: SortParams
) {
  if (!sort) return query;
  
  return query.order(sort.field, { ascending: sort.direction === 'asc' });
}

/**
 * Apply filters to Supabase query
 */
export function applyFilters(
  query: any,
  filters?: FilterParams
) {
  if (!filters) return query;
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'string' && value.includes('%')) {
        // Use ilike for partial string matches
        query = query.ilike(key, value);
      } else if (Array.isArray(value)) {
        // Use in for array values
        query = query.in(key, value);
      } else {
        // Use eq for exact matches
        query = query.eq(key, value);
      }
    }
  });
  
  return query;
}

/**
 * Apply search to specific fields
 */
export function applySearch(
  query: any,
  search?: string,
  searchFields: string[] = ['name', 'title', 'description']
) {
  if (!search) return query;
  
  // Use text search if available, otherwise use ilike on multiple fields
  if (searchFields.length === 1) {
    return query.ilike(searchFields[0], `%${search}%`);
  }
  
  // For multiple fields, use or condition
  const searchConditions = searchFields
    .map(field => `${field}.ilike.%${search}%`)
    .join(',');
    
  return query.or(searchConditions);
}

/**
 * Get total count for pagination
 */
export async function getTotalCount(
  supabase: SupabaseClient,
  table: string,
  filters?: FilterParams
): Promise<number> {
  let query = supabase
    .from(table)
    .select('*', { count: 'exact', head: true });
    
  query = applyFilters(query, filters);
  
  const { count, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return count || 0;
}

/**
 * Build a complete list query with pagination, sorting, filtering, and search
 */
export function buildListQuery(
  query: any,
  params: ListQueryParams
) {
  const {
    page = 1,
    limit = 20,
    sort_field,
    sort_direction = 'desc',
    search,
    filters,
  } = params;
  
  // Apply filters
  if (filters) {
    query = applyFilters(query, filters);
  }
  
  // Apply search
  if (search) {
    query = applySearch(query, search);
  }
  
  // Apply sorting
  if (sort_field) {
    query = applySorting(query, {
      field: sort_field,
      direction: sort_direction,
    });
  }
  
  // Apply pagination
  query = applyPagination(query, { page, limit });
  
  return query;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Validate required fields
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): void {
  const missingFields = requiredFields.filter(
    field => data[field] === undefined || data[field] === null || data[field] === ''
  );
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Sanitize data for database insertion
 */
export function sanitizeData<T extends Record<string, unknown>>(
  data: T,
  allowedFields: (keyof T)[]
): Partial<T> {
  const sanitized: Partial<T> = {};
  
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      sanitized[field] = data[field];
    }
  });
  
  return sanitized;
}

/**
 * Convert database record to API response format
 */
export function formatDatabaseRecord<T extends Record<string, unknown>>(
  record: T,
  excludeFields: string[] = ['password', 'secret', 'private_key']
): T {
  const formatted = { ...record };
  
  excludeFields.forEach(field => {
    delete formatted[field];
  });
  
  return formatted;
}

/**
 * Check if user has permission to access resource
 */
export async function checkResourceAccess(
  supabase: SupabaseClient,
  userId: string,
  resourceId: string,
  resourceType: string
): Promise<boolean> {
  // This is a placeholder - implement based on your RLS policies
  // You might check ownership, permissions, or role-based access
  
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user || user.user.id !== userId) {
    return false;
  }
  
  // Add additional permission checks here
  return true;
}