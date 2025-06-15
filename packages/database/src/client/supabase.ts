import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import { loadSupabaseConfig, validateSupabaseConfig, type SupabaseConfig } from './config'

export type TypedSupabaseClient = SupabaseClient<Database>

let supabaseInstance: TypedSupabaseClient | null = null

/**
 * Create a Supabase client with the given configuration
 */
export function createSupabaseClient(config?: SupabaseConfig): TypedSupabaseClient {
  const clientConfig = config || loadSupabaseConfig()
  validateSupabaseConfig(clientConfig)

  return createClient<Database>(clientConfig.url, clientConfig.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })
}

/**
 * Create a Supabase client with service role key (server-side only)
 */
export function createSupabaseServiceClient(config?: SupabaseConfig): TypedSupabaseClient {
  const clientConfig = config || loadSupabaseConfig()
  validateSupabaseConfig(clientConfig)

  if (!clientConfig.serviceRoleKey) {
    throw new Error('Service role key is required for service client')
  }

  return createClient<Database>(clientConfig.url, clientConfig.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Get the singleton Supabase client instance
 */
export function getSupabaseClient(): TypedSupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient()
  }
  return supabaseInstance
}

/**
 * Initialize Supabase client with custom configuration
 */
export function initSupabase(config: SupabaseConfig): TypedSupabaseClient {
  supabaseInstance = createSupabaseClient(config)
  return supabaseInstance
}

/**
 * Reset the Supabase client instance (useful for testing)
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null
}

/**
 * Default export - the singleton client
 */
export const supabase = getSupabaseClient()

/**
 * Re-export Supabase types for convenience
 */
export type {
  Session,
  User,
  AuthError,
  PostgrestError,
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'