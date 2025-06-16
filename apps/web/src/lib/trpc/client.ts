/**
 * tRPC Client Setup
 * Client-side tRPC configuration for React components
 */

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { type AppRouter } from '../../../pages/api/trpc/[trpc]';
import superjson from 'superjson';

/**
 * Create tRPC React hooks
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get base URL for API calls
 */
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative url
    return '';
  }
  if (process.env.VERCEL_URL) {
    // SSR should use vercel url
    return `https://${process.env.VERCEL_URL}`;
  }
  // Dev SSR should use localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * Create tRPC client
 */
export function createTRPCClient() {
  return trpc.createClient({
    transformer: superjson,
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        headers() {
          // Get auth token from localStorage or cookies
          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('supabase.auth.token');
            if (token) {
              try {
                const parsed = JSON.parse(token);
                return {
                  Authorization: `Bearer ${parsed.access_token}`,
                };
              } catch {
                // Invalid token format
              }
            }
          }
          return {};
        },
      }),
    ],
  });
}

/**
 * Export the router type for use in other files
 */
export type { AppRouter };