// Client
export * from './client'

// Types
export * from './types'

// Utilities
export * from './utils'

// Validation schemas
export * from './schemas'

// Policies
export * from './policies'

// Migrations
export * from './migrations'

// Re-export commonly used types and functions
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Profile,
  Post,
  Comment,
  Category,
  PostWithAuthor,
  PostWithStats,
  PaginatedResult,
} from './types'

export {
  supabase,
  createSupabaseClient,
  createSupabaseServiceClient,
  getSupabaseClient,
} from './client'

export {
  create,
  findById,
  findMany,
  updateById,
  deleteById,
  findWithPagination,
} from './utils/queries'

export {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getCurrentProfile,
} from './utils/auth'

export {
  ProfileSchema,
  PostSchema,
  CommentSchema,
  CategorySchema,
  validateSchema,
} from './schemas'