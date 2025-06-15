import { z } from 'zod';
import {
  uuidSchema,
  emailSchema,
  requiredContentSchema,
  shortTextSchema,
  timestampsSchema,
  optionalTimestampsSchema,
  partialTimestampsSchema,
} from './common';

/**
 * Comment validation schemas
 */

// Comment status enum
export const CommentStatusSchema = z.enum(['pending', 'approved', 'rejected'], {
  errorMap: () => ({ message: 'Status must be pending, approved, or rejected' }),
});

// Base comment schema for full comment validation
export const CommentSchema = z.object({
  id: uuidSchema,
  post_id: uuidSchema,
  author_id: uuidSchema.nullable().optional(),
  author_name: shortTextSchema,
  author_email: z.string().email().nullable().optional(),
  content: requiredContentSchema,
  status: CommentStatusSchema,
  parent_id: uuidSchema.nullable().optional(),
}).merge(timestampsSchema);

// Comment insert schema for creation
export const CommentInsertSchema = z.object({
  id: uuidSchema.optional(),
  post_id: uuidSchema,
  author_id: uuidSchema.nullable().optional(),
  author_name: shortTextSchema,
  author_email: z.string().email().nullable().optional(),
  content: requiredContentSchema,
  status: CommentStatusSchema.default('pending'),
  parent_id: uuidSchema.nullable().optional(),
}).merge(optionalTimestampsSchema);

// Comment update schema for updates
export const CommentUpdateSchema = z.object({
  id: uuidSchema.optional(),
  post_id: uuidSchema.optional(),
  author_id: uuidSchema.nullable().optional(),
  author_name: shortTextSchema,
  author_email: z.string().email().nullable().optional(),
  content: z.string().optional(),
  status: CommentStatusSchema.optional(),
  parent_id: uuidSchema.nullable().optional(),
}).merge(partialTimestampsSchema);

// Specific validation schemas for common operations

// Anonymous comment creation (no user account)
export const AnonymousCommentSchema = CommentInsertSchema.extend({
  author_id: z.null(),
  author_name: z
    .string()
    .min(1, { message: 'Name is required for anonymous comments' })
    .max(50, { message: 'Name must be less than 50 characters' })
    .regex(/^[a-zA-Z\s\-'.]+$/, {
      message: 'Name can only contain letters, spaces, hyphens, apostrophes, and periods'
    }),
  author_email: emailSchema,
  content: z
    .string()
    .min(10, { message: 'Comment must be at least 10 characters' })
    .max(2000, { message: 'Comment must be less than 2000 characters' }),
});

// Authenticated user comment creation
export const AuthenticatedCommentSchema = CommentInsertSchema.extend({
  author_id: uuidSchema,
  author_name: z.null().optional(),
  author_email: z.null().optional(),
  content: z
    .string()
    .min(5, { message: 'Comment must be at least 5 characters' })
    .max(5000, { message: 'Comment must be less than 5000 characters' }),
});

// Reply comment schema (has parent_id)
export const CommentReplySchema = CommentInsertSchema.extend({
  parent_id: uuidSchema,
  content: z
    .string()
    .min(1, { message: 'Reply cannot be empty' })
    .max(2000, { message: 'Reply must be less than 2000 characters' }),
});

// Comment content validation with profanity and spam checks
export const CommentContentSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Comment content is required' })
    .max(5000, { message: 'Comment must be less than 5000 characters' })
    .refine(
      (content) => {
        // Basic spam detection - repeated characters
        const repeatedPattern = /(.)\1{10,}/; // 10+ repeated characters
        return !repeatedPattern.test(content);
      },
      { message: 'Comment appears to contain spam (repeated characters)' }
    )
    .refine(
      (content) => {
        // Basic profanity filter - in real app, use proper profanity filter
        const profanityList = ['spam', 'scam', 'viagra', 'casino'];
        const lowerContent = content.toLowerCase();
        return !profanityList.some(word => lowerContent.includes(word));
      },
      { message: 'Comment contains inappropriate content' }
    )
    .refine(
      (content) => {
        // Check for excessive links
        const linkPattern = /https?:\/\/[^\s]+/g;
        const links = content.match(linkPattern) || [];
        return links.length <= 2; // Max 2 links per comment
      },
      { message: 'Comment contains too many links (maximum 2 allowed)' }
    )
    .refine(
      (content) => {
        // Check for excessive capital letters
        const upperCaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
        return upperCaseRatio <= 0.5; // Max 50% uppercase
      },
      { message: 'Comment contains excessive capital letters' }
    ),
});

