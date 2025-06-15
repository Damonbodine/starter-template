# Database Migrations

This directory contains the database migration system for the starter template. The migration system provides utilities to manage database schema changes in a controlled and versioned manner.

## Overview

The migration system consists of:

- **Migration files** (`/migrations/*.sql`): SQL files that define schema changes
- **Migration utilities** (`src/migrations/`): TypeScript utilities for running migrations
- **Migration CLI** (`src/migrations/cli.ts`): Command-line interface for migration management

## Migration Files

Migration files are located in `/packages/database/migrations/` and follow the naming convention:

```
001_initial_schema.sql
002_seed_data.sql
003_add_user_preferences.sql
```

### File Structure

Each migration file should:

1. Start with a sequential 3-digit number (001, 002, 003, etc.)
2. Have a descriptive name separated by underscores
3. Use the `.sql` extension
4. Include metadata comments at the top

### Example Migration File

```sql
-- Migration: 003_add_user_preferences
-- Description: Add user preferences table for storing user settings
-- Created: 2025-06-15

CREATE TABLE public.user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    language TEXT DEFAULT 'en',
    notifications JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Record this migration
INSERT INTO public.schema_migrations (version, description) 
VALUES ('003', 'Add user preferences table for storing user settings')
ON CONFLICT (version) DO NOTHING;
```

## Using the Migration System

### Programmatic Usage

```typescript
import { createClient } from '@supabase/supabase-js';
import { 
  createMigrationManager, 
  runMigrations, 
  checkMigrationStatus 
} from '@your-org/database';

const supabase = createClient(url, key);

// Run all pending migrations
const results = await runMigrations(supabase, { verbose: true });

// Check migration status
const status = await checkMigrationStatus(supabase);
console.log(`Applied: ${status.appliedCount}, Pending: ${status.pendingCount}`);

// Use migration manager for advanced operations
const manager = createMigrationManager(supabase, { verbose: true });
await manager.runMigrations();
```

### CLI Usage

The migration system includes a CLI utility for development and deployment:

```bash
# Run all pending migrations
npx ts-node src/migrations/cli.ts run --verbose

# Check migration status
npx ts-node src/migrations/cli.ts status

# Run a specific migration
npx ts-node src/migrations/cli.ts run --version=001

# Validate migration files
npx ts-node src/migrations/cli.ts validate

# Dry run (show what would be executed)
npx ts-node src/migrations/cli.ts run --dry-run
```

### Environment Variables

Set these environment variables for the CLI:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Or pass them as command line options:

```bash
npx ts-node src/migrations/cli.ts run --url=https://your-project.supabase.co --key=your-key
```

## Migration Tracking

The system automatically creates and maintains a `schema_migrations` table to track applied migrations:

```sql
CREATE TABLE public.schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    description TEXT
);
```

## Best Practices

### 1. Sequential Versioning
- Use sequential 3-digit numbers (001, 002, 003)
- Don't skip numbers or reuse versions
- Coordinate with team members on version numbers

### 2. Idempotent Migrations
- Use `IF NOT EXISTS` for CREATE statements
- Use `ON CONFLICT DO NOTHING` for INSERT statements
- Make migrations safe to run multiple times

### 3. Descriptive Names
- Use clear, descriptive migration names
- Include the purpose of the change
- Use underscores to separate words

### 4. Documentation
- Include comments explaining complex changes
- Document any manual steps required
- Note any breaking changes

### 5. Testing
- Test migrations on a copy of production data
- Validate that the migration works both forward and backward
- Check performance impact of large data migrations

## Error Handling

The migration system includes comprehensive error handling:

- **Validation errors**: Checked before running migrations
- **SQL errors**: Captured and reported with context
- **Rollback safety**: Migrations should be designed to be reversible
- **Partial failure recovery**: Failed migrations don't affect subsequent runs

## Development Workflow

1. **Create Migration File**
   ```bash
   # Create new migration file
   touch migrations/003_add_feature.sql
   ```

2. **Write Migration SQL**
   - Add schema changes
   - Include proper indexing
   - Add migration tracking

3. **Validate Migration**
   ```bash
   npx ts-node src/migrations/cli.ts validate
   ```

4. **Test Migration**
   ```bash
   # Test on development database
   npx ts-node src/migrations/cli.ts run --dry-run
   npx ts-node src/migrations/cli.ts run
   ```

5. **Deploy Migration**
   ```bash
   # Production deployment
   NODE_ENV=production npx ts-node src/migrations/cli.ts run
   ```

## Troubleshooting

### Common Issues

1. **Migration Table Missing**
   - Ensure the first migration creates the `schema_migrations` table
   - Or run `ensureMigrationsTable()` manually

2. **Permission Errors**
   - Use service role key for administrative operations
   - Ensure proper RLS policies are in place

3. **SQL Syntax Errors**
   - Validate SQL syntax before committing
   - Test migrations on development database first

4. **Version Conflicts**
   - Coordinate version numbers with team
   - Use validation to check for duplicates

### Getting Help

- Check the migration validation output for specific errors
- Use `--verbose` flag for detailed execution information
- Review Supabase logs for database-level errors

## Security Considerations

- Never commit sensitive data in migration files
- Use environment variables for database credentials
- Restrict migration execution to authorized users
- Review migrations for potential security issues before deployment