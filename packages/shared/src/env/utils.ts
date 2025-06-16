/**
 * Environment Utilities
 * Helper functions for working with environment variables
 */

import type { EnvLoaderOptions, Environment, Platform } from './types';

/**
 * Load environment variable with validation and transformation
 */
export function loadEnvVar(
  key: string,
  options: EnvLoaderOptions = {}
): string | undefined {
  const {
    required = false,
    defaultValue,
    validate,
    transform,
    description
  } = options;

  // Get value from environment
  let value: string | undefined;
  
  // Check different prefixes based on platform
  const prefixes = ['', 'NEXT_PUBLIC_', 'EXPO_PUBLIC_', 'REACT_APP_'];
  
  for (const prefix of prefixes) {
    const envKey = prefix + key;
    if (process.env[envKey]) {
      value = process.env[envKey];
      break;
    }
  }

  // Use default if no value found
  if (value === undefined) {
    value = defaultValue;
  }

  // Check if required
  if (required && !value) {
    const error = `Required environment variable ${key} is not set`;
    const hint = description ? ` (${description})` : '';
    throw new Error(error + hint);
  }

  // Validate if value exists and validator provided
  if (value && validate && !validate(value)) {
    const error = `Environment variable ${key} failed validation`;
    const hint = description ? ` (${description})` : '';
    throw new Error(error + hint);
  }

  // Transform value if transformer provided
  if (value && transform) {
    try {
      return transform(value);
    } catch (error) {
      throw new Error(
        `Failed to transform environment variable ${key}: ${error}`
      );
    }
  }

  return value;
}

/**
 * Load boolean environment variable
 */
export function loadBooleanEnv(
  key: string,
  defaultValue = false
): boolean {
  return loadEnvVar(key, {
    defaultValue: String(defaultValue),
    transform: (value) => {
      const normalized = value.toLowerCase();
      return normalized === 'true' || normalized === '1' || normalized === 'yes';
    }
  }) as boolean;
}

/**
 * Load number environment variable
 */
export function loadNumberEnv(
  key: string,
  defaultValue?: number
): number | undefined {
  return loadEnvVar(key, {
    defaultValue: defaultValue !== undefined ? String(defaultValue) : undefined,
    validate: (value) => !isNaN(Number(value)),
    transform: (value) => Number(value)
  }) as number | undefined;
}

/**
 * Load array environment variable (comma-separated)
 */
export function loadArrayEnv(
  key: string,
  defaultValue: string[] = []
): string[] {
  return loadEnvVar(key, {
    defaultValue: defaultValue.join(','),
    transform: (value) => value.split(',').map(v => v.trim()).filter(Boolean)
  }) as string[];
}

/**
 * Load URL environment variable with validation
 */
export function loadUrlEnv(
  key: string,
  required = false,
  defaultValue?: string
): string | undefined {
  return loadEnvVar(key, {
    required,
    defaultValue,
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    description: 'Must be a valid URL'
  });
}

/**
 * Load JSON environment variable
 */
export function loadJsonEnv<T = any>(
  key: string,
  defaultValue?: T
): T | undefined {
  return loadEnvVar(key, {
    defaultValue: defaultValue ? JSON.stringify(defaultValue) : undefined,
    validate: (value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    },
    transform: (value) => JSON.parse(value),
    description: 'Must be valid JSON'
  }) as T | undefined;
}

/**
 * Get all environment variables with a specific prefix
 */
export function getEnvWithPrefix(prefix: string): Record<string, string> {
  const result: Record<string, string> = {};
  
  Object.keys(process.env).forEach((key) => {
    if (key.startsWith(prefix)) {
      const value = process.env[key];
      if (value) {
        const newKey = key.substring(prefix.length);
        result[newKey] = value;
      }
    }
  });
  
  return result;
}

/**
 * Check if environment variable exists
 */
export function hasEnvVar(key: string): boolean {
  const prefixes = ['', 'NEXT_PUBLIC_', 'EXPO_PUBLIC_', 'REACT_APP_'];
  
  return prefixes.some(prefix => {
    const envKey = prefix + key;
    return process.env[envKey] !== undefined;
  });
}

/**
 * Get environment variable with multiple possible keys
 */
export function getEnvVarWithFallback(keys: string[]): string | undefined {
  for (const key of keys) {
    const value = loadEnvVar(key);
    if (value) {
      return value;
    }
  }
  return undefined;
}

/**
 * Mask sensitive environment variables for logging
 */
