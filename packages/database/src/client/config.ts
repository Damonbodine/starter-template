/**
 * Supabase configuration and environment validation
 */

export interface SupabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
  projectId?: string
}

/**
 * Default environment variable names
 */
export const ENV_VARS = {
  SUPABASE_URL: 'SUPABASE_URL',
  SUPABASE_ANON_KEY: 'SUPABASE_ANON_KEY',
  SUPABASE_SERVICE_ROLE_KEY: 'SUPABASE_SERVICE_ROLE_KEY',
  SUPABASE_PROJECT_ID: 'SUPABASE_PROJECT_ID',
  // Alternative names for different environments
  NEXT_PUBLIC_SUPABASE_URL: 'NEXT_PUBLIC_SUPABASE_URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  EXPO_PUBLIC_SUPABASE_URL: 'EXPO_PUBLIC_SUPABASE_URL',
  EXPO_PUBLIC_SUPABASE_ANON_KEY: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
} as const

/**
 * Get environment variable with fallbacks
 */
function getEnvVar(name: string, fallbacks: string[] = []): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name] || fallbacks.find(fallback => process.env[fallback])
  }
  return undefined
}

/**
 * Load Supabase configuration from environment variables
 */
export function loadSupabaseConfig(): SupabaseConfig {
  const url = getEnvVar(ENV_VARS.SUPABASE_URL, [
    ENV_VARS.NEXT_PUBLIC_SUPABASE_URL,
    ENV_VARS.EXPO_PUBLIC_SUPABASE_URL,
  ])

  const anonKey = getEnvVar(ENV_VARS.SUPABASE_ANON_KEY, [
    ENV_VARS.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ENV_VARS.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  ])

  const serviceRoleKey = getEnvVar(ENV_VARS.SUPABASE_SERVICE_ROLE_KEY)
  const projectId = getEnvVar(ENV_VARS.SUPABASE_PROJECT_ID)

  if (!url) {
    throw new Error(
      `Missing Supabase URL. Please set one of: ${[
        ENV_VARS.SUPABASE_URL,
        ENV_VARS.NEXT_PUBLIC_SUPABASE_URL,
        ENV_VARS.EXPO_PUBLIC_SUPABASE_URL,
      ].join(', ')}`
    )
  }

  if (!anonKey) {
    throw new Error(
      `Missing Supabase anon key. Please set one of: ${[
        ENV_VARS.SUPABASE_ANON_KEY,
        ENV_VARS.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        ENV_VARS.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      ].join(', ')}`
    )
  }

  return {
    url,
    anonKey,
    serviceRoleKey,
    projectId,
  }
}

/**
 * Validate Supabase configuration
 */
export function validateSupabaseConfig(config: SupabaseConfig): void {
  if (!config.url) {
    throw new Error('Supabase URL is required')
  }

  if (!config.anonKey) {
    throw new Error('Supabase anon key is required')
  }

  // Validate URL format
  try {
    new URL(config.url)
  } catch {
    throw new Error('Invalid Supabase URL format')
  }

  // Basic validation for Supabase URL pattern
  if (!config.url.includes('supabase.co') && !config.url.includes('localhost')) {
    console.warn('Supabase URL does not appear to be a valid Supabase endpoint')
  }
}