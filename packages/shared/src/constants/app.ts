/**
 * App-wide constants including metadata, environment configuration,
 * feature flags, and default settings
 */

/**
 * Application metadata
 */
export const APP_METADATA = {
  name: 'Starter Template',
  version: '1.0.0',
  description: 'A cross-platform starter template for React Native and Next.js',
  author: 'Your Name',
  website: 'https://your-website.com',
} as const;

/**
 * Environment configuration constants
 */
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const;

export type Environment = typeof ENVIRONMENTS[keyof typeof ENVIRONMENTS];

/**
 * Current environment based on NODE_ENV or default
 */
export const CURRENT_ENV: Environment = 
  (process.env.NODE_ENV as Environment) || ENVIRONMENTS.DEVELOPMENT;

/**
 * Environment-specific configuration
 */
export const ENV_CONFIG = {
  [ENVIRONMENTS.DEVELOPMENT]: {
    debugMode: true,
    logLevel: 'debug',
    enableAnalytics: false,
    enableCrashReporting: false,
  },
  [ENVIRONMENTS.STAGING]: {
    debugMode: true,
    logLevel: 'info',
    enableAnalytics: true,
    enableCrashReporting: true,
  },
  [ENVIRONMENTS.PRODUCTION]: {
    debugMode: false,
    logLevel: 'error',
    enableAnalytics: true,
    enableCrashReporting: true,
  },
} as const;

/**
 * Feature flags for enabling/disabling functionality
 */
export const FEATURE_FLAGS = {
  enablePushNotifications: true,
  enableBiometricAuth: true,
  enableOfflineMode: true,
  enableDarkMode: true,
  enableAnalytics: ENV_CONFIG[CURRENT_ENV].enableAnalytics,
  enableCrashReporting: ENV_CONFIG[CURRENT_ENV].enableCrashReporting,
  enableBetaFeatures: CURRENT_ENV !== ENVIRONMENTS.PRODUCTION,
} as const;

/**
 * Application default settings
 */
export const APP_SETTINGS = {
  defaultTheme: 'light' as 'light' | 'dark' | 'system',
  defaultLanguage: 'en',
  maxRetryAttempts: 3,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
  autoSaveInterval: 5 * 60 * 1000, // 5 minutes in milliseconds
  cacheExpiration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
} as const;

/**
 * Platform detection constants
 */
export const PLATFORMS = {
  WEB: 'web',
  IOS: 'ios',
  ANDROID: 'android',
} as const;

export type Platform = typeof PLATFORMS[keyof typeof PLATFORMS];

/**
 * Log levels for application logging
 */
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];