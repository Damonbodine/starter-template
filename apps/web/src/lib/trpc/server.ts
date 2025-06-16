/**
 * tRPC Server Setup
 * Server-side tRPC configuration for Next.js API routes
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { createSupabaseClient } from '@starter-template/database';
import { createDatabaseQueries, createDatabaseMutations } from '@starter-template/database/api';

/**
 * Create context for tRPC requests
 */
export const createTRPCContext = (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  
  // Get auth header
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  
  // Create Supabase client
  const supabase = createSupabaseClient();
  
  // If token exists, set auth
  if (token) {
    supabase.auth.setAuth(token);
  }
  
  // Create database operations
  const queries = createDatabaseQueries(supabase);
  const mutations = createDatabaseMutations(supabase);
  
  return {
    req,
    res,
    supabase,
    queries,
    mutations,
    token,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create tRPC router
 */
export const createTRPCRouter = t.router;

/**
 * Public procedure (no auth required)
 */
export const publicProcedure = t.procedure;

/**
 * Private procedure (auth required)
 */
export const privateProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    const { data: { user }, error } = await ctx.supabase.auth.getUser();
    
    if (error || !user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }
    
    return next({
      ctx: {
        ...ctx,
        user,
      },
    });
  })
);

/**
 * Admin procedure (admin role required)
 */
export const adminProcedure = privateProcedure.use(
  t.middleware(async ({ ctx, next }) => {
    // Get user profile to check role
    const userProfile = await ctx.queries.users.getCurrentUserProfile();
    
    if (!userProfile.data?.preferences?.role || userProfile.data.preferences.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Admin access required',
      });
    }
    
    return next({ ctx });
  })
);

/**
 * Rate limiting middleware
 */
export const rateLimitProcedure = (requestsPerMinute: number = 60) => 
  t.procedure.use(
    t.middleware(async ({ ctx, next }) => {
      // Implement rate limiting logic here
      // For now, we'll just pass through
      // In production, you might use Redis or a similar solution
      
      return next({ ctx });
    })
  );

/**
 * Logging middleware
 */
export const loggedProcedure = t.procedure.use(
  t.middleware(async ({ path, type, next }) => {
    const start = Date.now();
    const result = await next();
    const durationMs = Date.now() - start;
    
    console.log(`${type} ${path} took ${durationMs}ms`);
    
    return result;
  })
);

/**
 * Export tRPC instance
 */
export { t as trpc };