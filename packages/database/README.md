# @starter-template/database

A comprehensive Supabase database package with TypeScript types, utilities, migrations, and validation schemas.

## Features

- 🔧 **Supabase Client Configuration** - Pre-configured clients with environment validation
- 📝 **TypeScript Types** - Auto-generated types from your database schema
- 🔐 **Row Level Security** - Pre-built RLS policies and management utilities
- 🔄 **Migration System** - Database migrations with CLI tools
- ✅ **Zod Validation** - Runtime validation schemas for all database entities
- 🛠️ **Utility Functions** - CRUD operations, authentication, real-time subscriptions
- 📁 **Storage Integration** - File upload/download utilities for Supabase Storage

## Installation

```bash
# Using pnpm (recommended)
pnpm add @starter-template/database

# Using npm
npm install @starter-template/database

# Using yarn
yarn add @starter-template/database
```

## Quick Start

### Environment Setup

Create a `.env` file with your Supabase credentials:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=your-project-id
```

For Next.js, use the `NEXT_PUBLIC_` prefix:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For Expo, use the `EXPO_PUBLIC_` prefix:
```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Basic Usage

```typescript
import { 
  supabase, 
  signIn, 
  getCurrentUser, 
  create, 
  findMany,
  PostSchema 
} from '@starter-template/database'

// Authentication
const user = await signIn('user@example.com', 'password')
const currentUser = await getCurrentUser()

// Database operations
const posts = await findMany('posts', {
  filters: { status: 'published' },
  pagination: { page: 1, limit: 10 }
})

// Validation
const postData = PostSchema.parse({
  title: 'My Post',
  content: 'Post content...',
  status: 'draft'
})

// Create a post
const newPost = await create('posts', postData)
```

## Database Schema

The package includes a complete blog-style schema with:

- **Users & Profiles** - User authentication and profile management
- **Posts** - Blog posts with status, categories, and tags
- **Comments** - Threaded comments with moderation
- **Categories** - Hierarchical content categorization

### Schema Diagram

```
auth.users (Supabase Auth)
    ↓
profiles (1:1)
    ↓
posts (1:many) ←→ post_categories (many:many) ←→ categories
    ↓
comments (1:many, self-referencing for replies)
```

## Migrations

### Run Migrations

```bash
# Run all pending migrations
pnpm migrate

# Check migration status
pnpm migrate:status

# Create a new migration
pnpm migration:new "add_new_table"
```

### Programmatic Migrations

```typescript
import { runMigrations, checkMigrationStatus } from '@starter-template/database'

// Check what needs to be migrated
const status = await checkMigrationStatus(supabase)
console.log(`${status.pending.length} pending migrations`)

// Run migrations
const results = await runMigrations(supabase, { verbose: true })
```

## Authentication

### Sign Up / Sign In

```typescript
import { signUp, signIn, signOut, getCurrentUser } from '@starter-template/database'

// Register new user
const { user } = await signUp('user@example.com', 'password', {
  full_name: 'John Doe'
})

// Sign in
const { user, session } = await signIn('user@example.com', 'password')

// Sign out
await signOut()

// Get current user
const user = await getCurrentUser()
```

### OAuth Authentication

```typescript
import { signInWithOAuth } from '@starter-template/database'

// Sign in with GitHub
await signInWithOAuth('github')

// Sign in with Google
await signInWithOAuth('google')
```

### Profile Management

```typescript
import { getCurrentProfile, updateProfile } from '@starter-template/database'

// Get current user's profile
const profile = await getCurrentProfile()

// Update profile
await updateProfile({
  full_name: 'Jane Doe',
  bio: 'Software developer',
  website: 'https://janedoe.dev'
})
```

## Database Operations

### Basic CRUD

```typescript
import { create, findById, findMany, updateById, deleteById } from '@starter-template/database'

// Create
const post = await create('posts', {
  title: 'New Post',
  content: 'Post content...',
  status: 'draft',
  author_id: user.id
})

// Read
const post = await findById('posts', postId)
const posts = await findMany('posts', {
  filters: { status: 'published' },
  sort: { column: 'created_at', ascending: false },
  pagination: { page: 1, limit: 10 }
})

// Update
await updateById('posts', postId, {
  title: 'Updated Title',
  status: 'published'
})

// Delete
await deleteById('posts', postId)
```

