/**
 * Row Level Security (RLS) policy utilities and templates
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types'

export interface PolicyTemplate {
  name: string
  table: string
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL'
  condition: string
  check?: string
  description: string
}

export interface PolicyOptions {
  tableName: string
  policyName: string
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL'
  condition: string
  check?: string
}

/**
 * Common RLS policy templates
 */
export const POLICY_TEMPLATES: Record<string, PolicyTemplate> = {
  // Basic CRUD policies
  VIEW_ALL: {
    name: 'view_all',
    table: '',
    operation: 'SELECT',
    condition: 'true',
    description: 'Allow everyone to view all records',
  },
  
  VIEW_OWN: {
    name: 'view_own',
    table: '',
    operation: 'SELECT',
    condition: 'auth.uid() = user_id',
    description: 'Allow users to view only their own records',
  },
  
  CREATE_OWN: {
    name: 'create_own',
    table: '',
    operation: 'INSERT',
    condition: '',
    check: 'auth.uid() = user_id',
    description: 'Allow users to create records they own',
  },
  
  UPDATE_OWN: {
    name: 'update_own',
    table: '',
    operation: 'UPDATE',
    condition: 'auth.uid() = user_id',
    description: 'Allow users to update only their own records',
  },
  
  DELETE_OWN: {
    name: 'delete_own',
    table: '',
    operation: 'DELETE',
    condition: 'auth.uid() = user_id',
    description: 'Allow users to delete only their own records',
  },
  
  // Authentication-based policies
  AUTHENTICATED_ONLY: {
    name: 'authenticated_only',
    table: '',
    operation: 'ALL',
    condition: 'auth.role() = \'authenticated\'',
    description: 'Allow only authenticated users',
  },
  
  // Admin policies
  ADMIN_FULL_ACCESS: {
    name: 'admin_full_access',
    table: '',
    operation: 'ALL',
    condition: 'auth.jwt() ->> \'role\' = \'admin\'',
    description: 'Allow full access for admin users',
  },
  
  // Time-based policies
  EDIT_WITHIN_HOUR: {
    name: 'edit_within_hour',
    table: '',
    operation: 'UPDATE',
    condition: 'auth.uid() = user_id AND created_at > NOW() - INTERVAL \'1 hour\'',
    description: 'Allow users to edit their records within 1 hour of creation',
  },
  
  // Status-based policies
  VIEW_PUBLISHED: {
    name: 'view_published',
    table: '',
    operation: 'SELECT',
    condition: 'status = \'published\' OR auth.uid() = user_id',
    description: 'Allow viewing published records or own records',
  },
  
  // Collaboration policies
  VIEW_TEAM_CONTENT: {
    name: 'view_team_content',
    table: '',
    operation: 'SELECT',
    condition: `
      auth.uid() = user_id 
      OR auth.uid() = ANY(
        SELECT unnest(string_to_array(metadata->>'team_members', ','))::uuid
      )
    `,
    description: 'Allow viewing content by owner or team members',
  },
}

/**
 * Generate SQL for creating an RLS policy
 */
export function generatePolicySQL(options: PolicyOptions): string {
  const { tableName, policyName, operation, condition, check } = options
  
  let sql = `CREATE POLICY "${policyName}" ON public.${tableName}\n`
  sql += `    FOR ${operation}`
  
  if (operation === 'INSERT' && check) {
    sql += ` WITH CHECK (${check});`
  } else if (condition) {
    sql += ` USING (${condition});`
  } else {
    sql += ';'
  }
  
  return sql
}

/**
 * Generate SQL for dropping an RLS policy
 */
export function generateDropPolicySQL(tableName: string, policyName: string): string {
  return `DROP POLICY IF EXISTS "${policyName}" ON public.${tableName};`
}

/**
 * Generate SQL for enabling RLS on a table
 */
export function generateEnableRLSSQL(tableName: string): string {
  return `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;`
}

/**
 * Generate SQL for disabling RLS on a table
 */
export function generateDisableRLSSQL(tableName: string): string {
  return `ALTER TABLE public.${tableName} DISABLE ROW LEVEL SECURITY;`
}

/**
 * Policy manager class for handling RLS policies
 */
export class PolicyManager {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Create a new RLS policy
   */
  async createPolicy(options: PolicyOptions): Promise<void> {
    const sql = generatePolicySQL(options)
    
    const { error } = await this.supabase.rpc('exec_sql', { sql })
    
    if (error) {
      throw new Error(`Failed to create policy: ${error.message}`)
    }
  }

