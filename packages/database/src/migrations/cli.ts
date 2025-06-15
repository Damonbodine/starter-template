#!/usr/bin/env node

/**
 * Migration CLI Utility
 * 
 * A command-line interface for managing database migrations.
 * This can be used for development and deployment automation.
 */

import { createClient } from '@supabase/supabase-js';
import { createMigrationManager } from './index';

interface CLIOptions {
  command: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  verbose?: boolean;
  dryRun?: boolean;
  version?: string;
  confirm?: boolean;
}

/**
 * Parse command line arguments
 */
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    command: args[0] || 'help',
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--confirm') {
      options.confirm = true;
    } else if (arg.startsWith('--url=')) {
      options.supabaseUrl = arg.split('=')[1];
    } else if (arg.startsWith('--key=')) {
      options.supabaseKey = arg.split('=')[1];
    } else if (arg.startsWith('--version=')) {
      options.version = arg.split('=')[1];
    }
  }

  return options;
}

/**
 * Create Supabase client from options or environment
 */
function createSupabaseClient(options: CLIOptions) {
  const url = options.supabaseUrl || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = options.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Error: Supabase URL and key are required');
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
    console.error('or use --url and --key command line options');
    process.exit(1);
  }

  return createClient(url, key);
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Database Migration CLI

Usage: migration-cli <command> [options]

Commands:
  run                    Run all pending migrations
  run --version=<ver>    Run a specific migration
  status                 Show migration status
  validate               Validate migration files
  help                   Show this help message

Options:
  --url=<url>           Supabase URL (or set SUPABASE_URL env var)
  --key=<key>           Supabase service role key (or set SUPABASE_SERVICE_ROLE_KEY env var)
  --verbose, -v         Verbose output
  --dry-run             Show what would be executed without running
  --version=<version>   Target specific migration version
  --confirm             Confirm dangerous operations

Environment Variables:
  SUPABASE_URL                 Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY    Supabase service role key (for admin operations)
  SUPABASE_ANON_KEY           Supabase anonymous key (fallback)

Examples:
  migration-cli run --verbose
  migration-cli status
  migration-cli run --version=001
  migration-cli validate
`);
}

/**
 * Format duration for display
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Main CLI function
 */
async function main() {
  const options = parseArgs();

  if (options.command === 'help' || options.command === '--help' || options.command === '-h') {
    showHelp();
    return;
  }

  try {
    const supabase = createSupabaseClient(options);
    const migrationManager = createMigrationManager(supabase, {
      verbose: options.verbose,
      dryRun: options.dryRun,
    });

    switch (options.command) {
      case 'run': {
        console.log('Running migrations...');
        
        let results;
        if (options.version) {
          console.log(`Running migration ${options.version}`);
          const result = await migrationManager.runMigration(options.version);
          results = [result];
        } else {
          results = await migrationManager.runMigrations();
        }

        if (results.length === 0) {
          console.log('✅ No migrations to run');
          return;
        }

        let successCount = 0;
        let failureCount = 0;

        for (const result of results) {
          const status = result.success ? '✅' : '❌';
          const duration = result.duration ? ` (${formatDuration(result.duration)})` : '';
          
          console.log(`${status} ${result.version}: ${result.description}${duration}`);
          
          if (result.error) {
            console.error(`   Error: ${result.error}`);
            failureCount++;
          } else {
            successCount++;
          }
        }

        console.log(`\nCompleted: ${successCount} successful, ${failureCount} failed`);
        
        if (failureCount > 0) {
          process.exit(1);
        }
        break;
      }

      case 'status': {
        console.log('Checking migration status...');
        
        const status = await migrationManager.getMigrationStatus();
        
        console.log(`\nMigration Status:`);
        console.log(`Total migrations: ${status.total}`);
        console.log(`Applied: ${status.appliedCount}`);
        console.log(`Pending: ${status.pendingCount}`);

        if (status.applied.length > 0) {
          console.log('\nApplied migrations:');
          for (const migration of status.applied) {
            const date = new Date(migration.appliedAt).toLocaleString();
            console.log(`  ✅ ${migration.version}: ${migration.description} (${date})`);
          }
        }

        if (status.pending.length > 0) {
          console.log('\nPending migrations:');
          for (const migration of status.pending) {
            console.log(`  ⏳ ${migration.version}: ${migration.description}`);
          }
        }
        break;
      }

      case 'validate': {
        console.log('Validating migration files...');
        
        const validation = await migrationManager.validateMigrations();
        
        if (validation.valid) {
          console.log('✅ All migration files are valid');
        } else {
          console.log('❌ Migration validation failed');
        }

        if (validation.errors.length > 0) {
          console.log('\nErrors:');
          for (const error of validation.errors) {
            console.log(`  ❌ ${error}`);
          }
        }

        if (validation.warnings.length > 0) {
          console.log('\nWarnings:');
          for (const warning of validation.warnings) {
            console.log(`  ⚠️  ${warning}`);
          }
        }

        if (!validation.valid) {
          process.exit(1);
        }
        break;
      }

      default:
        console.error(`Unknown command: ${options.command}`);
        console.error('Use "migration-cli help" for usage information');
        process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error instanceof Error ? error.message : String(error));
    
    if (options.verbose && error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

export { main as runCLI };