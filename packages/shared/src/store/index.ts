/**
 * State Management Index
 * Exports all state management utilities and hooks
 */

// Query client and utilities
export * from './query-client';

// Zustand stores
export * from './zustand';

// TanStack Query hooks
export * from './queries';

// Optimistic updates
export * from './optimistic';

// Error handling
export * from './error-handling';

// Cache management
export * from './cache';

// Provider components for React apps
export { QueryClient, QueryClientProvider } from '@tanstack/react-query';
export { ReactQueryDevtools } from '@tanstack/react-query-devtools';