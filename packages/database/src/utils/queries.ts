import { supabase } from '../client';
import type { Database, Tables, TablesInsert, TablesUpdate } from '../types/database';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

// Generic table names type
type TableName = keyof Database['public']['Tables'];

// Pagination options
export interface PaginationOptions {
  page: number;
  limit: number;
}

// Pagination result
export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Sort options
export interface SortOptions {
  column: string;
  ascending?: boolean;
}

// Filter options
export interface FilterOptions {
  [key: string]: any;
}

// Search options
export interface SearchOptions {
  columns: string[];
  query: string;
}

/**
 * Generic CRUD Operations
 */

// Create a new record
export async function create<T extends TableName>(
  table: T,
  data: TablesInsert<T>
): Promise<Tables<T>> {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result as Tables<T>;
  } catch (error) {
    console.error(`Error creating record in ${table}:`, error);
    throw error;
  }
}

// Read a single record by ID
export async function findById<T extends TableName>(
  table: T,
  id: string
): Promise<Tables<T> | null> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data as Tables<T> | null;
  } catch (error) {
    console.error(`Error finding record in ${table}:`, error);
    throw error;
  }
}

// Read multiple records with optional filtering and sorting
export async function findMany<T extends TableName>(
  table: T,
  options?: {
    filters?: FilterOptions;
    sort?: SortOptions;
    limit?: number;
    select?: string;
  }
): Promise<Tables<T>[]> {
  try {
    let query = supabase.from(table).select(options?.select || '*');

    // Apply filters
    if (options?.filters) {
      query = applyFilters(query, options.filters);
    }

    // Apply sorting
    if (options?.sort) {
      query = query.order(options.sort.column, { 
        ascending: options.sort.ascending ?? true 
      });
    }

    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data as Tables<T>[]) || [];
  } catch (error) {
    console.error(`Error finding records in ${table}:`, error);
    throw error;
  }
}

// Update a record by ID
export async function updateById<T extends TableName>(
  table: T,
  id: string,
  updates: TablesUpdate<T>
): Promise<Tables<T>> {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Tables<T>;
  } catch (error) {
    console.error(`Error updating record in ${table}:`, error);
    throw error;
  }
}

