import { z } from 'zod';
import {
  uuidSchema,
  slugSchema,
  titleSchema,
  contentSchema,
  requiredContentSchema,
  excerptSchema,
  optionalUrlSchema,
  tagsSchema,
  jsonSchema,
  timestampsSchema,
  optionalTimestampsSchema,
  partialTimestampsSchema,
  optionalIsoDateSchema,
} from './common';

/**
 * Post validation schemas
 */

// Post status enum
export const PostStatusSchema = z.enum(['draft', 'published', 'archived'], {
  errorMap: () => ({ message: 'Status must be draft, published, or archived' }),
});

// Base post schema for full post validation
export const PostSchema = z.object({
  id: uuidSchema,
  title: titleSchema,
  slug: slugSchema,
  content: contentSchema,
  excerpt: excerptSchema,
  status: PostStatusSchema,
  author_id: uuidSchema,
  featured_image: optionalUrlSchema,
  tags: tagsSchema,
  metadata: jsonSchema,
  published_at: optionalIsoDateSchema,
}).merge(timestampsSchema);

// Post insert schema for creation
export const PostInsertSchema = z.object({
  id: uuidSchema.optional(),
  title: titleSchema,
  slug: slugSchema,
  content: contentSchema,
  excerpt: excerptSchema,
  status: PostStatusSchema.default('draft'),
  author_id: uuidSchema,
  featured_image: optionalUrlSchema,
  tags: tagsSchema,
  metadata: jsonSchema,
  published_at: optionalIsoDateSchema,
}).merge(optionalTimestampsSchema);

// Post update schema for updates
export const PostUpdateSchema = z.object({
  id: uuidSchema.optional(),
  title: titleSchema.optional(),
  slug: slugSchema.optional(),
  content: contentSchema,
  excerpt: excerptSchema,
  status: PostStatusSchema.optional(),
  author_id: uuidSchema.optional(),
  featured_image: optionalUrlSchema,
  tags: tagsSchema,
  metadata: jsonSchema,
  published_at: optionalIsoDateSchema,
}).merge(partialTimestampsSchema);

// Specific validation schemas for common operations

// Post creation with required fields
export const PostCreateSchema = PostInsertSchema.pick({
  title: true,
  slug: true,
  author_id: true,
}).extend({
  content: contentSchema,
  status: PostStatusSchema.default('draft'),
});

// Post draft schema (minimal requirements for drafts)
export const PostDraftSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .max(200, { message: 'Title must be less than 200 characters' }),
  author_id: uuidSchema,
  slug: slugSchema.optional(),
  content: contentSchema,
  status: z.literal('draft'),
});

// Post publish schema (stricter requirements for published posts)
export const PostPublishSchema = PostInsertSchema.extend({
  title: titleSchema,
  slug: slugSchema,
  content: requiredContentSchema,
  excerpt: z
    .string()
    .min(10, { message: 'Excerpt must be at least 10 characters for published posts' })
    .max(300, { message: 'Excerpt must be less than 300 characters' })
    .nullable()
    .optional(),
  status: z.literal('published'),
  published_at: z
    .string()
    .datetime({ message: 'Published date must be a valid ISO date' })
    .optional()
    .default(() => new Date().toISOString()),
});

// Slug validation with uniqueness check placeholder
export const PostSlugSchema = z.object({
  slug: slugSchema.refine(
    (slug) => {
      // Reserved slugs that shouldn't be used
      const reservedSlugs = [
        'admin', 'api', 'www', 'mail', 'ftp', 'blog', 'news',
        'about', 'contact', 'help', 'support', 'terms', 'privacy',
        'login', 'register', 'signup', 'signin', 'logout', 'dashboard',
        'profile', 'settings', 'account', 'user', 'users', 'post', 'posts'
      ];
      return !reservedSlugs.includes(slug.toLowerCase());
    },
    { message: 'This slug is reserved and cannot be used' }
  ),
});

// Featured image validation with specific requirements
export const PostFeaturedImageSchema = z.object({
  featured_image: z
    .string()
    .url({ message: 'Featured image must be a valid URL' })
    .refine(
      (url) => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const lowerUrl = url.toLowerCase();
        return imageExtensions.some(ext => lowerUrl.endsWith(ext)) ||
               lowerUrl.includes('image') ||
               lowerUrl.includes('photo') ||
               lowerUrl.includes('img');
      },
      { message: 'Featured image URL should point to an image file' }
    )
    .nullable()
    .optional(),
});

// Tag validation for posts
export const PostTagsSchema = z.object({
  tags: z
    .array(
      z
        .string()
        .min(1, { message: 'Tag cannot be empty' })
        .max(30, { message: 'Tag must be less than 30 characters' })
        .regex(/^[a-zA-Z0-9\s-]+$/, {
          message: 'Tag can only contain letters, numbers, spaces, and hyphens'
        })
        .transform(tag => tag.toLowerCase().trim())
    )
    .max(5, { message: 'Maximum 5 tags allowed per post' })
    .refine(
      (tags) => {
        if (!tags) return true;
        // Check for duplicate tags
        const uniqueTags = new Set(tags);
        return uniqueTags.size === tags.length;
      },
      { message: 'Duplicate tags are not allowed' }
    )
    .nullable()
    .optional(),
});

// Post metadata validation
export const PostMetadataSchema = z.object({
  metadata: z
    .record(z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .refine(
      (metadata) => {
        if (!metadata) return true;
        // Check metadata size (as JSON string)
        const jsonString = JSON.stringify(metadata);
        return jsonString.length <= 10000; // 10KB limit
      },
      { message: 'Metadata is too large (max 10KB)' }
    )
    .nullable()
    .optional(),
});

// Post search/filter schemas
export const PostFilterSchema = z.object({
  status: PostStatusSchema.optional(),
  author_id: uuidSchema.optional(),
  tags: z.array(z.string()).optional(),
  published_after: z.string().datetime().optional(),
  published_before: z.string().datetime().optional(),
});

// Post sorting schema
export const PostSortSchema = z.object({
  field: z.enum(['created_at', 'updated_at', 'published_at', 'title']).default('created_at'),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

// Post pagination schema
export const PostPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// Post with stats (for views that include comment counts, etc.)
export const PostWithStatsSchema = PostSchema.extend({
  author_name: z.string().nullable().optional(),
  comment_count: z.number().int().min(0).default(0),
  approved_comment_count: z.number().int().min(0).default(0),
  category_count: z.number().int().min(0).default(0),
});

// Export types for TypeScript
export type Post = z.infer<typeof PostSchema>;
export type PostInsert = z.infer<typeof PostInsertSchema>;
export type PostUpdate = z.infer<typeof PostUpdateSchema>;
export type PostCreate = z.infer<typeof PostCreateSchema>;
export type PostDraft = z.infer<typeof PostDraftSchema>;
export type PostPublish = z.infer<typeof PostPublishSchema>;
export type PostStatus = z.infer<typeof PostStatusSchema>;
export type PostFilter = z.infer<typeof PostFilterSchema>;
export type PostSort = z.infer<typeof PostSortSchema>;
export type PostPagination = z.infer<typeof PostPaginationSchema>;
export type PostWithStats = z.infer<typeof PostWithStatsSchema>;