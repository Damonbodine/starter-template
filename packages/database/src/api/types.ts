/**
 * API Types and Schemas
 * Type definitions for API requests and responses
 */

import { z } from 'zod';
import type { User } from '@supabase/supabase-js';

// Base API response type
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Sort and filter types
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: unknown;
}

// User-related API types
export const UserUpdateSchema = z.object({
  email: z.string().email().optional(),
  full_name: z.string().min(1).optional(),
  avatar_url: z.string().url().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  preferences: z.record(z.unknown()).optional(),
});

export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  preferences?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Profile-related API types
export const ProfileCreateSchema = z.object({
  user_id: z.string().uuid(),
  full_name: z.string().min(1),
  avatar_url: z.string().url().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  preferences: z.record(z.unknown()).optional(),
});

export const ProfileUpdateSchema = z.object({
  full_name: z.string().min(1).optional(),
  avatar_url: z.string().url().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  preferences: z.record(z.unknown()).optional(),
});

export type ProfileCreateInput = z.infer<typeof ProfileCreateSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

// Generic list query parameters
export const ListQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sort_field: z.string().optional(),
  sort_direction: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  filters: z.record(z.unknown()).optional(),
});

export type ListQueryParams = z.infer<typeof ListQuerySchema>;

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string = 'DATABASE_ERROR',
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public code: string = 'VALIDATION_ERROR',
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(
    message: string = 'Resource not found',
    public code: string = 'NOT_FOUND',
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(
    message: string = 'Unauthorized access',
    public code: string = 'UNAUTHORIZED',
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}