// Author name validation for anonymous comments
export const CommentAuthorNameSchema = z.object({
  author_name: z
    .string()
    .min(1, { message: 'Author name is required' })
    .max(50, { message: 'Author name must be less than 50 characters' })
    .regex(/^[a-zA-Z\s\-'.]+$/, {
      message: 'Author name can only contain letters, spaces, hyphens, apostrophes, and periods'
    })
    .refine(
      (name) => {
        // Check for common spam names
        const spamNames = ['admin', 'administrator', 'moderator', 'test', 'guest'];
        return !spamNames.includes(name.toLowerCase());
      },
      { message: 'This name is not allowed' }
    )
    .nullable()
    .optional(),
});

// Author email validation for anonymous comments
export const CommentAuthorEmailSchema = z.object({
  author_email: emailSchema
    .refine(
      (email) => {
        if (!email) return true;
        // Check for disposable email domains
        const disposableDomains = [
          '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
          'mailinator.com', 'throwaway.email'
        ];
        const domain = email.split('@')[1]?.toLowerCase();
        return domain && !disposableDomains.includes(domain);
      },
      { message: 'Disposable email addresses are not allowed' }
    )
    .nullable()
    .optional(),
});

// Comment moderation schema
export const CommentModerationSchema = z.object({
  id: uuidSchema,
  status: CommentStatusSchema,
  moderator_note: z
    .string()
    .max(500, { message: 'Moderator note must be less than 500 characters' })
    .optional(),
});

// Comment filter schema for queries
export const CommentFilterSchema = z.object({
  post_id: uuidSchema.optional(),
  author_id: uuidSchema.optional(),
  status: CommentStatusSchema.optional(),
  parent_id: uuidSchema.nullable().optional(),
  is_reply: z.boolean().optional(), // Filter for replies vs top-level comments
});

// Comment sorting schema
export const CommentSortSchema = z.object({
  field: z.enum(['created_at', 'updated_at']).default('created_at'),
  direction: z.enum(['asc', 'desc']).default('asc'), // Usually oldest first for comments
});

// Comment with replies schema (nested structure)
export const CommentWithRepliesSchema: z.ZodSchema<any> = CommentSchema.extend({
  replies: z.array(z.lazy(() => CommentWithRepliesSchema)).optional(),
  reply_count: z.number().int().min(0).default(0),
  author_avatar: z.string().url().nullable().optional(),
  can_edit: z.boolean().default(false),
  can_delete: z.boolean().default(false),
});

// Define type separately to avoid circular reference issues
export type CommentWithReplies = z.infer<typeof CommentSchema> & {
  replies?: CommentWithReplies[];
  reply_count: number;
  author_avatar?: string | null;
  can_edit: boolean;
  can_delete: boolean;
};

// Comment thread schema (for displaying comment trees)
export const CommentThreadSchema = z.object({
  post_id: uuidSchema,
  comments: z.array(CommentWithRepliesSchema),
  total_count: z.number().int().min(0),
  approved_count: z.number().int().min(0),
});

// Export types for TypeScript
export type Comment = z.infer<typeof CommentSchema>;
export type CommentInsert = z.infer<typeof CommentInsertSchema>;
export type CommentUpdate = z.infer<typeof CommentUpdateSchema>;
export type AnonymousComment = z.infer<typeof AnonymousCommentSchema>;
export type AuthenticatedComment = z.infer<typeof AuthenticatedCommentSchema>;
export type CommentReply = z.infer<typeof CommentReplySchema>;
export type CommentStatus = z.infer<typeof CommentStatusSchema>;
export type CommentModeration = z.infer<typeof CommentModerationSchema>;
export type CommentFilter = z.infer<typeof CommentFilterSchema>;
export type CommentSort = z.infer<typeof CommentSortSchema>;
export type CommentThread = z.infer<typeof CommentThreadSchema>;