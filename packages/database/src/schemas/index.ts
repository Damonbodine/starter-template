/**
 * Main schema exports for @starter-template/database
 * 
 * This module provides comprehensive Zod validation schemas for all database entities
 * including runtime validation, type inference, and error handling.
 */

// Re-export all common utilities
export * from './common';

// Re-export all profile schemas and types
export * from './profile';

// Re-export all post schemas and types
export * from './post';

// Re-export all comment schemas and types
export * from './comment';

// Re-export all category schemas and types
export * from './category';

// All schemas are available through the wildcard exports above

// Schema validation utilities
import { z } from 'zod';

/**
 * Validates data against a schema and returns a result object
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag and either data or error
 */
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validates data and throws on error
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated and parsed data
 * @throws ZodError if validation fails
 */
export function parseSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Creates a validation function for a specific schema
 * @param schema - Zod schema to create validator for
 * @returns Validation function
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => validateSchema(schema, data);
}

/**
 * Formats Zod errors into a user-friendly format
 * @param error - ZodError to format
 * @returns Formatted error object with field-specific messages
 */
export function formatValidationError(error: z.ZodError): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};
  
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    const field = path || 'root';
    
    if (!formattedErrors[field]) {
      formattedErrors[field] = [];
    }
    
    formattedErrors[field].push(issue.message);
  }
  
  return formattedErrors;
}

/**
 * Gets the first error message for a field
 * @param error - ZodError to extract from
 * @param field - Field name to get error for
 * @returns First error message for the field, or undefined
 */
export function getFieldError(error: z.ZodError, field: string): string | undefined {
  const issue = error.issues.find(issue => issue.path.join('.') === field);
  return issue?.message;
}

/**
 * Checks if data is valid against a schema without throwing
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns True if valid, false otherwise
 */
export function isValid<T>(schema: z.ZodSchema<T>, data: unknown): data is T {
  return schema.safeParse(data).success;
}

// Collection of commonly used schemas - import from specific modules to avoid circular dependencies
import {
  ProfileSchema,
  ProfileInsertSchema,
  ProfileUpdateSchema,
  ProfileCreateSchema,
  ProfilePublicUpdateSchema,
  ProfileEmailSchema,
} from './profile';

import {
  PostSchema,
  PostInsertSchema,
  PostUpdateSchema,
  PostCreateSchema,
  PostDraftSchema,
  PostPublishSchema,
  PostWithStatsSchema,
  PostSlugSchema,
} from './post';

import {
  CommentSchema,
  CommentInsertSchema,
  CommentUpdateSchema,
  AnonymousCommentSchema,
  AuthenticatedCommentSchema,
  CommentReplySchema,
  CommentWithRepliesSchema,
  CommentContentSchema,
} from './comment';

import {
  CategorySchema,
  CategoryInsertSchema,
  CategoryUpdateSchema,
  CategoryCreateSchema,
  CategoryWithStatsSchema,
  CategoryTreeSchema,
  CategoryNameSchema,
  CategorySlugSchema,
  CategoryHierarchySchema,
} from './category';

// Collection of all main entity schemas for easy access
export const schemas = {
  profile: {
    base: ProfileSchema,
    insert: ProfileInsertSchema,
    update: ProfileUpdateSchema,
    create: ProfileCreateSchema,
    publicUpdate: ProfilePublicUpdateSchema,
  },
  
  post: {
    base: PostSchema,
    insert: PostInsertSchema,
    update: PostUpdateSchema,
    create: PostCreateSchema,
    draft: PostDraftSchema,
    publish: PostPublishSchema,
    withStats: PostWithStatsSchema,
  },
  
  comment: {
    base: CommentSchema,
    insert: CommentInsertSchema,  
    update: CommentUpdateSchema,
    anonymous: AnonymousCommentSchema,
    authenticated: AuthenticatedCommentSchema,
    reply: CommentReplySchema,
    withReplies: CommentWithRepliesSchema,
  },
  
  category: {
    base: CategorySchema,
    insert: CategoryInsertSchema,
    update: CategoryUpdateSchema,
    create: CategoryCreateSchema,
    withStats: CategoryWithStatsSchema,
    tree: CategoryTreeSchema,
  },
} as const;

// Validators for common operations
export const validators = {
  profile: {
    create: createValidator(ProfileCreateSchema),
    update: createValidator(ProfilePublicUpdateSchema),
    email: createValidator(ProfileEmailSchema),
  },
  
  post: {
    create: createValidator(PostCreateSchema),
    draft: createValidator(PostDraftSchema),
    publish: createValidator(PostPublishSchema),
    slug: createValidator(PostSlugSchema),
  },
  
  comment: {
    anonymous: createValidator(AnonymousCommentSchema),
    authenticated: createValidator(AuthenticatedCommentSchema),
    reply: createValidator(CommentReplySchema),
    content: createValidator(CommentContentSchema),
  },
  
  category: {
    create: createValidator(CategoryCreateSchema),
    name: createValidator(CategoryNameSchema),
    slug: createValidator(CategorySlugSchema),
    hierarchy: createValidator(CategoryHierarchySchema),
  },
} as const;