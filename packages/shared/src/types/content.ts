/**
 * Content-related types and interfaces for posts, comments, categories, etc.
 */

import { BaseEntity, AuditableEntity, ID, Timestamp } from './common';

/**
 * Content status types
 */
export type ContentStatus = 
  | 'draft'       // Not published
  | 'published'   // Live content
  | 'archived'    // Archived content
  | 'deleted'     // Soft deleted
  | 'pending'     // Pending review
  | 'rejected';   // Rejected by moderator

/**
 * Content visibility types
 */
export type ContentVisibility = 
  | 'public'      // Visible to everyone
  | 'private'     // Visible to author only
  | 'unlisted'    // Accessible via direct link
  | 'members'     // Visible to members only
  | 'premium';    // Visible to premium members

/**
 * Content types
 */
export type ContentType = 
  | 'article'     // Blog article
  | 'video'       // Video content
  | 'image'       // Image post
  | 'audio'       // Audio content
  | 'gallery'     // Image gallery
  | 'poll'        // Poll/survey
  | 'event'       // Event listing
  | 'product';    // Product listing

/**
 * Media file types
 */
export type MediaType = 
  | 'image'       // Image files
  | 'video'       // Video files
  | 'audio'       // Audio files
  | 'document'    // Document files
  | 'archive';    // Archive files

/**
 * Media file information
 */
export interface MediaFile extends BaseEntity {
  /** Original filename */
  filename: string;
  /** File URL */
  url: string;
  /** Thumbnail URL (for images/videos) */
  thumbnailUrl?: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  mimeType: string;
  /** Media type category */
  mediaType: MediaType;
  /** Image/video dimensions */
  dimensions?: {
    width: number;
    height: number;
  };
  /** Duration for audio/video (seconds) */
  duration?: number;
  /** Alt text for accessibility */
  altText?: string;
  /** File metadata */
  metadata?: Record<string, any>;
  /** User who uploaded the file */
  uploadedBy: ID;
}

/**
 * Content category
 */
export interface Category extends AuditableEntity {
  /** Category name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Category description */
  description?: string;
  /** Category color */
  color?: string;
  /** Category icon */
  icon?: string;
  /** Parent category ID */
  parentId?: ID;
  /** Category image */
  image?: string;
  /** Whether category is active */
  isActive: boolean;
  /** Sort order */
  sortOrder: number;
  /** SEO metadata */
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

/**
 * Content tag
 */
export interface Tag extends BaseEntity {
  /** Tag name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Tag description */
  description?: string;
  /** Tag color */
  color?: string;
  /** Usage count */
  usageCount: number;
}

/**
 * Base content interface
 */
export interface BaseContent extends AuditableEntity {
  /** Content title */
  title: string;
  /** URL-friendly slug */
  slug: string;
  /** Content excerpt/summary */
  excerpt?: string;
  /** Content body */
  content: string;
  /** Content type */
  type: ContentType;
  /** Content status */
  status: ContentStatus;
  /** Content visibility */
  visibility: ContentVisibility;
  /** Author ID */
  authorId: ID;
  /** Featured image */
  featuredImage?: string;
  /** Publish date */
  publishedAt?: Timestamp;
  /** View count */
  viewCount: number;
  /** Like count */
  likeCount: number;
  /** Comment count */
  commentCount: number;
  /** Share count */
  shareCount: number;
  /** Whether comments are enabled */
  commentsEnabled: boolean;
  /** Content metadata */
  metadata?: Record<string, any>;
  /** SEO metadata */
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    canonicalUrl?: string;
  };
}

/**
 * Article/blog post
 */
export interface Article extends BaseContent {
  /** Content type (always 'article') */
  type: 'article';
  /** Reading time in minutes */
  readingTime?: number;
  /** Word count */
  wordCount?: number;
  /** Table of contents */
  tableOfContents?: {
    id: string;
    title: string;
    level: number;
  }[];
  /** Related articles */
  relatedArticles?: ID[];
}

/**
 * Video content
 */
export interface VideoContent extends BaseContent {
  /** Content type (always 'video') */
  type: 'video';
  /** Video file */
  videoFile: MediaFile;
  /** Video duration in seconds */
  duration: number;
  /** Video thumbnail */
  thumbnail?: string;
  /** Video chapters */
  chapters?: {
    id: string;
    title: string;
    startTime: number;
    endTime: number;
  }[];
  /** Video quality options */
  qualities?: {
    resolution: string;
    url: string;
    bitrate: number;
  }[];
}

/**
 * Generic post (covers all content types)
 */