  /**
   * Drop an existing RLS policy
   */
  async dropPolicy(tableName: string, policyName: string): Promise<void> {
    const sql = generateDropPolicySQL(tableName, policyName)
    
    const { error } = await this.supabase.rpc('exec_sql', { sql })
    
    if (error) {
      throw new Error(`Failed to drop policy: ${error.message}`)
    }
  }

  /**
   * Enable RLS on a table
   */
  async enableRLS(tableName: string): Promise<void> {
    const sql = generateEnableRLSSQL(tableName)
    
    const { error } = await this.supabase.rpc('exec_sql', { sql })
    
    if (error) {
      throw new Error(`Failed to enable RLS: ${error.message}`)
    }
  }

  /**
   * Disable RLS on a table
   */
  async disableRLS(tableName: string): Promise<void> {
    const sql = generateDisableRLSSQL(tableName)
    
    const { error } = await this.supabase.rpc('exec_sql', { sql })
    
    if (error) {
      throw new Error(`Failed to disable RLS: ${error.message}`)
    }
  }

  /**
   * Apply a policy template to a table
   */
  async applyTemplate(
    tableName: string,
    templateKey: keyof typeof POLICY_TEMPLATES,
    userIdColumn: string = 'user_id'
  ): Promise<void> {
    const template = POLICY_TEMPLATES[templateKey]
    
    if (!template) {
      throw new Error(`Template "${templateKey}" not found`)
    }

    // Replace placeholder column names
    const condition = template.condition.replace(/user_id/g, userIdColumn)
    const check = template.check?.replace(/user_id/g, userIdColumn)

    await this.createPolicy({
      tableName,
      policyName: `${tableName}_${template.name}`,
      operation: template.operation,
      condition,
      check,
    })
  }

  /**
   * Get all policies for a table
   */
  async getPolicies(tableName: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', tableName)
    
    if (error) {
      throw new Error(`Failed to get policies: ${error.message}`)
    }
    
    return data || []
  }

  /**
   * Test if current user can perform an operation
   */
  async testAccess(
    tableName: string,
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    conditions?: Record<string, any>
  ): Promise<boolean> {
    try {
      let query = this.supabase.from(tableName as any)

      switch (operation) {
        case 'SELECT':
          const { error: selectError } = await query.select('*').limit(1)
          return !selectError
          
        case 'INSERT':
          if (!conditions) return false
          const { error: insertError } = await query.insert(conditions)
          return !insertError
          
        case 'UPDATE':
          if (!conditions) return false
          const { error: updateError } = await query.update(conditions).eq('id', 'test')
          return !updateError
          
        case 'DELETE':
          const { error: deleteError } = await query.delete().eq('id', 'test')
          return !deleteError
          
        default:
          return false
      }
    } catch {
      return false
    }
  }
}

/**
 * Helper function to create a policy manager instance
 */
export function createPolicyManager(supabase: SupabaseClient<Database>): PolicyManager {
  return new PolicyManager(supabase)
}

/**
 * Pre-defined policy sets for common use cases
 */
export const POLICY_SETS = {
  /**
   * Basic CRUD policies for user-owned content
   */
  USER_OWNED_CRUD: (tableName: string, userIdColumn: string = 'user_id') => [
    {
      ...POLICY_TEMPLATES.VIEW_OWN,
      table: tableName,
      condition: POLICY_TEMPLATES.VIEW_OWN.condition.replace('user_id', userIdColumn),
    },
    {
      ...POLICY_TEMPLATES.CREATE_OWN,
      table: tableName,
      check: POLICY_TEMPLATES.CREATE_OWN.check?.replace('user_id', userIdColumn),
    },
    {
      ...POLICY_TEMPLATES.UPDATE_OWN,
      table: tableName,
      condition: POLICY_TEMPLATES.UPDATE_OWN.condition.replace('user_id', userIdColumn),
    },
    {
      ...POLICY_TEMPLATES.DELETE_OWN,
      table: tableName,
      condition: POLICY_TEMPLATES.DELETE_OWN.condition.replace('user_id', userIdColumn),
    },
  ],

  /**
   * Public read, authenticated write policies
   */
  PUBLIC_READ_AUTH_WRITE: (tableName: string) => [
    { ...POLICY_TEMPLATES.VIEW_ALL, table: tableName },
    { ...POLICY_TEMPLATES.AUTHENTICATED_ONLY, table: tableName, operation: 'INSERT' as const },
    { ...POLICY_TEMPLATES.AUTHENTICATED_ONLY, table: tableName, operation: 'UPDATE' as const },
    { ...POLICY_TEMPLATES.AUTHENTICATED_ONLY, table: tableName, operation: 'DELETE' as const },
  ],
}