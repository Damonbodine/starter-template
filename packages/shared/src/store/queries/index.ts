/**
 * Query Hooks Index
 * Exports all query hooks and utilities
 */

// Query client and utilities
export * from '../query-client';

// User queries
export * from './user-queries';

// Post queries
export * from './post-queries';

// Common query hooks and utilities
export { useQueryClient } from '@tanstack/react-query';