### Pagination

```typescript
import { findWithPagination } from '@starter-template/database'

const result = await findWithPagination('posts', {
  filters: { status: 'published' },
  pagination: { page: 1, limit: 10 }
})

console.log(`Page ${result.page} of ${Math.ceil(result.count / result.limit)}`)
console.log(`Has more: ${result.hasMore}`)
```

### Search

```typescript
import { textSearch } from '@starter-template/database'

const posts = await textSearch('posts', 'typescript react', {
  columns: ['title', 'content', 'excerpt'],
  limit: 20
})
```

## Real-time Subscriptions

```typescript
import { 
  subscribeToTable, 
  subscribeToRecord, 
  subscribeToPosts 
} from '@starter-template/database'

// Subscribe to all changes in a table
const subscription = subscribeToTable('posts', (payload) => {
  console.log('Change detected:', payload)
})

// Subscribe to specific record
subscribeToRecord('posts', postId, (payload) => {
  console.log('Post updated:', payload.new)
})

// Subscribe to user's posts
subscribeToPosts({ author_id: userId }, (payload) => {
  console.log('User post changed:', payload)
})

// Cleanup
subscription.unsubscribe()
```

## File Storage

```typescript
import { 
  uploadFile, 
  downloadFile, 
  createSignedUrl,
  uploadAvatar 
} from '@starter-template/database'

// Upload file
const { path } = await uploadFile('posts', file, {
  fileName: 'image.jpg'
})

// Upload avatar
const avatarUrl = await uploadAvatar(file, userId)

// Create signed URL for private files
const signedUrl = await createSignedUrl('attachments', filePath, 3600)

// Download file
const blob = await downloadFile('posts', filePath)
```

## Validation

### Schema Validation

```typescript
import { 
  PostSchema, 
  PostInsertSchema, 
  CommentSchema,
  validateSchema 
} from '@starter-template/database'

// Validate data
const result = validateSchema(PostInsertSchema, formData)
if (!result.success) {
  console.log('Validation errors:', result.error.errors)
  return
}

// Use validated data
const validatedPost = result.data
```

### Built-in Validators

```typescript
import { validators } from '@starter-template/database'

// Validate specific fields
const isValid = validators.post.slug('my-post-slug')
const emailResult = validators.profile.email('user@example.com')
```

## Row Level Security (RLS)

### Apply Policies

```typescript
import { createPolicyManager, POLICY_TEMPLATES } from '@starter-template/database'

const policyManager = createPolicyManager(supabase)

// Apply common policy template
await policyManager.applyTemplate('posts', 'VIEW_OWN', 'author_id')

// Create custom policy
await policyManager.createPolicy({
  tableName: 'posts',
  policyName: 'posts_public_published',
  operation: 'SELECT',
  condition: "status = 'published'"
})
```

### Test Access

```typescript
// Test if current user can access a table
const canRead = await policyManager.testAccess('posts', 'SELECT')
const canWrite = await policyManager.testAccess('posts', 'INSERT', postData)
```

## Environment Configuration

The package automatically detects and loads configuration from environment variables:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) |
| `SUPABASE_PROJECT_ID` | Project ID for type generation |

## TypeScript Types

The package exports comprehensive TypeScript types:

```typescript
import type { 
  Database,
  Profile,
  Post,
  Comment,
  PostWithAuthor,
  PostWithStats,
  PaginatedResult 
} from '@starter-template/database'

// Use types in your application
function createPost(data: PostInsert): Promise<Post> {
  return create('posts', data)
}
```

## CLI Tools

The package includes CLI tools for database management:

```bash
# Type generation
pnpm generate:types      # Generate types from remote database
pnpm generate:local      # Generate types from local database

# Database management
pnpm db:start           # Start local Supabase
pnpm db:stop            # Stop local Supabase
pnpm db:reset           # Reset local database
pnpm db:push            # Push schema changes
pnpm db:pull            # Pull schema changes

# Migrations
pnpm migration:new      # Create new migration
pnpm migration:up       # Run pending migrations
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm type-check

# Generate types from your Supabase instance
pnpm generate:types
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © Starter Template