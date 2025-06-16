/**
 * Environment Configuration
 * Platform-agnostic environment configuration management
 */

import { 
  validateEnv, 
  safeValidateEnv,
  sharedEnvSchema,
  webEnvSchema,
  mobileEnvSchema,
  createWebEnvSchema,
  createMobileEnvSchema
} from './validation';
import type { 
  AppConfig, 
  WebConfig, 
  MobileConfig, 
  Environment,
  Platform,
  ValidationResult
} from './types';

/**
 * Detect the current platform
 */
export function detectPlatform(): Platform {
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
 * Get environment variables based on platform
 */
export function getEnvVars(): Record<string, string | undefined> {
  const platform = detectPlatform();
  
  if (platform === 'web' || platform === 'server') {
    return process.env;
  } else if (platform === 'mobile') {
    // React Native / Expo environment
    return process.env;
  }
  
  return {};
}

/**
 * Load and validate environment configuration
 */
export function loadConfig<T = AppConfig>(
  platform?: Platform,
  customSchema?: any
): T {
  const detectedPlatform = platform || detectPlatform();
  const envVars = getEnvVars();
  
  let schema;
  
  if (customSchema) {
    schema = customSchema;
  } else {
    switch (detectedPlatform) {
      case 'web':
        schema = createWebEnvSchema();
        break;
      case 'mobile':
        schema = createMobileEnvSchema();
        break;
      default:
        schema = sharedEnvSchema;
    }
  }
  
  return validateEnv(schema, envVars);
}

/**
 * Safely load configuration with error handling
 */
export function safeLoadConfig<T = AppConfig>(
  platform?: Platform,
  customSchema?: any
): ValidationResult<T> {
  try {
    const detectedPlatform = platform || detectPlatform();
    const envVars = getEnvVars();
    
    let schema;
    
    if (customSchema) {
      schema = customSchema;
    } else {
      switch (detectedPlatform) {
        case 'web':
          schema = createWebEnvSchema();
          break;
        case 'mobile':
          schema = createMobileEnvSchema();
          break;
        default:
          schema = sharedEnvSchema;
      }
    }
    
    const result = safeValidateEnv(schema, envVars);
    
    if (result.success) {
      return {
        success: true,
        data: result.data as T
      };
    } else {
      return {
        success: false,
        errors: result.errors
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: [String(error)]
    };
  }
}

/**
 * Transform raw environment to typed configuration
 */
export function createAppConfig(env: Record<string, string | undefined>): AppConfig {
  return {
    env: {
      NODE_ENV: (env.NODE_ENV as Environment) || 'development',
      PLATFORM: detectPlatform(),
      DEBUG: env.DEBUG === 'true',
      LOG_LEVEL: (env.LOG_LEVEL as any) || 'info'
    },
    supabase: {
      url: env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL || '',
      anonKey: env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
      jwtSecret: env.SUPABASE_JWT_SECRET
    },
    auth: {
      secret: env.AUTH_SECRET || env.NEXTAUTH_SECRET || '',
      sessionMaxAge: env.SESSION_MAX_AGE ? parseInt(env.SESSION_MAX_AGE, 10) : 86400,
      cookieName: env.SESSION_COOKIE_NAME || 'starter-template-session',
      enableBiometric: env.ENABLE_BIOMETRIC_AUTH === 'true'
    },
    api: {
      baseUrl: env.API_BASE_URL || env.NEXT_PUBLIC_API_URL || env.EXPO_PUBLIC_API_URL || '',
      timeout: env.API_TIMEOUT ? parseInt(env.API_TIMEOUT, 10) : 10000,
      retries: env.API_RETRIES ? parseInt(env.API_RETRIES, 10) : 3,
      corsOrigins: env.CORS_ORIGINS ? env.CORS_ORIGINS.split(',') : []
    },
    analytics: {
      enabled: env.ENABLE_ANALYTICS === 'true',
      googleAnalyticsId: env.GOOGLE_ANALYTICS_ID || env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      posthogKey: env.POSTHOG_KEY || env.NEXT_PUBLIC_POSTHOG_KEY || env.EXPO_PUBLIC_POSTHOG_KEY,
      posthogHost: env.POSTHOG_HOST || env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      sentryDsn: env.SENTRY_DSN || env.NEXT_PUBLIC_SENTRY_DSN || env.EXPO_PUBLIC_SENTRY_DSN
    },
    features: {
      enableAnalytics: env.ENABLE_ANALYTICS === 'true',
      enableErrorReporting: env.ENABLE_ERROR_REPORTING === 'true',
      enablePerformanceMonitoring: env.ENABLE_PERFORMANCE_MONITORING === 'true',
      enableMaintenanceMode: env.ENABLE_MAINTENANCE_MODE === 'true',
      enableBetaFeatures: env.ENABLE_BETA_FEATURES === 'true',
      enableExperimentalUI: env.ENABLE_EXPERIMENTAL_UI === 'true'
    }
  };
}

/**
 * Create web-specific configuration
 */
export function createWebConfig(env: Record<string, string | undefined>): WebConfig {
  const baseConfig = createAppConfig(env);
  
  return {
    ...baseConfig,
    nextAuth: {
      url: env.NEXTAUTH_URL || env.NEXT_PUBLIC_APP_URL || '',
      secret: env.NEXTAUTH_SECRET || ''
    },
    database: env.DATABASE_URL ? {
      url: env.DATABASE_URL,
      maxConnections: env.DATABASE_MAX_CONNECTIONS ? parseInt(env.DATABASE_MAX_CONNECTIONS, 10) : 10,
      ssl: env.DATABASE_SSL !== 'false',
      schema: env.DATABASE_SCHEMA || 'public'
    } : undefined,
    redis: env.REDIS_URL ? {
      url: env.REDIS_URL,
      maxRetries: env.REDIS_MAX_RETRIES ? parseInt(env.REDIS_MAX_RETRIES, 10) : 3,
      retryDelay: env.REDIS_RETRY_DELAY ? parseInt(env.REDIS_RETRY_DELAY, 10) : 1000
    } : undefined,
    email: env.EMAIL_FROM ? {
      from: env.EMAIL_FROM,
      provider: (env.EMAIL_PROVIDER as any) || 'resend',
      apiKey: env.EMAIL_API_KEY || env.RESEND_API_KEY
    } : undefined,
    payments: env.STRIPE_PUBLISHABLE_KEY ? {
      provider: 'stripe',
      publishableKey: env.STRIPE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      secretKey: env.STRIPE_SECRET_KEY || '',
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
      currency: env.PAYMENT_CURRENCY || 'usd'
    } : undefined,
    oauth: {
      google: env.GOOGLE_CLIENT_ID ? {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET || ''
      } : undefined,
      github: env.GITHUB_CLIENT_ID ? {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET || ''
      } : undefined
    },
    uploadthing: env.UPLOADTHING_SECRET ? {
      secret: env.UPLOADTHING_SECRET,
      appId: env.UPLOADTHING_APP_ID || ''
    } : undefined
  };
}

/**
 * Create mobile-specific configuration
 */
export function createMobileConfig(env: Record<string, string | undefined>): MobileConfig {
  const baseConfig = createAppConfig(env);
  
  return {
    ...baseConfig,
    expo: {
      projectId: env.EXPO_PROJECT_ID || '',
      scheme: env.EXPO_PUBLIC_APP_SCHEME || env.EXPO_PUBLIC_OAUTH_REDIRECT_SCHEME || 'starter-template',
      buildProfile: env.EAS_BUILD_PROFILE || 'development'
    },
    maps: env.GOOGLE_MAPS_API_KEY || env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ? {
      googleMapsApiKey: env.GOOGLE_MAPS_API_KEY || env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      mapboxAccessToken: env.MAPBOX_ACCESS_TOKEN || env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN
    } : undefined,
    pushNotifications: {
      enabled: env.ENABLE_PUSH_NOTIFICATIONS !== 'false',
      fcmSenderId: env.FCM_SENDER_ID || env.EXPO_PUBLIC_FCM_SENDER_ID,
      apnsKeyId: env.APNS_KEY_ID,
      apnsTeamId: env.APNS_TEAM_ID,
      expoPushToken: env.EXPO_PUSH_TOKEN
    },
    permissions: {
      camera: env.REQUIRE_CAMERA_PERMISSION === 'true',
      location: env.REQUIRE_LOCATION_PERMISSION === 'true',
      notifications: env.REQUIRE_NOTIFICATION_PERMISSION !== 'false',
      contacts: env.REQUIRE_CONTACTS_PERMISSION === 'true'
    }
  };
}

/**
 * Global configuration instances
 */
let globalConfig: AppConfig | null = null;

/**
 * Get or create global configuration
 */
export function getConfig<T = AppConfig>(forceReload = false): T {
  if (!globalConfig || forceReload) {
    const platform = detectPlatform();
    
    switch (platform) {
      case 'web':
        globalConfig = createWebConfig(getEnvVars()) as AppConfig;
        break;
      case 'mobile':
        globalConfig = createMobileConfig(getEnvVars()) as AppConfig;
        break;
      default:
        globalConfig = createAppConfig(getEnvVars());
    }
  }
  
  return globalConfig as T;
}

/**
 * Initialize configuration with validation
 */
export function initializeConfig<T = AppConfig>(options?: {
  platform?: Platform;
  throwOnError?: boolean;
  logErrors?: boolean;
}): T {
  const { platform, throwOnError = true, logErrors = true } = options || {};
  
  try {
    const config = loadConfig<T>(platform);
    globalConfig = config as AppConfig;
    
    if (logErrors && globalConfig.env.DEBUG) {
      console.log('✅ Environment configuration loaded successfully');
    }
    
    return config;
  } catch (error) {
    if (logErrors) {
      console.error('❌ Failed to load environment configuration:', error);
    }
    
    if (throwOnError) {
      throw error;
    }
    
    // Return a minimal config if not throwing
    return createAppConfig({}) as T;
  }
}

/**
 * Validate current environment
 */
export function validateCurrentEnv(): ValidationResult<AppConfig> {
  const platform = detectPlatform();
  return safeLoadConfig(platform);
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getConfig().env.NODE_ENV === 'development';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getConfig().env.NODE_ENV === 'production';
}

/**
 * Check if running in staging
 */
export function isStaging(): boolean {
  return getConfig().env.NODE_ENV === 'staging';
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return getConfig().env.NODE_ENV === 'test';
}

/**
 * Get environment-specific values
 */
export function getEnvValue<T>(
  development: T,
  staging: T,
  production: T,
  test?: T
): T {
  const env = getConfig().env.NODE_ENV;
  
  switch (env) {
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