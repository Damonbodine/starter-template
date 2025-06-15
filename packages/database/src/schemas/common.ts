import { z } from 'zod';

/**
 * Common validation utilities and shared schemas
 */

// UUID validation
export const uuidSchema = z
  .string()
  .uuid({ message: 'Invalid UUID format' });

// Email validation
export const emailSchema = z
  .string()
  .email({ message: 'Invalid email address' })
  .min(1, { message: 'Email is required' })
  .max(254, { message: 'Email must be less than 254 characters' });

// URL validation
export const urlSchema = z
  .string()
  .url({ message: 'Invalid URL format' })
  .max(2048, { message: 'URL must be less than 2048 characters' });

// Optional URL validation (allows null/undefined)
export const optionalUrlSchema = z
  .string()
  .url({ message: 'Invalid URL format' })
  .max(2048, { message: 'URL must be less than 2048 characters' })
  .nullable()
  .optional();

// Slug validation - alphanumeric with hyphens
export const slugSchema = z
  .string()
  .min(1, { message: 'Slug is required' })
  .max(100, { message: 'Slug must be less than 100 characters' })
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens'
  });

// ISO date string validation
export const isoDateSchema = z
  .string()
  .datetime({ message: 'Invalid ISO date format' });

// Optional ISO date string validation
export const optionalIsoDateSchema = z
  .string()
  .datetime({ message: 'Invalid ISO date format' })
  .nullable()
  .optional();

// Color validation (hex colors)
export const colorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Color must be a valid hex color (e.g., #FF0000 or #F00)'
  })
  .nullable()
  .optional();

// Tag validation
export const tagSchema = z
  .string()
  .min(1, { message: 'Tag cannot be empty' })
  .max(50, { message: 'Tag must be less than 50 characters' })
  .regex(/^[a-zA-Z0-9\s-_]+$/, {
    message: 'Tag can only contain letters, numbers, spaces, hyphens, and underscores'
  });

// Tags array validation
export const tagsSchema = z
  .array(tagSchema)
  .max(10, { message: 'Maximum 10 tags allowed' })
  .nullable()
  .optional();

// JSON validation
export const jsonSchema = z
  .record(z.any())
  .nullable()
  .optional();

// Sort order validation
export const sortOrderSchema = z
  .number()
  .int({ message: 'Sort order must be an integer' })
  .min(0, { message: 'Sort order must be non-negative' })
  .default(0);

// Content validation (long text)
export const contentSchema = z
  .string()
  .max(100000, { message: 'Content must be less than 100,000 characters' })
  .nullable()
  .optional();

// Required content validation
export const requiredContentSchema = z
  .string()
  .min(1, { message: 'Content is required' })
  .max(100000, { message: 'Content must be less than 100,000 characters' });

// Short text validation
export const shortTextSchema = z
  .string()
  .max(255, { message: 'Text must be less than 255 characters' })
  .nullable()
  .optional();

// Required short text validation
export const requiredShortTextSchema = z
  .string()
  .min(1, { message: 'This field is required' })
  .max(255, { message: 'Text must be less than 255 characters' });

// Medium text validation
export const mediumTextSchema = z
  .string()
  .max(1000, { message: 'Text must be less than 1000 characters' })
  .nullable()
  .optional();

// Name validation
export const nameSchema = z
  .string()
  .min(1, { message: 'Name is required' })
  .max(100, { message: 'Name must be less than 100 characters' })
  .regex(/^[a-zA-Z0-9\s\-_.]+$/, {
    message: 'Name can only contain letters, numbers, spaces, hyphens, underscores, and periods'
  });

// Optional name validation
export const optionalNameSchema = z
  .string()
  .max(100, { message: 'Name must be less than 100 characters' })
  .regex(/^[a-zA-Z0-9\s\-_.]*$/, {
    message: 'Name can only contain letters, numbers, spaces, hyphens, underscores, and periods'
  })
  .nullable()
  .optional();

// Title validation
export const titleSchema = z
  .string()
  .min(1, { message: 'Title is required' })
  .max(200, { message: 'Title must be less than 200 characters' });

// Description validation
export const descriptionSchema = z
  .string()
  .max(500, { message: 'Description must be less than 500 characters' })
  .nullable()
  .optional();

// Excerpt validation
export const excerptSchema = z
  .string()
  .max(300, { message: 'Excerpt must be less than 300 characters' })
  .nullable()
  .optional();

// Icon validation (simple string for now)
export const iconSchema = z
  .string()
  .max(50, { message: 'Icon must be less than 50 characters' })
  .nullable()
  .optional();

// Base timestamps for all entities
export const timestampsSchema = z.object({
  created_at: isoDateSchema,
  updated_at: isoDateSchema,
});

// Optional timestamps for insert operations
export const optionalTimestampsSchema = z.object({
  created_at: optionalIsoDateSchema,
  updated_at: optionalIsoDateSchema,
});

// Partial timestamps for update operations
export const partialTimestampsSchema = z.object({
  created_at: optionalIsoDateSchema,
  updated_at: optionalIsoDateSchema,
});