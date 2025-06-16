/**
 * API Error Handling
 * Error utilities and handlers for database operations
 */

import { PostgrestError } from '@supabase/supabase-js';
import { 
  ApiError, 
  DatabaseError, 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError 
} from './types';

// Re-export error classes for external use
export { 
  DatabaseError, 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError 
};

// Error code mappings
export const ERROR_CODES = {
  // Database errors
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  CHECK_VIOLATION: '23514',
  NOT_NULL_VIOLATION: '23502',
  
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Generic errors
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

// Error message mappings
export const ERROR_MESSAGES = {
  [ERROR_CODES.UNIQUE_VIOLATION]: 'Resource already exists',
  [ERROR_CODES.FOREIGN_KEY_VIOLATION]: 'Referenced resource does not exist',
  [ERROR_CODES.CHECK_VIOLATION]: 'Data validation failed',
  [ERROR_CODES.NOT_NULL_VIOLATION]: 'Required field is missing',
  [ERROR_CODES.UNAUTHORIZED]: 'Authentication required',
  [ERROR_CODES.FORBIDDEN]: 'Insufficient permissions',
  [ERROR_CODES.VALIDATION_ERROR]: 'Input validation failed',
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input provided',
  [ERROR_CODES.NOT_FOUND]: 'Resource not found',
  [ERROR_CODES.INTERNAL_ERROR]: 'Internal server error',
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection failed',
} as const;

/**
 * Convert Supabase error to our custom error types
 */
export function handleSupabaseError(error: PostgrestError | Error): never {
  const timestamp = new Date().toISOString();
  
  // Handle PostgrestError (Supabase database errors)
  if ('code' in error && 'details' in error) {
    const postgrestError = error as PostgrestError;
    
    switch (postgrestError.code) {
      case ERROR_CODES.UNIQUE_VIOLATION:
        throw new ValidationError(
          ERROR_MESSAGES[ERROR_CODES.UNIQUE_VIOLATION],
          ERROR_CODES.UNIQUE_VIOLATION,
          { original: postgrestError, timestamp }
        );
        
      case ERROR_CODES.FOREIGN_KEY_VIOLATION:
        throw new ValidationError(
          ERROR_MESSAGES[ERROR_CODES.FOREIGN_KEY_VIOLATION],
          ERROR_CODES.FOREIGN_KEY_VIOLATION,
          { original: postgrestError, timestamp }
        );
        
      case ERROR_CODES.CHECK_VIOLATION:
        throw new ValidationError(
          ERROR_MESSAGES[ERROR_CODES.CHECK_VIOLATION],
          ERROR_CODES.CHECK_VIOLATION,
          { original: postgrestError, timestamp }
        );
        
      case ERROR_CODES.NOT_NULL_VIOLATION:
        throw new ValidationError(
          ERROR_MESSAGES[ERROR_CODES.NOT_NULL_VIOLATION],
          ERROR_CODES.NOT_NULL_VIOLATION,
          { original: postgrestError, timestamp }
        );
        
      default:
        throw new DatabaseError(
          postgrestError.message || 'Database operation failed',
          postgrestError.code || ERROR_CODES.INTERNAL_ERROR,
          { original: postgrestError, timestamp }
        );
    }
  }
  
  // Handle generic errors
  if (error.message.includes('not found')) {
    throw new NotFoundError(
      error.message,
      ERROR_CODES.NOT_FOUND,
      { original: error, timestamp }
    );
  }
  
  if (error.message.includes('unauthorized') || error.message.includes('auth')) {
    throw new UnauthorizedError(
      error.message,
      ERROR_CODES.UNAUTHORIZED,
      { original: error, timestamp }
    );
  }
  
  // Default to database error
  throw new DatabaseError(
    error.message || 'An unexpected error occurred',
    ERROR_CODES.INTERNAL_ERROR,
    { original: error, timestamp }
  );
}

/**
 * Create a standardized API error response
 */
export function createApiError(
  error: Error,
  code?: string,
  details?: Record<string, unknown>
): ApiError {
  return {
    code: code || ERROR_CODES.INTERNAL_ERROR,
    message: error.message,
    details: {
      ...details,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Wrap async functions with error handling
 */
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof DatabaseError || 
          error instanceof ValidationError || 
          error instanceof NotFoundError || 
          error instanceof UnauthorizedError) {
        throw error;
      }
      
      // Convert unknown errors to our error types
      if (error && typeof error === 'object' && 'code' in error) {
        handleSupabaseError(error as PostgrestError);
      }
      
      throw new DatabaseError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        ERROR_CODES.INTERNAL_ERROR,
        { original: error, timestamp: new Date().toISOString() }
      );
    }
  };
}

/**
 * Type guard to check if error is a known API error
 */
export function isApiError(error: unknown): error is DatabaseError | ValidationError | NotFoundError | UnauthorizedError {
  return error instanceof DatabaseError ||
         error instanceof ValidationError ||
         error instanceof NotFoundError ||
         error instanceof UnauthorizedError;
}

/**
 * Extract error details for logging
 */
export function getErrorDetails(error: unknown): Record<string, unknown> {
  if (isApiError(error)) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
    };
  }
  
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  
  return {
    error: String(error),
  };
}