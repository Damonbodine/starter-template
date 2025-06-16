/**
 * Expo React Native Environment Configuration
 * Mobile app specific environment setup with validation
 */

import { z } from 'zod';
import Constants from 'expo-constants';

/**
 * Expo specific environment schema
 */
const expoEnvSchema = z.object({
  // App Configuration
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  
  // Supabase (Expo prefixed)
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  
  // App Configuration
  EXPO_PUBLIC_APP_SCHEME: z.string().default('starter-template'),
  EXPO_PUBLIC_API_URL: z.string().url().optional(),
  EXPO_PUBLIC_WEB_URL: z.string().url().optional(),
  
  // Expo Project
  EXPO_PROJECT_ID: z.string().optional(),
  EAS_BUILD_PROFILE: z.string().default('development'),
  
  // Maps
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN: z.string().optional(),
  
  // Push Notifications
  EXPO_PUSH_TOKEN: z.string().optional(),
  EXPO_PUBLIC_FCM_SENDER_ID: z.string().optional(),
  
  // OAuth
  EXPO_PUBLIC_OAUTH_REDIRECT_SCHEME: z.string().optional(),
  
  // Analytics
  EXPO_PUBLIC_POSTHOG_KEY: z.string().optional(),
  EXPO_PUBLIC_POSTHOG_HOST: z.string().url().default('https://app.posthog.com'),
  EXPO_PUBLIC_AMPLITUDE_API_KEY: z.string().optional(),
  EXPO_PUBLIC_MIXPANEL_TOKEN: z.string().optional(),
  
  // Monitoring
  EXPO_PUBLIC_SENTRY_DSN: z.string().optional(),
  
  // Social Media
  EXPO_PUBLIC_FACEBOOK_APP_ID: z.string().optional(),
  EXPO_PUBLIC_TWITTER_CONSUMER_KEY: z.string().optional(),
  
  // Payment
  EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  EXPO_PUBLIC_REVENUE_CAT_API_KEY: z.string().optional(),
  
  // Feature Flags
  EXPO_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('true'),
  EXPO_PUBLIC_ENABLE_CRASH_REPORTING: z.string().transform(val => val === 'true').default('true'),
  EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').default('true'),
  EXPO_PUBLIC_ENABLE_OFFLINE_MODE: z.string().transform(val => val === 'true').default('true'),
  EXPO_PUBLIC_ENABLE_BETA_FEATURES: z.string().transform(val => val === 'true').default('false'),
  EXPO_PUBLIC_ENABLE_EXPERIMENTAL_UI: z.string().transform(val => val === 'true').default('false'),
  EXPO_PUBLIC_ENABLE_DEVTOOLS: z.string().transform(val => val === 'true').default('false'),
  EXPO_PUBLIC_ENABLE_FLIPPER: z.string().transform(val => val === 'true').default('false'),
  
  // Platform Features
  EXPO_PUBLIC_ENABLE_IOS_FEATURES: z.string().transform(val => val === 'true').default('true'),
  EXPO_PUBLIC_ENABLE_ANDROID_FEATURES: z.string().transform(val => val === 'true').default('true'),
  EXPO_PUBLIC_ENABLE_LOCATION_SERVICES: z.string().transform(val => val === 'true').default('true'),
  EXPO_PUBLIC_ENABLE_CAMERA: z.string().transform(val => val === 'true').default('true'),
  EXPO_PUBLIC_ENABLE_MEDIA_LIBRARY: z.string().transform(val => val === 'true').default('true'),
  EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH: z.string().transform(val => val === 'true').default('true'),
  
  // Permissions
  EXPO_PUBLIC_REQUIRE_CAMERA_PERMISSION: z.string().transform(val => val === 'true').default('false'),
  EXPO_PUBLIC_REQUIRE_LOCATION_PERMISSION: z.string().transform(val => val === 'true').default('false'),
  EXPO_PUBLIC_REQUIRE_NOTIFICATION_PERMISSION: z.string().transform(val => val === 'true').default('true'),
  EXPO_PUBLIC_REQUIRE_CONTACTS_PERMISSION: z.string().transform(val => val === 'true').default('false'),
  
  // Background Tasks
  EXPO_PUBLIC_ENABLE_BACKGROUND_SYNC: z.string().transform(val => val === 'true').default('true'),
  EXPO_PUBLIC_BACKGROUND_SYNC_INTERVAL: z.string().transform(val => parseInt(val, 10)).default('300000'),
  
  // Development
  EXPO_PUBLIC_DEBUG: z.string().transform(val => val === 'true').default('false'),
  EXPO_DEV_SERVER_URL: z.string().url().optional(),
});