export function maskSensitiveEnvVars(env: Record<string, string | undefined>): Record<string, string> {
  const sensitivePatterns = [
    /secret/i,
    /key/i,
    /token/i,
    /password/i,
    /pass/i,
    /auth/i,
    /api_key/i,
    /private/i,
    /credential/i
  ];

  const masked: Record<string, string> = {};

  Object.entries(env).forEach(([key, value]) => {
    if (!value) {
      masked[key] = '';
      return;
    }

    const isSensitive = sensitivePatterns.some(pattern => pattern.test(key));
    
    if (isSensitive) {
      // Show first 4 and last 4 characters
      if (value.length > 8) {
        masked[key] = `${value.slice(0, 4)}${'*'.repeat(value.length - 8)}${value.slice(-4)}`;
      } else {
        masked[key] = '*'.repeat(value.length);
      }
    } else {
      masked[key] = value;
    }
  });

  return masked;
}

/**
 * Validate required environment variables
 */
export function validateRequiredEnvVars(requiredVars: string[]): void {
  const missing: string[] = [];

  requiredVars.forEach(key => {
    if (!hasEnvVar(key)) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}

/**
 * Get environment summary for debugging
 */
export function getEnvironmentSummary(): {
  platform: Platform;
  nodeEnv: Environment;
  hasRequiredVars: boolean;
  availableVars: string[];
  maskedVars: Record<string, string>;
} {
  const platform = detectPlatform();
  const nodeEnv = (process.env.NODE_ENV as Environment) || 'development';
  
  // Common required variables
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];

  let hasRequiredVars = true;
  try {
    validateRequiredEnvVars(requiredVars);
  } catch {
    hasRequiredVars = false;
  }

  const availableVars = Object.keys(process.env).filter(key => 
    key.startsWith('NEXT_PUBLIC_') || 
    key.startsWith('EXPO_PUBLIC_') || 
    key.startsWith('REACT_APP_') ||
    requiredVars.includes(key)
  );

  const relevantEnv: Record<string, string | undefined> = {};
  availableVars.forEach(key => {
    relevantEnv[key] = process.env[key];
  });

  return {
    platform,
    nodeEnv,
    hasRequiredVars,
    availableVars,
    maskedVars: maskSensitiveEnvVars(relevantEnv)
  };
}

/**
 * Detect platform helper
 */
function detectPlatform(): Platform {
  if (typeof window !== 'undefined') {
    // Browser environment
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      return 'mobile';
    }
    return 'web';
  } else if (typeof process !== 'undefined') {
    // Node.js environment
    if (process.env.EXPO_PUBLIC_APP_SCHEME) {
      return 'mobile';
    }
    return 'server';
  }
  return 'universal';
}

/**
 * Environment variable loader with retry logic
 */
export class EnvLoader {
  private cache = new Map<string, any>();
  private retries = 3;
  private retryDelay = 100;

  constructor(options?: { retries?: number; retryDelay?: number }) {
    if (options) {
      this.retries = options.retries ?? 3;
      this.retryDelay = options.retryDelay ?? 100;
    }
  }

  async load<T>(
    key: string,
    options: EnvLoaderOptions & { async?: boolean } = {}
  ): Promise<T | undefined> {
    const cacheKey = `${key}:${JSON.stringify(options)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const value = loadEnvVar(key, options);
        this.cache.set(cacheKey, value);
        return value as T;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.retries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }

    if (options.required) {
      throw lastError;
    }

    return options.defaultValue as T;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

/**
 * Default environment loader instance
 */
export const envLoader = new EnvLoader();

/**
 * Utility to check environment health
 */
export function checkEnvironmentHealth(): {
  status: 'healthy' | 'warning' | 'error';
  checks: Array<{
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message: string;
  }>;
} {
  const checks = [
    {
      name: 'NODE_ENV',
      status: process.env.NODE_ENV ? 'pass' : 'warn' as const,
      message: process.env.NODE_ENV ? 
        `Environment is ${process.env.NODE_ENV}` : 
        'NODE_ENV is not set, defaulting to development'
    },
    {
      name: 'Supabase URL',
      status: hasEnvVar('SUPABASE_URL') ? 'pass' : 'fail' as const,
      message: hasEnvVar('SUPABASE_URL') ? 
        'Supabase URL is configured' : 
        'Supabase URL is missing'
    },
    {
      name: 'Supabase Keys',
      status: hasEnvVar('SUPABASE_ANON_KEY') ? 'pass' : 'fail' as const,
      message: hasEnvVar('SUPABASE_ANON_KEY') ? 
        'Supabase anon key is configured' : 
        'Supabase anon key is missing'
    }
  ];

  const hasFailures = checks.some(check => check.status === 'fail');
  const hasWarnings = checks.some(check => check.status === 'warn');

  return {
    status: hasFailures ? 'error' : hasWarnings ? 'warning' : 'healthy',
    checks
  };
}