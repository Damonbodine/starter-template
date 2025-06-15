import { z } from 'zod';
import {
  uuidSchema,
  nameSchema,
  slugSchema,
  descriptionSchema,
  colorSchema,
  iconSchema,
  sortOrderSchema,
  timestampsSchema,
  optionalTimestampsSchema,
  partialTimestampsSchema,
} from './common';

/**
 * Category validation schemas
 */

// Base category schema for full category validation
export const CategorySchema = z.object({
  id: uuidSchema,
  name: nameSchema,
  slug: slugSchema,
  description: descriptionSchema,
  color: colorSchema,
  icon: iconSchema,
  parent_id: uuidSchema.nullable().optional(),
  sort_order: sortOrderSchema,
}).merge(timestampsSchema);

// Category insert schema for creation
export const CategoryInsertSchema = z.object({
  id: uuidSchema.optional(),
  name: nameSchema,
  slug: slugSchema,
  description: descriptionSchema,
  color: colorSchema,
  icon: iconSchema,
  parent_id: uuidSchema.nullable().optional(),
  sort_order: sortOrderSchema,
}).merge(optionalTimestampsSchema);

// Category update schema for updates
export const CategoryUpdateSchema = z.object({
  id: uuidSchema.optional(),
  name: nameSchema.optional(),
  slug: slugSchema.optional(),
  description: descriptionSchema,
  color: colorSchema,
  icon: iconSchema,
  parent_id: uuidSchema.nullable().optional(),
  sort_order: sortOrderSchema.optional(),
}).merge(partialTimestampsSchema);

// Specific validation schemas for common operations

// Category creation with required fields
export const CategoryCreateSchema = CategoryInsertSchema.pick({
  name: true,
  slug: true,
}).extend({
  description: descriptionSchema,
  parent_id: uuidSchema.nullable().optional(),
});

// Category name validation with specific rules
export const CategoryNameSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Category name is required' })
    .max(50, { message: 'Category name must be less than 50 characters' })
    .regex(/^[a-zA-Z0-9\s\-&.()]+$/, {
      message: 'Category name can only contain letters, numbers, spaces, hyphens, ampersands, periods, and parentheses'
    })
    .refine(
      (name) => {
        // Check for reserved category names
        const reservedNames = [
          'all', 'none', 'admin', 'root', 'system', 'default',
          'uncategorized', 'misc', 'other', 'general'
        ];
        return !reservedNames.includes(name.toLowerCase());
      },
      { message: 'This category name is reserved' }
    ),
});

// Category slug validation with uniqueness considerations
export const CategorySlugSchema = z.object({
  slug: slugSchema.refine(
    (slug) => {
      // Reserved slugs for categories
      const reservedSlugs = [
        'all', 'admin', 'api', 'category', 'categories', 'tag', 'tags',
        'post', 'posts', 'page', 'pages', 'search', 'archive', 'feed',
        'rss', 'atom', 'sitemap', 'robots', 'humans'
      ];
      return !reservedSlugs.includes(slug.toLowerCase());
    },
    { message: 'This slug is reserved and cannot be used' }
  ),
});

// Category hierarchy validation to prevent circular references
export const CategoryHierarchySchema = z.object({
  id: uuidSchema,
  parent_id: uuidSchema.nullable().optional(),
}).refine(
  (data) => {
    // Can't be parent of itself
    return data.id !== data.parent_id;
  },
  { message: 'Category cannot be its own parent' }
);

// Category color validation with predefined palette
export const CategoryColorSchema = z.object({
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: 'Color must be a valid hex color (e.g., #FF0000 or #F00)'
    })
    .nullable()
    .optional(),
});

// Category icon validation
export const CategoryIconSchema = z.object({
  icon: z
    .string()
    .min(1, { message: 'Icon cannot be empty' })
    .max(50, { message: 'Icon must be less than 50 characters' })
    .regex(/^[a-zA-Z0-9\-_:]+$/, {
      message: 'Icon must be a valid icon name (letters, numbers, hyphens, underscores, colons)'
    })
    .nullable()
    .optional(),
});

// Category with post count (for admin/stats views)
export const CategoryWithStatsSchema = CategorySchema.extend({
  post_count: z.number().int().min(0).default(0),
  published_post_count: z.number().int().min(0).default(0),
  draft_post_count: z.number().int().min(0).default(0),
  subcategory_count: z.number().int().min(0).default(0),
});

// Category tree structure for hierarchical display
export const CategoryTreeSchema: z.ZodSchema<any> = CategorySchema.extend({
  children: z.array(z.lazy(() => CategoryTreeSchema)).optional(),
  depth: z.number().int().min(0).default(0),
  has_children: z.boolean().default(false),
  full_path: z.string().optional(), // e.g., "Technology > Web Development > JavaScript"
});

// Define type separately to avoid circular reference issues
export type CategoryTree = z.infer<typeof CategorySchema> & {
  children?: CategoryTree[];
  depth: number;
  has_children: boolean;
  full_path?: string;
};

// Category filter schema for queries
export const CategoryFilterSchema = z.object({
  parent_id: uuidSchema.nullable().optional(),
  has_posts: z.boolean().optional(),
  is_root: z.boolean().optional(), // Categories with no parent
  color: z.string().optional(),
});

// Category sorting schema
export const CategorySortSchema = z.object({
  field: z.enum(['name', 'slug', 'sort_order', 'created_at', 'post_count']).default('sort_order'),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

// Post-Category relationship schema
export const PostCategorySchema = z.object({
  post_id: uuidSchema,
  category_id: uuidSchema,
  created_at: z.string().datetime().optional(),
});

// Category assignment schema (for assigning categories to posts)
export const CategoryAssignmentSchema = z.object({
  post_id: uuidSchema,
  category_ids: z
    .array(uuidSchema)
    .min(1, { message: 'At least one category must be selected' })
    .max(5, { message: 'Maximum 5 categories allowed per post' }),
});

// Category breadcrumb schema
export const CategoryBreadcrumbSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  slug: z.string(),
  level: z.number().int().min(0),
});

// Category with breadcrumbs
export const CategoryWithBreadcrumbsSchema = CategorySchema.extend({
  breadcrumbs: z.array(CategoryBreadcrumbSchema),
  parent_category: CategorySchema.nullable().optional(),
});

// Export types for TypeScript
export type Category = z.infer<typeof CategorySchema>;
export type CategoryInsert = z.infer<typeof CategoryInsertSchema>;
export type CategoryUpdate = z.infer<typeof CategoryUpdateSchema>;
export type CategoryCreate = z.infer<typeof CategoryCreateSchema>;
export type CategoryWithStats = z.infer<typeof CategoryWithStatsSchema>;
export type CategoryFilter = z.infer<typeof CategoryFilterSchema>;
export type CategorySort = z.infer<typeof CategorySortSchema>;
export type PostCategory = z.infer<typeof PostCategorySchema>;
export type CategoryAssignment = z.infer<typeof CategoryAssignmentSchema>;
export type CategoryBreadcrumb = z.infer<typeof CategoryBreadcrumbSchema>;
export type CategoryWithBreadcrumbs = z.infer<typeof CategoryWithBreadcrumbsSchema>;