/**
 * Get environment variables from multiple sources
 */
function getEnvVars() {
  // Combine process.env with Expo Constants
  const envVars = {
    ...process.env,
    ...Constants.expoConfig?.extra,
    ...Constants.manifest?.extra,
    ...Constants.manifest2?.extra?.expoClient?.extra,
  };
  
  // Also check for non-prefixed versions
  Object.keys(process.env).forEach((key) => {
    if (key.startsWith('EXPO_PUBLIC_')) {
      const unprefixedKey = key.replace('EXPO_PUBLIC_', '');
      if (!envVars[unprefixedKey]) {
        envVars[unprefixedKey] = process.env[key];
      }
    }
  });
  
  return envVars;
}

/**
 * Validate and parse environment variables
 */
function validateMobileEnv() {
  try {
    const envVars = getEnvVars();
    return expoEnvSchema.parse(envVars);
  } catch (error) {
    console.error('❌ Invalid environment configuration:');
    
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    
    throw new Error('Environment validation failed');
  }
}

/**
 * Validated environment variables
 */
export const env = validateMobileEnv();

/**
 * Environment configuration object
 */
export const config = {
  app: {
    scheme: env.EXPO_PUBLIC_APP_SCHEME,
    env: env.NODE_ENV,
    debug: env.EXPO_PUBLIC_DEBUG,
    projectId: env.EXPO_PROJECT_ID,
    buildProfile: env.EAS_BUILD_PROFILE,
  },
  
  supabase: {
    url: env.EXPO_PUBLIC_SUPABASE_URL,
    anonKey: env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  api: {
    baseUrl: env.EXPO_PUBLIC_API_URL || `${env.EXPO_PUBLIC_WEB_URL}/api`,
  },
  
  web: {
    url: env.EXPO_PUBLIC_WEB_URL,
  },
  
  maps: {
    googleMapsApiKey: env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    mapboxAccessToken: env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
  },
  
  pushNotifications: {
    expoPushToken: env.EXPO_PUSH_TOKEN,
    fcmSenderId: env.EXPO_PUBLIC_FCM_SENDER_ID,
  },
  
  oauth: {
    redirectScheme: env.EXPO_PUBLIC_OAUTH_REDIRECT_SCHEME || env.EXPO_PUBLIC_APP_SCHEME,
  },
  
  analytics: {
    posthog: {
      key: env.EXPO_PUBLIC_POSTHOG_KEY,
      host: env.EXPO_PUBLIC_POSTHOG_HOST,
    },
    amplitude: {
      apiKey: env.EXPO_PUBLIC_AMPLITUDE_API_KEY,
    },
    mixpanel: {
      token: env.EXPO_PUBLIC_MIXPANEL_TOKEN,
    },
  },
  
  monitoring: {
    sentry: {
      dsn: env.EXPO_PUBLIC_SENTRY_DSN,
    },
  },
  
  social: {
    facebook: {
      appId: env.EXPO_PUBLIC_FACEBOOK_APP_ID,
    },
    twitter: {
      consumerKey: env.EXPO_PUBLIC_TWITTER_CONSUMER_KEY,
    },
  },
  
  payments: {
    stripe: {
      publishableKey: env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    },
    revenueCat: {
      apiKey: env.EXPO_PUBLIC_REVENUE_CAT_API_KEY,
    },
  },
  
  features: {
    analytics: env.EXPO_PUBLIC_ENABLE_ANALYTICS,
    crashReporting: env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING,
    performanceMonitoring: env.EXPO_PUBLIC_ENABLE_PERFORMANCE_MONITORING,
    offlineMode: env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE,
    betaFeatures: env.EXPO_PUBLIC_ENABLE_BETA_FEATURES,
    experimentalUI: env.EXPO_PUBLIC_ENABLE_EXPERIMENTAL_UI,
    devtools: env.EXPO_PUBLIC_ENABLE_DEVTOOLS,
    flipper: env.EXPO_PUBLIC_ENABLE_FLIPPER,
  },
  
  platform: {
    iosFeatures: env.EXPO_PUBLIC_ENABLE_IOS_FEATURES,
    androidFeatures: env.EXPO_PUBLIC_ENABLE_ANDROID_FEATURES,
    locationServices: env.EXPO_PUBLIC_ENABLE_LOCATION_SERVICES,
    camera: env.EXPO_PUBLIC_ENABLE_CAMERA,
    mediaLibrary: env.EXPO_PUBLIC_ENABLE_MEDIA_LIBRARY,
    biometricAuth: env.EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH,
  },
  
  permissions: {
    camera: env.EXPO_PUBLIC_REQUIRE_CAMERA_PERMISSION,
    location: env.EXPO_PUBLIC_REQUIRE_LOCATION_PERMISSION,
    notifications: env.EXPO_PUBLIC_REQUIRE_NOTIFICATION_PERMISSION,
    contacts: env.EXPO_PUBLIC_REQUIRE_CONTACTS_PERMISSION,
  },
  
  backgroundTasks: {
    syncEnabled: env.EXPO_PUBLIC_ENABLE_BACKGROUND_SYNC,
    syncInterval: env.EXPO_PUBLIC_BACKGROUND_SYNC_INTERVAL,
  },
  
  development: {
    devServerUrl: env.EXPO_DEV_SERVER_URL,
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
 * Platform detection
 */
export const isIOS = Constants.platform?.ios !== undefined;
export const isAndroid = Constants.platform?.android !== undefined;
export const isWeb = Constants.platform?.web !== undefined;
export const isExpoGo = Constants.appOwnership === 'expo';
export const isStandalone = Constants.appOwnership === 'standalone';

/**
 * App version info
 */
export const appInfo = {
  version: Constants.expoConfig?.version || '1.0.0',
  buildNumber: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1',
  sdkVersion: Constants.expoConfig?.sdkVersion || 'unknown',
  runtimeVersion: Constants.expoConfig?.runtimeVersion || 'unknown',
};

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
 * Check if platform feature is enabled
 */
export function isPlatformFeatureEnabled(feature: keyof typeof config.platform): boolean {
  return config.platform[feature];
}

/**
 * Get API URL for different environments
 */
export function getApiUrl(path = ''): string {
  const baseUrl = config.api.baseUrl;
  if (!baseUrl) {
    throw new Error('API base URL is not configured');
  }
  return path ? `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}` : baseUrl;
}

/**
 * Get deep link URL
 */
export function getDeepLinkUrl(path = ''): string {
  const scheme = config.app.scheme;
  return `${scheme}://${path}`;
}

/**
 * Validate environment on app startup
 */
export function validateEnvironment(): void {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required for all environments
  if (!env.EXPO_PUBLIC_SUPABASE_URL) {
    errors.push('EXPO_PUBLIC_SUPABASE_URL is required');
  }
  
  if (!env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is required');
  }
  
  // Production-specific requirements
  if (isProduction) {
    if (config.features.analytics && !env.EXPO_PUBLIC_POSTHOG_KEY && !env.EXPO_PUBLIC_AMPLITUDE_API_KEY) {
      warnings.push('Analytics is enabled but no analytics service is configured');
    }
    
    if (config.features.crashReporting && !env.EXPO_PUBLIC_SENTRY_DSN) {
      warnings.push('Crash reporting is enabled but Sentry DSN is not configured');
    }
    
    if (config.platform.locationServices && !env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY) {
      warnings.push('Location services enabled but Google Maps API key is not configured');
    }
  }
  
  if (errors.length > 0) {
    console.error('❌ Environment validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Environment validation failed');
  }
  
  if (warnings.length > 0 && isDevelopment) {
    console.warn('⚠️  Environment warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  if (isDevelopment) {
    console.log('✅ Environment configuration loaded successfully');
    console.log(`   Environment: ${env.NODE_ENV}`);
    console.log(`   Platform: ${isIOS ? 'iOS' : isAndroid ? 'Android' : 'Web'}`);
    console.log(`   App Scheme: ${config.app.scheme}`);
    console.log(`   API URL: ${config.api.baseUrl || 'Not configured'}`);
    console.log(`   Supabase: ${config.supabase.url}`);
    console.log(`   Version: ${appInfo.version} (${appInfo.buildNumber})`);
  }
}

/**
 * Get environment summary for debugging
 */
export function getEnvironmentSummary() {
  return {
    app: {
      ...appInfo,
      scheme: config.app.scheme,
      environment: env.NODE_ENV,
      debug: config.app.debug,
    },
    platform: {
      ios: isIOS,
      android: isAndroid,
      web: isWeb,
      expoGo: isExpoGo,
      standalone: isStandalone,
    },
    features: config.features,
    permissions: config.permissions,
    services: {
      supabase: !!config.supabase.url,
      api: !!config.api.baseUrl,
      maps: !!config.maps.googleMapsApiKey,
      analytics: !!(config.analytics.posthog.key || config.analytics.amplitude.apiKey),
      monitoring: !!config.monitoring.sentry.dsn,
    },
  };
}