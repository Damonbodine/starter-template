/**
 * Main tRPC Router
 * Combines all sub-routers into the main application router
 */

import { createTRPCRouter } from '../server';
import { userRouter } from './user';

/**
 * Main application router
 * Add new routers here as the API grows
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  // Add more routers here as needed:
  // posts: postRouter,
  // comments: commentRouter,
  // etc.
});

// Export the router type for use in client
export type AppRouter = typeof appRouter;