// Delete a record by ID
export async function deleteById<T extends TableName>(
  table: T,
  id: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting record in ${table}:`, error);
    throw error;
  }
}

/**
 * Pagination Helpers
 */

// Get paginated results
export async function findWithPagination<T extends TableName>(
  table: T,
  options: PaginationOptions & {
    filters?: FilterOptions;
    sort?: SortOptions;
    select?: string;
  }
): Promise<PaginatedResult<Tables<T>>> {
  try {
    const { page, limit, filters, sort, select } = options;
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase.from(table).select(select || '*', { count: 'exact' });

    // Apply filters
    if (filters) {
      query = applyFilters(query, filters);
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.column, { ascending: sort.ascending ?? true });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: (data as Tables<T>[]) || [],
      count: count || 0,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  } catch (error) {
    console.error(`Error paginating records in ${table}:`, error);
    throw error;
  }
}

/**
 * Search Utilities
 */

// Text search across multiple columns
export async function textSearch<T extends TableName>(
  table: T,
  searchOptions: SearchOptions,
  options?: {
    filters?: FilterOptions;
    sort?: SortOptions;
    limit?: number;
  }
): Promise<Tables<T>[]> {
  try {
    let query = supabase.from(table).select('*');

    // Apply text search using ilike (case-insensitive LIKE)
    const searchConditions = searchOptions.columns.map(column => 
      `${column}.ilike.%${searchOptions.query}%`
    ).join(',');

    query = query.or(searchConditions);

    // Apply additional filters
    if (options?.filters) {
      query = applyFilters(query, options.filters);
    }

    // Apply sorting
    if (options?.sort) {
      query = query.order(options.sort.column, { 
        ascending: options.sort.ascending ?? true 
      });
    }

    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data as Tables<T>[]) || [];
  } catch (error) {
    console.error(`Error searching records in ${table}:`, error);
    throw error;
  }
}

/**
 * Filtering and Sorting Helpers
 */

// Apply filters to a query
function applyFilters<T extends Record<string, unknown>>(
  query: PostgrestFilterBuilder<any, T, any>,
  filters: FilterOptions
): PostgrestFilterBuilder<any, T, any> {
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else if (typeof value === 'object' && value.operator) {
        // Support for complex filters like { operator: 'gte', value: 10 }
        const { operator, value: filterValue } = value;
        query = query.filter(key, operator, filterValue);
      } else {
        query = query.eq(key, value);
      }
    }
  });
  return query;
}

// Range filter helper
export function rangeFilter(operator: 'gte' | 'lte' | 'gt' | 'lt', value: any) {
  return { operator, value };
}

/**
 * Bulk Operations
 */

// Bulk insert records
export async function bulkCreate<T extends TableName>(
  table: T,
  data: TablesInsert<T>[]
): Promise<Tables<T>[]> {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error) throw error;
    return (result as Tables<T>[]) || [];
  } catch (error) {
    console.error(`Error bulk creating records in ${table}:`, error);
    throw error;
  }
}

// Bulk update records by IDs
export async function bulkUpdateByIds<T extends TableName>(
  table: T,
  ids: string[],
  updates: TablesUpdate<T>
): Promise<Tables<T>[]> {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .in('id', ids)
      .select();

    if (error) throw error;
    return (data as Tables<T>[]) || [];
  } catch (error) {
    console.error(`Error bulk updating records in ${table}:`, error);
    throw error;
  }
}

// Bulk delete records by IDs
export async function bulkDeleteByIds<T extends TableName>(
  table: T,
  ids: string[]
): Promise<void> {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .in('id', ids);

    if (error) throw error;
  } catch (error) {
    console.error(`Error bulk deleting records in ${table}:`, error);
    throw error;
  }
}

/**
 * Count Operations
 */

// Count records with optional filters
export async function count<T extends TableName>(
  table: T,
  filters?: FilterOptions
): Promise<number> {
  try {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });

    if (filters) {
      query = applyFilters(query, filters);
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error(`Error counting records in ${table}:`, error);
    throw error;
  }
}

/**
 * Relationship Operations
 */

// Find records with related data
export async function findWithRelations<T extends TableName>(
  table: T,
  select: string,
  options?: {
    filters?: FilterOptions;
    sort?: SortOptions;
    limit?: number;
  }
): Promise<any[]> {
  try {
    let query = supabase.from(table).select(select);

    // Apply filters
    if (options?.filters) {
      query = applyFilters(query, options.filters);
    }

    // Apply sorting
    if (options?.sort) {
      query = query.order(options.sort.column, { 
        ascending: options.sort.ascending ?? true 
      });
    }

    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error finding records with relations in ${table}:`, error);
    throw error;
  }
}

/**
 * Utility Functions
 */

// Check if a record exists
export async function exists<T extends TableName>(
  table: T,
  id: string
): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('id', id);

    if (error) throw error;
    return (count || 0) > 0;
  } catch (error) {
    console.error(`Error checking if record exists in ${table}:`, error);
    throw error;
  }
}

// Get the first record matching filters
export async function findFirst<T extends TableName>(
  table: T,
  options?: {
    filters?: FilterOptions;
    sort?: SortOptions;
    select?: string;
  }
): Promise<Tables<T> | null> {
  try {
    let query = supabase.from(table).select(options?.select || '*').limit(1);

    // Apply filters
    if (options?.filters) {
      query = applyFilters(query, options.filters);
    }

    // Apply sorting
    if (options?.sort) {
      query = query.order(options.sort.column, { 
        ascending: options.sort.ascending ?? true 
      });
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data as Tables<T> | null;
  } catch (error) {
    console.error(`Error finding first record in ${table}:`, error);
    throw error;
  }
}