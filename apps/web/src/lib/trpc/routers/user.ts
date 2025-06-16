/**
 * User Router
 * tRPC routes for user-related operations
 */

import { z } from 'zod';
import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
  rateLimitProcedure,
} from '../server';
import {
  ProfileCreateSchema,
  ProfileUpdateSchema,
  ListQuerySchema,
} from '@starter-template/database/api';

export const userRouter = createTRPCRouter({
  /**
   * Get current user profile
   */
  getCurrentProfile: privateProcedure
    .query(async ({ ctx }) => {
      return ctx.queries.users.getCurrentUserProfile();
    }),

  /**
   * Get user profile by ID
   */
  getProfile: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return ctx.queries.users.getUserProfile(input.userId);
    }),

  /**
   * Search user profiles
   */
  searchProfiles: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        params: ListQuerySchema.partial().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      return ctx.queries.users.searchUserProfiles(input.query, input.params);
    }),

  /**
   * Get user profiles by IDs
   */
  getProfilesByIds: publicProcedure
    .input(z.object({ userIds: z.array(z.string().uuid()) }))
    .query(async ({ input, ctx }) => {
      return ctx.queries.users.getUserProfilesByIds(input.userIds);
    }),

  /**
   * Check if user profile exists
   */
  checkProfileExists: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return ctx.queries.users.checkUserProfileExists(input.userId);
    }),

  /**
   * Create user profile
   */
  createProfile: privateProcedure
    .input(ProfileCreateSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.mutations.users.createUserProfile(input);
    }),

  /**
   * Update current user profile
   */
  updateCurrentProfile: privateProcedure
    .input(ProfileUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.mutations.users.updateCurrentUserProfile(input);
    }),

  /**
   * Update user profile by ID (admin only)
   */
  updateProfile: privateProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        data: ProfileUpdateSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.mutations.users.updateUserProfile(input.userId, input.data);
    }),

  /**
   * Delete current user profile
   */
  deleteCurrentProfile: privateProcedure
    .mutation(async ({ ctx }) => {
      return ctx.mutations.users.deleteUserProfile(ctx.user.id);
    }),

  /**
   * Delete user profile by ID (admin only)
   */
  deleteProfile: privateProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.mutations.users.deleteUserProfile(input.userId);
    }),

  /**
   * Upload user avatar
   */
  uploadAvatar: rateLimitProcedure(10) // 10 uploads per minute
    .use(privateProcedure._def.middlewares[0]) // Apply auth middleware
    .input(
      z.object({
        userId: z.string().uuid(),
        file: z.any(), // File will be handled differently in the API route
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.mutations.users.uploadUserAvatar(input.userId, input.file);
    }),
});