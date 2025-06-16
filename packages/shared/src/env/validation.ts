/**
 * Environment Validation Schemas
 * Zod schemas for validating environment variables
 */

import { z } from 'zod';

/**
 * Common validation helpers
 */
const createEnumSchema = <T extends readonly [string, ...string[]]>(values: T) =>
  z.enum(values);

const createOptionalString = (defaultValue?: string) =>
  z.string().optional().default(defaultValue);

const createRequiredString = (message?: string) =>
  z.string().min(1, message || 'This field is required');

const createOptionalBoolean = (defaultValue = false) =>
  z.string()
    .optional()
    .default(String(defaultValue))
    .transform((val) => val === 'true' || val === '1');

const createOptionalNumber = (defaultValue?: number) =>
  z.string()
    .optional()
    .default(defaultValue ? String(defaultValue) : '')
    .transform((val) => (val ? parseInt(val, 10) : defaultValue))
    .pipe(z.number().optional());

const createUrl = (message?: string) =>
  z.string().url(message || 'Must be a valid URL');

const createCommaSeparatedArray = () =>
  z.string()
    .optional()
    .default('')
    .transform((val) => val.split(',').filter(Boolean));

/**
 * Base environment schema
 */
export const baseEnvSchema = z.object({
  NODE_ENV: createEnumSchema(['development', 'staging', 'production', 'test'])
    .default('development'),
  DEBUG: createOptionalBoolean(false),
  LOG_LEVEL: createEnumSchema(['error', 'warn', 'info', 'debug'])
    .default('info'),
});

/**
 * Supabase configuration schema
 */
