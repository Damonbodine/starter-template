/**
 * tRPC API Handler
 * Next.js API route that handles all tRPC requests
 */

import { createNextApiHandler } from '@trpc/server/adapters/next';
import { createTRPCContext } from '../../../src/lib/trpc/server';
import { appRouter } from '../../../src/lib/trpc/routers';

// Export type definition of API
export type AppRouter = typeof appRouter;

// Export the Next.js API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    process.env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
          );
        }
      : undefined,
});