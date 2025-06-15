import { z } from 'zod';
import {
  uuidSchema,
  emailSchema,
  optionalUrlSchema,
  shortTextSchema,
  mediumTextSchema,
  timestampsSchema,
  optionalTimestampsSchema,
  partialTimestampsSchema,
} from './common';

/**
 * Profile validation schemas
 */

// Base profile schema for full profile validation
export const ProfileSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  full_name: shortTextSchema,
  avatar_url: optionalUrlSchema,
  bio: mediumTextSchema,
  website: optionalUrlSchema,
  location: shortTextSchema,
}).merge(timestampsSchema);

// Profile insert schema for creation
export const ProfileInsertSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  full_name: shortTextSchema,
  avatar_url: optionalUrlSchema,
  bio: mediumTextSchema,
  website: optionalUrlSchema,
  location: shortTextSchema,
}).merge(optionalTimestampsSchema);

// Profile update schema for updates
export const ProfileUpdateSchema = z.object({
  id: uuidSchema.optional(),
  email: emailSchema.optional(),
  full_name: shortTextSchema,
  avatar_url: optionalUrlSchema,
  bio: mediumTextSchema,
  website: optionalUrlSchema,
  location: shortTextSchema,
}).merge(partialTimestampsSchema);

// Specific validation schemas for common operations

// Profile creation with required fields only
export const ProfileCreateSchema = ProfileInsertSchema.pick({
  id: true,
  email: true,
});

// Profile public update (fields users can update themselves)
export const ProfilePublicUpdateSchema = ProfileUpdateSchema.pick({
  full_name: true,
  avatar_url: true,
  bio: true,
  website: true,
  location: true,
});

// Email validation specifically for profiles
export const ProfileEmailSchema = z.object({
  email: emailSchema,
});

// Website URL validation with additional profile-specific rules
export const ProfileWebsiteSchema = z.object({
  website: z
    .string()
    .url({ message: 'Website must be a valid URL' })
    .refine(
      (url) => {
        try {
          const parsedUrl = new URL(url);
          return ['http:', 'https:'].includes(parsedUrl.protocol);
        } catch {
          return false;
        }
      },
      { message: 'Website URL must use HTTP or HTTPS protocol' }
    )
    .nullable()
    .optional(),
});

// Avatar URL validation with specific requirements
export const ProfileAvatarSchema = z.object({
  avatar_url: z
    .string()
    .url({ message: 'Avatar URL must be a valid URL' })
    .refine(
      (url) => {
        // Check if URL ends with common image extensions
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const lowerUrl = url.toLowerCase();
        return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
               lowerUrl.includes('image') || 
               lowerUrl.includes('avatar') ||
               lowerUrl.includes('profile');
      },
      { message: 'Avatar URL should point to an image file' }
    )
    .nullable()
    .optional(),
});

// Bio validation with character limits and content rules
export const ProfileBioSchema = z.object({
  bio: z
    .string()
    .max(500, { message: 'Bio must be less than 500 characters' })
    .refine(
      (bio) => {
        if (!bio) return true;
        // Basic profanity check - in real app, use proper profanity filter
        const commonProfanity = ['spam', 'scam', 'hate'];
        return !commonProfanity.some(word => 
          bio.toLowerCase().includes(word.toLowerCase())
        );
      },
      { message: 'Bio contains inappropriate content' }
    )
    .nullable()
    .optional(),
});

// Full name validation with specific rules
export const ProfileFullNameSchema = z.object({
  full_name: z
    .string()
    .min(1, { message: 'Full name cannot be empty' })
    .max(100, { message: 'Full name must be less than 100 characters' })
    .regex(/^[a-zA-Z\s\-'.]+$/, {
      message: 'Full name can only contain letters, spaces, hyphens, apostrophes, and periods'
    })
    .refine(
      (name) => {
        if (!name) return true;
        // Must contain at least one letter
        return /[a-zA-Z]/.test(name);
      },
      { message: 'Full name must contain at least one letter' }
    )
    .nullable()
    .optional(),
});

// Location validation
export const ProfileLocationSchema = z.object({
  location: z
    .string()
    .max(100, { message: 'Location must be less than 100 characters' })
    .regex(/^[a-zA-Z0-9\s\-,.']+$/, {
      message: 'Location can only contain letters, numbers, spaces, hyphens, commas, apostrophes, and periods'
    })
    .nullable()
    .optional(),
});

// Export types for TypeScript
export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileInsert = z.infer<typeof ProfileInsertSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
export type ProfileCreate = z.infer<typeof ProfileCreateSchema>;
export type ProfilePublicUpdate = z.infer<typeof ProfilePublicUpdateSchema>;