export const supabaseEnvSchema = z.object({
  SUPABASE_URL: createUrl('Supabase URL is required'),
  SUPABASE_ANON_KEY: createRequiredString('Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: createOptionalString(),
  SUPABASE_JWT_SECRET: createOptionalString(),
});

/**
 * Authentication configuration schema
 */
export const authEnvSchema = z.object({
  AUTH_SECRET: createRequiredString('Auth secret is required'),
  SESSION_MAX_AGE: createOptionalNumber(86400), // 24 hours
  SESSION_COOKIE_NAME: createOptionalString('starter-template-session'),
  ENABLE_BIOMETRIC_AUTH: createOptionalBoolean(false),
});

/**
 * API configuration schema
 */
export const apiEnvSchema = z.object({
  API_BASE_URL: createUrl('API base URL is required'),
  API_TIMEOUT: createOptionalNumber(10000),
  API_RETRIES: createOptionalNumber(3),
  CORS_ORIGINS: createCommaSeparatedArray(),
});

/**
 * Database configuration schema
 */
export const databaseEnvSchema = z.object({
  DATABASE_URL: createRequiredString('Database URL is required'),
  DATABASE_MAX_CONNECTIONS: createOptionalNumber(10),
  DATABASE_SSL: createOptionalBoolean(true),
  DATABASE_SCHEMA: createOptionalString('public'),
});

/**
 * Redis configuration schema
 */
export const redisEnvSchema = z.object({
  REDIS_URL: createOptionalString(),
  REDIS_MAX_RETRIES: createOptionalNumber(3),
  REDIS_RETRY_DELAY: createOptionalNumber(1000),
});

/**
 * Analytics configuration schema
 */
export const analyticsEnvSchema = z.object({
  ENABLE_ANALYTICS: createOptionalBoolean(true),
  GOOGLE_ANALYTICS_ID: createOptionalString(),
  POSTHOG_KEY: createOptionalString(),
  POSTHOG_HOST: createOptionalString('https://app.posthog.com'),
  SENTRY_DSN: createOptionalString(),
});

/**
 * Feature flags schema
 */
export const featureFlagsSchema = z.object({
  ENABLE_ANALYTICS: createOptionalBoolean(true),
  ENABLE_ERROR_REPORTING: createOptionalBoolean(true),
  ENABLE_PERFORMANCE_MONITORING: createOptionalBoolean(true),
  ENABLE_MAINTENANCE_MODE: createOptionalBoolean(false),
  ENABLE_BETA_FEATURES: createOptionalBoolean(false),
  ENABLE_EXPERIMENTAL_UI: createOptionalBoolean(false),
});

/**
 * Email configuration schema
 */
export const emailEnvSchema = z.object({
  EMAIL_FROM: createRequiredString('Email from address is required'),
  EMAIL_PROVIDER: createEnumSchema(['resend', 'sendgrid', 'ses', 'smtp']),
  EMAIL_API_KEY: createOptionalString(),
  SMTP_HOST: createOptionalString(),
  SMTP_PORT: createOptionalNumber(587),
  SMTP_USER: createOptionalString(),
  SMTP_PASS: createOptionalString(),
});

/**
 * Storage configuration schema
 */
export const storageEnvSchema = z.object({
  STORAGE_PROVIDER: createEnumSchema(['supabase', 'aws', 'gcp', 'local'])
    .default('supabase'),
  STORAGE_BUCKET: createOptionalString(),
  STORAGE_REGION: createOptionalString(),
  STORAGE_ACCESS_KEY_ID: createOptionalString(),
  STORAGE_SECRET_ACCESS_KEY: createOptionalString(),
  STORAGE_MAX_FILE_SIZE: createOptionalNumber(10 * 1024 * 1024), // 10MB
});

/**
 * Payment configuration schema
 */
export const paymentEnvSchema = z.object({
  PAYMENT_PROVIDER: createEnumSchema(['stripe', 'paypal']).optional(),
  STRIPE_PUBLISHABLE_KEY: createOptionalString(),
  STRIPE_SECRET_KEY: createOptionalString(),
  STRIPE_WEBHOOK_SECRET: createOptionalString(),
  PAYMENT_CURRENCY: createOptionalString('usd'),
});

/**
 * OAuth configuration schema
 */
export const oauthEnvSchema = z.object({
  GOOGLE_CLIENT_ID: createOptionalString(),
  GOOGLE_CLIENT_SECRET: createOptionalString(),
  GITHUB_CLIENT_ID: createOptionalString(),
  GITHUB_CLIENT_SECRET: createOptionalString(),
  FACEBOOK_APP_ID: createOptionalString(),
  FACEBOOK_APP_SECRET: createOptionalString(),
});

/**
 * Security configuration schema
 */
export const securityEnvSchema = z.object({
  ALLOWED_HOSTS: createCommaSeparatedArray(),
  RATE_LIMIT_WINDOW_MS: createOptionalNumber(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: createOptionalNumber(100),
  ENABLE_CSRF: createOptionalBoolean(true),
  ENABLE_HELMET: createOptionalBoolean(true),
});

/**
 * Monitoring configuration schema
 */
export const monitoringEnvSchema = z.object({
  SENTRY_ORG: createOptionalString(),
  SENTRY_PROJECT: createOptionalString(),
  SENTRY_AUTH_TOKEN: createOptionalString(),
  LOGTAIL_TOKEN: createOptionalString(),
  HEALTH_CHECK_ENDPOINT: createOptionalString('/health'),
  HEALTH_CHECK_INTERVAL: createOptionalNumber(30000), // 30 seconds
});

/**
 * Build configuration schema
 */
export const buildEnvSchema = z.object({
  APP_VERSION: createOptionalString('1.0.0'),
  BUILD_NUMBER: createOptionalString(),
  COMMIT_SHA: createOptionalString(),
  BUILD_DATE: createOptionalString(),
  ENABLE_SOURCE_MAPS: createOptionalBoolean(false),
  ENABLE_BUNDLE_ANALYZER: createOptionalBoolean(false),
});

/**
 * Next.js specific schema
 */
export const nextjsEnvSchema = z.object({
  NEXTAUTH_URL: createUrl('NextAuth URL is required'),
  NEXTAUTH_SECRET: createRequiredString('NextAuth secret is required'),
  UPLOADTHING_SECRET: createOptionalString(),
  UPLOADTHING_APP_ID: createOptionalString(),
  NEXT_TELEMETRY_DISABLED: createOptionalBoolean(true),
  ANALYZE: createOptionalBoolean(false),
});

/**
 * Expo specific schema
 */
export const expoEnvSchema = z.object({
  EXPO_PROJECT_ID: createOptionalString(),
  EXPO_PUBLIC_APP_SCHEME: createOptionalString('starter-template'),
  EAS_BUILD_PROFILE: createOptionalString('development'),
  EXPO_PUSH_TOKEN: createOptionalString(),
  GOOGLE_MAPS_API_KEY: createOptionalString(),
  MAPBOX_ACCESS_TOKEN: createOptionalString(),
  FCM_SENDER_ID: createOptionalString(),
  APNS_KEY_ID: createOptionalString(),
  APNS_TEAM_ID: createOptionalString(),
});

/**
 * Push notifications schema
 */
export const pushNotificationsSchema = z.object({
  ENABLE_PUSH_NOTIFICATIONS: createOptionalBoolean(true),
  FCM_SENDER_ID: createOptionalString(),
  APNS_KEY_ID: createOptionalString(),
  APNS_TEAM_ID: createOptionalString(),
  EXPO_PUSH_TOKEN: createOptionalString(),
});

/**
 * Mobile permissions schema
 */
export const mobilePermissionsSchema = z.object({
  REQUIRE_CAMERA_PERMISSION: createOptionalBoolean(false),
  REQUIRE_LOCATION_PERMISSION: createOptionalBoolean(false),
  REQUIRE_NOTIFICATION_PERMISSION: createOptionalBoolean(true),
  REQUIRE_CONTACTS_PERMISSION: createOptionalBoolean(false),
  ENABLE_BACKGROUND_SYNC: createOptionalBoolean(true),
  BACKGROUND_SYNC_INTERVAL: createOptionalNumber(300000), // 5 minutes
});

/**
 * Combined schemas for different platforms
 */
export const sharedEnvSchema = baseEnvSchema
  .merge(supabaseEnvSchema)
  .merge(authEnvSchema)
  .merge(apiEnvSchema)
  .merge(analyticsEnvSchema)
  .merge(featureFlagsSchema);

export const webEnvSchema = sharedEnvSchema
  .merge(nextjsEnvSchema)
  .merge(databaseEnvSchema)
  .merge(redisEnvSchema)
  .merge(emailEnvSchema)
  .merge(storageEnvSchema)
  .merge(paymentEnvSchema)
  .merge(oauthEnvSchema)
  .merge(securityEnvSchema)
  .merge(monitoringEnvSchema)
  .merge(buildEnvSchema);

export const mobileEnvSchema = sharedEnvSchema
  .merge(expoEnvSchema)
  .merge(pushNotificationsSchema)
  .merge(mobilePermissionsSchema)
  .merge(buildEnvSchema);

/**
 * Runtime environment schemas with platform prefixes
 */
export const createWebEnvSchema = () => {
  // Transform NEXT_PUBLIC_ prefixed variables
  return webEnvSchema.transform((data) => {
    const transformed: any = { ...data };
    
    // Handle Next.js public variables
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith('NEXT_PUBLIC_')) {
        const unprefixedKey = key.replace('NEXT_PUBLIC_', '');
        if (unprefixedKey in transformed) {
          transformed[unprefixedKey] = process.env[key];
        }
      }
    });
    
    return transformed;
  });
};

export const createMobileEnvSchema = () => {
  // Transform EXPO_PUBLIC_ prefixed variables
  return mobileEnvSchema.transform((data) => {
    const transformed: any = { ...data };
    
    // Handle Expo public variables
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith('EXPO_PUBLIC_')) {
        const unprefixedKey = key.replace('EXPO_PUBLIC_', '');
        if (unprefixedKey in transformed) {
          transformed[unprefixedKey] = process.env[key];
        }
      }
    });
    
    return transformed;
  });
};

/**
 * Environment validation function
 */
export function validateEnv<T>(schema: z.ZodSchema<T>, env: Record<string, string | undefined>): T {
  try {
    return schema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });
      
      throw new Error(
        `Environment validation failed:\n${errorMessages.join('\n')}`
      );
    }
    throw error;
  }
}

/**
 * Safe environment validation with detailed results
 */
export function safeValidateEnv<T>(
  schema: z.ZodSchema<T>, 
  env: Record<string, string | undefined>
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const data = schema.parse(env);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });
      return { success: false, errors };
    }
    return { success: false, errors: [String(error)] };
  }
}