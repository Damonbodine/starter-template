/**
 * Database Migration System
 * 
 * This module provides utilities for managing database migrations in a Supabase environment.
 * It includes functions to run migrations, check migration status, and manage the migration
 * process with proper error handling and logging.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { MigrationRunner } from './runner';

// Migration types
export interface Migration {
  version: string;
  description: string;
  sql: string;
  filename: string;
  appliedAt?: string;
}

export interface MigrationStatus {
  version: string;
  description: string;
  appliedAt: string;
}

export interface MigrationResult {
  success: boolean;
  version: string;
  description: string;
  error?: string;
  duration?: number;
}

export interface MigrationRunnerOptions {
  migrationsPath?: string;
  verbose?: boolean;
  dryRun?: boolean;
}

/**
 * Main migration manager class
 */
export class MigrationManager {
  private runner: MigrationRunner;

  constructor(
    private supabase: SupabaseClient,
    private options: MigrationRunnerOptions = {}
  ) {
    this.runner = new MigrationRunner(supabase, options);
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<MigrationResult[]> {
    try {
      const results = await this.runner.runPendingMigrations();
      return results;
    } catch (error) {
      console.error('Failed to run migrations:', error);
      throw error;
    }
  }

  /**
   * Run a specific migration by version
   */
  async runMigration(version: string): Promise<MigrationResult> {
    try {
      const result = await this.runner.runMigration(version);
      return result;
    } catch (error) {
      console.error(`Failed to run migration ${version}:`, error);
      throw error;
    }
  }

  /**
   * Get the status of all migrations
   */
  async getMigrationStatus(): Promise<{
    applied: MigrationStatus[];
    pending: Migration[];
    total: number;
    appliedCount: number;
    pendingCount: number;
  }> {
    try {
      const applied = await this.getAppliedMigrations();
      const available = await this.runner.getAvailableMigrations();
      
      const appliedVersions = new Set(applied.map(m => m.version));
      const pending = available.filter(m => !appliedVersions.has(m.version));

      return {
        applied,
        pending,
        total: available.length,
        appliedCount: applied.length,
        pendingCount: pending.length,
      };
    } catch (error) {
      console.error('Failed to get migration status:', error);
      throw error;
    }
  }

  /**
   * Get list of applied migrations
   */
  async getAppliedMigrations(): Promise<MigrationStatus[]> {
    try {
      const { data, error } = await this.supabase
        .from('schema_migrations')
        .select('version, description, applied_at')
        .order('version', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch applied migrations: ${error.message}`);
      }

      return (data || []).map(row => ({
        version: row.version,
        description: row.description || '',
        appliedAt: row.applied_at,
      }));
    } catch (error) {
      console.error('Failed to get applied migrations:', error);
      throw error;
    }
  }

  /**
   * Check if migrations table exists, create if it doesn't
   */
  async ensureMigrationsTable(): Promise<void> {
    try {
      await this.runner.ensureMigrationsTable();
    } catch (error) {
      console.error('Failed to ensure migrations table:', error);
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
    try {
      return await this.runner.validateMigrations();
    } catch (error) {
      console.error('Failed to validate migrations:', error);
      throw error;
    }
  }

  /**
   * Reset migrations (dangerous - removes all data)
   */
  async resetMigrations(confirm: boolean = false): Promise<void> {
    if (!confirm) {
      throw new Error('Reset confirmation required. This will delete all data!');
    }

    try {
      await this.runner.resetMigrations();
    } catch (error) {
      console.error('Failed to reset migrations:', error);
      throw error;
    }
  }

  /**
   * Rollback to a specific migration version
   */
  async rollbackTo(version: string): Promise<MigrationResult[]> {
    try {
      return await this.runner.rollbackTo(version);
    } catch (error) {
      console.error(`Failed to rollback to version ${version}:`, error);
      throw error;
    }
  }
}

/**
 * Create a new migration manager instance
 */
export function createMigrationManager(
  supabase: SupabaseClient,
  options: MigrationRunnerOptions = {}
): MigrationManager {
  return new MigrationManager(supabase, options);
}

/**
 * Utility function to run migrations with a Supabase client
 */
export async function runMigrations(
  supabase: SupabaseClient,
  options: MigrationRunnerOptions = {}
): Promise<MigrationResult[]> {
  const manager = createMigrationManager(supabase, options);
  return await manager.runMigrations();
}

/**
 * Utility function to check migration status
 */
export async function checkMigrationStatus(
  supabase: SupabaseClient,
  options: MigrationRunnerOptions = {}
): Promise<{
  applied: MigrationStatus[];
  pending: Migration[];
  total: number;
  appliedCount: number;
  pendingCount: number;
}> {
  const manager = createMigrationManager(supabase, options);
  return await manager.getMigrationStatus();
}

/**
 * Utility function to ensure migrations table exists
 */
export async function ensureMigrationsTable(
  supabase: SupabaseClient
): Promise<void> {
  const manager = createMigrationManager(supabase);
  await manager.ensureMigrationsTable();
}

// Re-export types and classes
export { MigrationRunner } from './runner';
export type {
  MigrationRunnerOptions,
  Migration,
  MigrationStatus,
  MigrationResult,
};