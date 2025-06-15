export * from './database'

// Re-export commonly used types
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  Json,
} from './database'

// Convenience type aliases  
import type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './database'

export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

export type Post = Tables<'posts'>
export type PostInsert = TablesInsert<'posts'>
export type PostUpdate = TablesUpdate<'posts'>
export type PostStatus = Enums<'post_status'>

export type Comment = Tables<'comments'>
export type CommentInsert = TablesInsert<'comments'>
export type CommentUpdate = TablesUpdate<'comments'>
export type CommentStatus = Enums<'comment_status'>

export type Category = Tables<'categories'>
export type CategoryInsert = TablesInsert<'categories'>
export type CategoryUpdate = TablesUpdate<'categories'>

export type PostCategory = Tables<'post_categories'>
export type PostCategoryInsert = TablesInsert<'post_categories'>

// Extended types with relationships
export interface PostWithAuthor extends Post {
  author: Profile
}

export interface PostWithCategories extends Post {
  categories: Category[]
}

export interface PostWithStats extends Post {
  author: Profile
  categories: Category[]
  comment_count: number
  approved_comment_count: number
}

export interface CommentWithAuthor extends Comment {
  author?: Profile
  replies?: CommentWithAuthor[]
}

export interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[]
  parent?: Category
}

// Query result types
export interface PostSearchResult {
  id: string
  title: string
  slug: string
  excerpt: string | null
  rank: number
}

export interface PostStatsResult {
  post_id: string
  comment_count: number
  approved_comment_count: number
  category_count: number
}

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  limit: number
  hasMore: boolean
}

// Error types
export interface DatabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

// Filter types
export interface PostFilters {
  status?: PostStatus
  author_id?: string
  category_id?: string
  tags?: string[]
  search?: string
  published_after?: string
  published_before?: string
}

export interface CommentFilters {
  post_id?: string
  author_id?: string
  status?: CommentStatus
  parent_id?: string | null
}

export interface CategoryFilters {
  parent_id?: string | null
  name?: string
}

// Sort types
export interface SortOptions {
  column: string
  ascending?: boolean
}

export type PostSortColumn = 'created_at' | 'updated_at' | 'published_at' | 'title'
export type CommentSortColumn = 'created_at' | 'updated_at'
export type CategorySortColumn = 'name' | 'sort_order' | 'created_at'