export interface Post extends BaseContent {
  /** Associated categories */
  categories: Category[];
  /** Associated tags */
  tags: Tag[];
  /** Attached media files */
  attachments: MediaFile[];
  /** Post location */
  location?: {
    name: string;
    latitude: number;
    longitude: number;
  };
  /** Scheduled publish time */
  scheduledAt?: Timestamp;
}

/**
 * Comment on content
 */
export interface Comment extends AuditableEntity {
  /** Comment content */
  content: string;
  /** Post ID */
  postId: ID;
  /** Author ID */
  authorId: ID;
  /** Parent comment ID (for replies) */
  parentId?: ID;
  /** Comment status */
  status: 'approved' | 'pending' | 'rejected' | 'spam';
  /** Like count */
  likeCount: number;
  /** Reply count */
  replyCount: number;
  /** Whether comment is pinned */
  isPinned: boolean;
  /** IP address */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
  /** Comment metadata */
  metadata?: Record<string, any>;
}

/**
 * Content reaction types
 */
export type ReactionType = 
  | 'like'
  | 'love'
  | 'laugh'
  | 'angry'
  | 'sad'
  | 'wow';

/**
 * Content reaction
 */
export interface Reaction extends BaseEntity {
  /** User ID */
  userId: ID;
  /** Content ID */
  contentId: ID;
  /** Content type (post, comment, etc.) */
  contentType: 'post' | 'comment';
  /** Reaction type */
  type: ReactionType;
}

/**
 * Content bookmark
 */
export interface Bookmark extends BaseEntity {
  /** User ID */
  userId: ID;
  /** Post ID */
  postId: ID;
  /** Bookmark collection */
  collection?: string;
  /** Bookmark notes */
  notes?: string;
}

/**
 * Content report
 */
export interface ContentReport extends BaseEntity {
  /** Reporter user ID */
  reporterId: ID;
  /** Reported content ID */
  contentId: ID;
  /** Content type */
  contentType: 'post' | 'comment';
  /** Report reason */
  reason: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other';
  /** Report description */
  description?: string;
  /** Report status */
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  /** Moderator ID */
  moderatorId?: ID;
  /** Moderator notes */
  moderatorNotes?: string;
  /** Resolution timestamp */
  resolvedAt?: Timestamp;
}

/**
 * Content revision/version
 */
export interface ContentRevision extends BaseEntity {
  /** Content ID */
  contentId: ID;
  /** Revision number */
  revisionNumber: number;
  /** Content at this revision */
  content: string;
  /** Title at this revision */
  title: string;
  /** User who made the revision */
  authorId: ID;
  /** Revision summary */
  summary?: string;
  /** Whether this is a major revision */
  isMajor: boolean;
}

/**
 * Content search filters
 */
export interface ContentSearchFilters {
  /** Search query */
  query?: string;
  /** Content type filter */
  type?: ContentType;
  /** Status filter */
  status?: ContentStatus;
  /** Visibility filter */
  visibility?: ContentVisibility;
  /** Author ID filter */
  authorId?: ID;
  /** Category ID filter */
  categoryId?: ID;
  /** Tag slugs filter */
  tags?: string[];
  /** Date range filters */
  publishedAfter?: Timestamp;
  publishedBefore?: Timestamp;
  /** Minimum view count */
  minViews?: number;
  /** Minimum like count */
  minLikes?: number;
  /** Has featured image */
  hasFeaturedImage?: boolean;
  /** Comments enabled */
  commentsEnabled?: boolean;
}

/**
 * Content statistics
 */
export interface ContentStatistics {
  /** Total posts */
  totalPosts: number;
  /** Published posts */
  publishedPosts: number;
  /** Draft posts */
  draftPosts: number;
  /** Total views */
  totalViews: number;
  /** Total likes */
  totalLikes: number;
  /** Total comments */
  totalComments: number;
  /** Total shares */
  totalShares: number;
  /** Posts by type */
  postsByType: Record<ContentType, number>;
  /** Posts by category */
  postsByCategory: Record<string, number>;
  /** Top performing posts */
  topPosts: {
    id: ID;
    title: string;
    views: number;
    likes: number;
  }[];
}

/**
 * Content feed item
 */
export interface FeedItem {
  /** Post data */
  post: Post;
  /** Author information */
  author: {
    id: ID;
    username: string;
    displayName: string;
    avatar?: string;
  };
  /** User's reaction to this post */
  userReaction?: ReactionType;
  /** Whether user has bookmarked this post */
  isBookmarked: boolean;
  /** Whether user is following the author */
  isFollowingAuthor: boolean;
}