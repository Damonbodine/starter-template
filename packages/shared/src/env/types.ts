/**
 * Environment Types
 * Type definitions for environment configurations
 */

export type Environment = 'development' | 'staging' | 'production' | 'test';

export type Platform = 'web' | 'mobile' | 'server' | 'universal';

export interface EnvironmentConfig {
  NODE_ENV: Environment;
  PLATFORM?: Platform;
  DEBUG?: boolean;
  LOG_LEVEL?: 'error' | 'warn' | 'info' | 'debug';
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  jwtSecret?: string;
}

export interface AuthConfig {
  secret: string;
  sessionMaxAge?: number;
  cookieName?: string;
  enableBiometric?: boolean;
}

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  corsOrigins?: string[];
}

export interface AnalyticsConfig {
  enabled: boolean;
  googleAnalyticsId?: string;
  posthogKey?: string;
  posthogHost?: string;
  sentryDsn?: string;
}

export interface FeatureFlags {
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  enablePerformanceMonitoring: boolean;
  enableMaintenanceMode: boolean;
  enableBetaFeatures: boolean;
  enableExperimentalUI: boolean;
}

export interface DatabaseConfig {
  url: string;
  maxConnections?: number;
  ssl?: boolean;
  schema?: string;
}

export interface RedisConfig {
  url: string;
  maxRetries?: number;
  retryDelay?: number;
}

export interface EmailConfig {
  from: string;
  provider: 'resend' | 'sendgrid' | 'ses' | 'smtp';
  apiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}

export interface StorageConfig {
  provider: 'supabase' | 'aws' | 'gcp' | 'local';
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  maxFileSize?: number;
  allowedMimeTypes?: string[];
}

export interface PaymentConfig {
  provider: 'stripe' | 'paypal';
  publishableKey: string;
  secretKey: string;
  webhookSecret?: string;
  currency?: string;
}

export interface PushNotificationConfig {
  enabled: boolean;
  fcmSenderId?: string;
  apnsKeyId?: string;
  apnsTeamId?: string;
  expoPushToken?: string;
}

export interface OAuthConfig {
  google?: {
    clientId: string;
    clientSecret: string;
  };
  github?: {
    clientId: string;
    clientSecret: string;
  };
  facebook?: {
    appId: string;
    appSecret: string;
  };
}

export interface SecurityConfig {
  corsOrigins: string[];
  allowedHosts: string[];
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  enableCsrf: boolean;
  enableHelmet: boolean;
}

export interface MonitoringConfig {
  sentry?: {
    dsn: string;
    org: string;
    project: string;
    authToken?: string;
  };
  logtail?: {
    token: string;
  };
  healthCheck?: {
    endpoint: string;
    interval: number;
  };
}

export interface BuildConfig {
  version: string;
  buildNumber?: string;
  commitSha?: string;
  buildDate?: string;
  enableSourceMaps?: boolean;
  enableBundleAnalyzer?: boolean;
}

/**
 * Complete application configuration
 */
export interface AppConfig {
  env: EnvironmentConfig;
  supabase: SupabaseConfig;
  auth: AuthConfig;
  api: ApiConfig;
  analytics: AnalyticsConfig;
  features: FeatureFlags;
  database?: DatabaseConfig;
  redis?: RedisConfig;
  email?: EmailConfig;
  storage?: StorageConfig;
  payments?: PaymentConfig;
  pushNotifications?: PushNotificationConfig;
  oauth?: OAuthConfig;
  security?: SecurityConfig;
  monitoring?: MonitoringConfig;
  build?: BuildConfig;
}

/**
 * Platform-specific configurations
 */
export interface WebConfig extends AppConfig {
  nextAuth?: {
    url: string;
    secret: string;
  };
  uploadthing?: {
    secret: string;
    appId: string;
  };
}

export interface MobileConfig extends AppConfig {
  expo?: {
    projectId: string;
    scheme: string;
    buildProfile: string;
  };
  maps?: {
    googleMapsApiKey: string;
    mapboxAccessToken?: string;
  };
  permissions?: {
    camera: boolean;
    location: boolean;
    notifications: boolean;
    contacts: boolean;
  };
}

/**
 * Environment variable sources
 */
export interface EnvSource {
  process?: Record<string, string | undefined>;
  platform?: 'node' | 'react-native' | 'web';
  prefix?: string;
}

/**
 * Validation result
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  warnings?: string[];
}

/**
 * Environment loader options
 */
export interface EnvLoaderOptions {
  required?: boolean;
  defaultValue?: string;
  validate?: (value: string) => boolean;
  transform?: (value: string) => any;
  description?: string;
}