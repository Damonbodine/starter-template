/**
 * Next.js Environment Configuration
 * Web app specific environment setup with validation
 */

import { z } from 'zod';
import { 
  validateEnv, 
  createWebEnvSchema,
  webEnvSchema 
} from '@starter-template/shared/env';

/**
 * Next.js specific environment schema
 */
const nextjsEnvSchema = z.object({
  // Next.js Configuration
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  
  // App URLs
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Supabase (Next.js prefixed)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),
  
  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(1),
  
  // Database
  DATABASE_URL: z.string().url().optional(),
  
  // External Services
  UPLOADTHING_SECRET: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),
  
  // Email
  EMAIL_FROM: z.string().email().optional(),
  RESEND_API_KEY: z.string().optional(),
  
  // Payment
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default('https://app.posthog.com'),
  
  // Monitoring
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_ENABLE_ERROR_REPORTING: z.string().transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_ENABLE_DEVTOOLS: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_BETA_FEATURES: z.string().transform(val => val === 'true').default('false'),
  
  // Development
  NEXT_TELEMETRY_DISABLED: z.string().transform(val => val === '1').default('1'),
  ANALYZE: z.string().transform(val => val === 'true').default('false'),
  DEBUG: z.string().transform(val => val === 'true').default('false'),
});

/**
 * Validate and parse environment variables
 */
function validateWebEnv() {
  try {
    return nextjsEnvSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment configuration:');
    
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    
    process.exit(1);
  }
}

/**
 * Validated environment variables
 */
export const env = validateWebEnv();

/**
 * Environment configuration object
 */
export const config = {
  app: {
    url: env.NEXT_PUBLIC_APP_URL,
    env: env.NODE_ENV,
    debug: env.DEBUG,
  },
  
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: env.SUPABASE_JWT_SECRET,
  },
  
  auth: {
    nextAuthUrl: env.NEXTAUTH_URL || env.NEXT_PUBLIC_APP_URL,
    nextAuthSecret: env.NEXTAUTH_SECRET,
  },
  
  api: {
    baseUrl: env.NEXT_PUBLIC_API_URL || `${env.NEXT_PUBLIC_APP_URL}/api`,
  },
  
  database: {
    url: env.DATABASE_URL,
  },
  
  uploadthing: {
    secret: env.UPLOADTHING_SECRET,
    appId: env.UPLOADTHING_APP_ID,
  },
  
  email: {
    from: env.EMAIL_FROM,
    resendApiKey: env.RESEND_API_KEY,
  },
  
  stripe: {
    publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  },
  
  oauth: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  
  analytics: {
    googleAnalyticsId: env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    posthog: {
      key: env.NEXT_PUBLIC_POSTHOG_KEY,
      host: env.NEXT_PUBLIC_POSTHOG_HOST,
    },
  },
  
  monitoring: {
    sentry: {
      dsn: env.NEXT_PUBLIC_SENTRY_DSN,
      org: env.SENTRY_ORG,
      project: env.SENTRY_PROJECT,
      authToken: env.SENTRY_AUTH_TOKEN,
    },
  },
  
  features: {
    analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    errorReporting: env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING,
    devtools: env.NEXT_PUBLIC_ENABLE_DEVTOOLS,
    betaFeatures: env.NEXT_PUBLIC_ENABLE_BETA_FEATURES,
  },
  
  development: {
    telemetryDisabled: env.NEXT_TELEMETRY_DISABLED,
    bundleAnalyzer: env.ANALYZE,
  },
} as const;

/**
 * Runtime environment checks
 */
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isStaging = env.NODE_ENV === 'staging';
export const isTest = env.NODE_ENV === 'test';

/**
 * Helper to get environment-specific values
 */
export function getEnvValue<T>(
  development: T,
  staging: T,
  production: T,
  test?: T
): T {
  switch (env.NODE_ENV) {
    case 'development':
      return development;
    case 'staging':
      return staging;
    case 'production':
      return production;
    case 'test':
      return test || development;
    default:
      return development;
  }
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof config.features): boolean {
  return config.features[feature];
}

/**
 * Get API URL for different environments
 */
export function getApiUrl(path = ''): string {
  const baseUrl = config.api.baseUrl;
  return path ? `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}` : baseUrl;
}

/**
 * Get public asset URL
 */
export function getAssetUrl(path: string): string {
  const baseUrl = config.app.url;
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Validate environment on app startup
 */
export function validateEnvironment(): void {
  const errors: string[] = [];
  
  // Required for all environments
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  }
  
  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }
  
  if (!env.NEXTAUTH_SECRET) {
    errors.push('NEXTAUTH_SECRET is required');
  }
  
  // Production-specific requirements
  if (isProduction) {
    if (!env.DATABASE_URL) {
      errors.push('DATABASE_URL is required in production');
    }
    
    if (config.features.analytics && !env.NEXT_PUBLIC_GA_MEASUREMENT_ID && !env.NEXT_PUBLIC_POSTHOG_KEY) {
      errors.push('Analytics is enabled but no analytics service is configured');
    }
    
    if (config.features.errorReporting && !env.NEXT_PUBLIC_SENTRY_DSN) {
      errors.push('Error reporting is enabled but Sentry DSN is not configured');
    }
  }
  
  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
  
  if (isDevelopment) {
    console.log('✅ Environment configuration loaded successfully');
    console.log(`   Environment: ${env.NODE_ENV}`);
    console.log(`   App URL: ${config.app.url}`);
    console.log(`   API URL: ${config.api.baseUrl}`);
    console.log(`   Supabase: ${config.supabase.url}`);
  }
}