/**
 * Migration Runner
 * 
 * This module handles the execution of database migrations, including loading
 * migration files, executing SQL, and tracking migration status.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import type { Migration, MigrationResult, MigrationRunnerOptions } from './index';

export class MigrationRunner {
  private migrationsPath: string;
  private verbose: boolean;
  private dryRun: boolean;

  constructor(
    private supabase: SupabaseClient,
    options: MigrationRunnerOptions = {}
  ) {
    this.migrationsPath = options.migrationsPath || this.getDefaultMigrationsPath();
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
  }

  /**
   * Get the default migrations path
   */
  private getDefaultMigrationsPath(): string {
    // In a production environment, migrations would be bundled or available in a known location
    // For development, we'll look for them relative to the package root
    const possiblePaths = [
      resolve(__dirname, '../../migrations'),
      resolve(__dirname, '../../../migrations'),
      resolve(process.cwd(), 'migrations'),
      resolve(process.cwd(), 'packages/database/migrations'),
    ];

    for (const path of possiblePaths) {
      if (existsSync(path)) {
        return path;
      }
    }

    throw new Error(
      `Could not find migrations directory. Tried: ${possiblePaths.join(', ')}`
    );
  }

  /**
   * Load all available migration files
   */
  async getAvailableMigrations(): Promise<Migration[]> {
    try {
      if (!existsSync(this.migrationsPath)) {
        throw new Error(`Migrations directory not found: ${this.migrationsPath}`);
      }

      const files = readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

      const migrations: Migration[] = [];

      for (const file of files) {
        const fullPath = join(this.migrationsPath, file);
        const content = readFileSync(fullPath, 'utf-8');
        
        // Extract version from filename (e.g., "001_initial_schema.sql" -> "001")
        const versionMatch = file.match(/^(\d+)_/);
        if (!versionMatch) {
          console.warn(`Skipping file with invalid naming format: ${file}`);
          continue;
        }

        const version = versionMatch[1];
        
        // Extract description from filename or content
        let description = file.replace(/^\d+_/, '').replace('.sql', '').replace(/_/g, ' ');
        
        // Try to extract description from SQL comments
        const descriptionMatch = content.match(/-- Description: (.+)/);
        if (descriptionMatch) {
          description = descriptionMatch[1].trim();
        }

        migrations.push({
          version,
          description,
          sql: content,
          filename: file,
        });
      }

      if (this.verbose) {
        console.log(`Found ${migrations.length} migration files`);
      }

      return migrations;
    } catch (error) {
      console.error('Failed to load migration files:', error);
      throw error;
    }
  }

  /**
   * Ensure the migrations tracking table exists
   */
  async ensureMigrationsTable(): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.schema_migrations (
            version TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            description TEXT
          );
        `
      });

      if (error) {
        // Fallback: try direct table creation query
        const { error: createError } = await this.supabase
          .from('schema_migrations')
          .select('version')
          .limit(1);

        if (createError && createError.message.includes('does not exist')) {
          // Table doesn't exist, we need to create it via SQL execution
          // This would typically be done through a database admin interface or migration tool
          console.warn('Migrations table does not exist. Please create it manually or run the initial schema migration.');
          throw new Error('Migrations table does not exist and cannot be created automatically');
        }
      }

      if (this.verbose) {
        console.log('Migrations table ensured');
      }
    } catch (error) {
      console.error('Failed to ensure migrations table:', error);
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  async runPendingMigrations(): Promise<MigrationResult[]> {
    try {
      await this.ensureMigrationsTable();
      
      const availableMigrations = await this.getAvailableMigrations();
      const appliedMigrations = await this.getAppliedMigrationVersions();
      
      const pendingMigrations = availableMigrations.filter(
        migration => !appliedMigrations.has(migration.version)
      );

      if (pendingMigrations.length === 0) {
        if (this.verbose) {
          console.log('No pending migrations');
        }
        return [];
      }

      if (this.verbose) {
        console.log(`Running ${pendingMigrations.length} pending migrations`);
      }

      const results: MigrationResult[] = [];

      for (const migration of pendingMigrations) {
        const result = await this.runMigration(migration.version);
        results.push(result);

        if (!result.success) {
          console.error(`Migration ${migration.version} failed, stopping execution`);
          break;
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to run pending migrations:', error);
      throw error;
    }
  }

  /**
   * Run a specific migration
   */
  async runMigration(version: string): Promise<MigrationResult> {
    const startTime = Date.now();
    
    try {
      const availableMigrations = await this.getAvailableMigrations();
      const migration = availableMigrations.find(m => m.version === version);

      if (!migration) {
        return {
          success: false,
          version,
          description: 'Unknown migration',
          error: `Migration ${version} not found`,
        };
      }

      if (this.verbose) {
        console.log(`Running migration ${version}: ${migration.description}`);
      }

      if (this.dryRun) {
        console.log(`[DRY RUN] Would execute migration ${version}`);
        console.log(migration.sql);
        return {
          success: true,
          version,
          description: migration.description,
          duration: Date.now() - startTime,
        };
      }

      // Execute the migration SQL
      const { error: sqlError } = await this.executeSql(migration.sql);

      if (sqlError) {
        return {
          success: false,
          version,
          description: migration.description,
          error: sqlError.message,
          duration: Date.now() - startTime,
        };
      }

      // Record the migration as applied (if not already recorded by the migration SQL)
      const { error: recordError } = await this.supabase
        .from('schema_migrations')
        .upsert({
          version,
          description: migration.description,
          applied_at: new Date().toISOString(),
        });

      if (recordError) {
        console.warn(`Migration ${version} executed but failed to record:`, recordError.message);
      }

      if (this.verbose) {
        console.log(`Migration ${version} completed successfully`);
      }

      return {
        success: true,
        version,
        description: migration.description,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        version,
        description: 'Migration execution failed',
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute SQL with proper error handling
   */
  private async executeSql(sql: string): Promise<{ error?: Error }> {
    try {
      // Split SQL into individual statements and execute them
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await this.supabase.rpc('exec_sql', {
            sql: statement + ';'
          });

          if (error) {
            // Try alternative execution methods for different statement types
            if (statement.includes('CREATE') || statement.includes('INSERT') || statement.includes('UPDATE')) {
              // Some statements might work better with direct query
              console.warn(`Direct SQL execution failed for: ${statement.substring(0, 50)}...`);
              console.warn('Error:', error.message);
              return { error };
            }
          }
        }
      }

      return {};
    } catch (error) {
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  /**
   * Get applied migration versions
   */
  private async getAppliedMigrationVersions(): Promise<Set<string>> {
    try {
      const { data, error } = await this.supabase
        .from('schema_migrations')
        .select('version');

      if (error) {
        throw new Error(`Failed to fetch applied migrations: ${error.message}`);
      }

      return new Set((data || []).map(row => row.version));
    } catch (error) {
      // If the table doesn't exist yet, return empty set
      if (error instanceof Error && error.message.includes('does not exist')) {
        return new Set();
      }
      throw error;
    }
  }

  /**
   * Validate migration files
   */
  async validateMigrations(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const migrations = await this.getAvailableMigrations();
      const versions = new Set<string>();

      for (const migration of migrations) {
        // Check for duplicate versions
        if (versions.has(migration.version)) {
          errors.push(`Duplicate migration version: ${migration.version}`);
        }
        versions.add(migration.version);

        // Check for basic SQL syntax
        if (!migration.sql.trim()) {
          errors.push(`Empty migration file: ${migration.filename}`);
        }

        // Check for dangerous operations
        if (migration.sql.includes('DROP TABLE') || migration.sql.includes('DROP DATABASE')) {
          warnings.push(`Potentially dangerous operation in ${migration.filename}`);
        }

        // Check version format
        if (!/^\d{3}$/.test(migration.version)) {
          warnings.push(`Non-standard version format in ${migration.filename}`);
        }
      }

      // Check for gaps in version numbers
      const sortedVersions = Array.from(versions).sort();
      for (let i = 1; i < sortedVersions.length; i++) {
        const current = parseInt(sortedVersions[i]);
        const previous = parseInt(sortedVersions[i - 1]);
        if (current - previous > 1) {
          warnings.push(`Gap in migration versions between ${previous} and ${current}`);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(`Failed to validate migrations: ${error instanceof Error ? error.message : String(error)}`);
      return {
        valid: false,
        errors,
        warnings,
      };
    }
  }

  /**
   * Reset all migrations (dangerous operation)
   */
  async resetMigrations(): Promise<void> {
    throw new Error('Reset migrations is not implemented for safety reasons. Use database admin tools to reset.');
  }

  /**
   * Rollback to a specific version (not implemented for safety)
   */
  async rollbackTo(version: string): Promise<MigrationResult[]> {
    throw new Error(`Rollback to version ${version} is not implemented. Manual rollback required.`);
  }
}