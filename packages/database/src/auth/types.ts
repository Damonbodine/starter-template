/**
 * Authentication Types
 * Shared types for authentication across the application
 */

import type { User as SupabaseUser, Session as SupabaseSession, AuthError } from '@supabase/supabase-js';

/**
 * Extended user profile with additional application data
 */
export interface UserProfile {
  id: string;
  email: string;
  email_verified: boolean;
  phone?: string;
  phone_verified: boolean;
  
  // Profile information
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  
  // Application metadata
  role: UserRole;
  status: UserStatus;
  permissions: Permission[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  
  // Preferences
  preferences: UserPreferences;
  
  // Authentication metadata
  auth_provider?: AuthProvider;
  is_anonymous: boolean;
  
  // Onboarding
  onboarding_completed: boolean;
  terms_accepted_at?: string;
  privacy_accepted_at?: string;
}

/**
 * User roles
 */
export type UserRole = 'user' | 'admin' | 'moderator' | 'super_admin';

/**
 * User status
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

/**
 * Authentication providers
 */
export type AuthProvider = 'email' | 'google' | 'github' | 'apple' | 'facebook' | 'anonymous';

/**
 * User permissions
 */
export interface Permission {
  id: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

/**
 * User preferences
 */
export interface UserPreferences {
  // Notification preferences
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  
  // App preferences
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  
  // Privacy preferences
  profile_visibility: 'public' | 'private' | 'friends';
  activity_visibility: 'public' | 'private';
  
  // Feature preferences
  beta_features: boolean;
  analytics_opt_out: boolean;
}

/**
 * Extended session with application data
 */
export interface AppSession extends SupabaseSession {
  user: SupabaseUser & {
    user_metadata: {
      profile?: Partial<UserProfile>;
    };
    app_metadata: {
      role?: UserRole;
      permissions?: string[];
    };
  };
}

/**
 * Authentication state
 */
export interface AuthState {
  user: UserProfile | null;
  session: AppSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
}

/**
 * Sign up credentials
 */
export interface SignUpCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

/**
 * Sign in credentials
 */
export interface SignInCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
  redirectTo?: string;
}

/**
 * Password update request
 */
export interface PasswordUpdateRequest {
  currentPassword?: string;
  newPassword: string;
}

/**
 * Profile update request
 */
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  preferences?: Partial<UserPreferences>;
}

/**
 * OAuth sign in options
 */
export interface OAuthSignInOptions {
  provider: 'google' | 'github' | 'apple' | 'facebook';
  redirectTo?: string;
  scopes?: string;
  queryParams?: Record<string, string>;
}

/**
 * Magic link sign in options
 */
export interface MagicLinkOptions {
  email: string;
  redirectTo?: string;
  shouldCreateUser?: boolean;
}

/**
 * Phone authentication options
 */
export interface PhoneAuthOptions {
  phone: string;
  password?: string;
  shouldCreateUser?: boolean;
}

/**
 * OTP verification options
 */
export interface OTPVerificationOptions {
  phone?: string;
  email?: string;
  token: string;
  type: 'sms' | 'phone_change' | 'email' | 'recovery' | 'invite' | 'magiclink' | 'signup';
}

/**
 * Biometric authentication options
 */
export interface BiometricAuthOptions {
  promptMessage?: string;
  fallbackToCredentials?: boolean;
  cancelButtonText?: string;
}

/**
 * Session refresh options
 */
export interface SessionRefreshOptions {
  refreshToken: string;
  forceRefresh?: boolean;
}

/**
 * Authentication hooks return types
 */
export interface UseAuthReturn extends AuthState {
  // Authentication actions
  signUp: (credentials: SignUpCredentials) => Promise<{ user: UserProfile | null; error: AuthError | null }>;
  signIn: (credentials: SignInCredentials) => Promise<{ user: UserProfile | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  
  // OAuth
  signInWithOAuth: (options: OAuthSignInOptions) => Promise<{ error: AuthError | null }>;
  
  // Magic link
  signInWithMagicLink: (options: MagicLinkOptions) => Promise<{ error: AuthError | null }>;
  
  // Phone
  signInWithPhone: (options: PhoneAuthOptions) => Promise<{ error: AuthError | null }>;
  verifyOTP: (options: OTPVerificationOptions) => Promise<{ user: UserProfile | null; error: AuthError | null }>;
  
  // Password management
  resetPassword: (request: PasswordResetRequest) => Promise<{ error: AuthError | null }>;
  updatePassword: (request: PasswordUpdateRequest) => Promise<{ error: AuthError | null }>;
  
  // Profile management
  updateProfile: (request: ProfileUpdateRequest) => Promise<{ user: UserProfile | null; error: AuthError | null }>;
  refreshSession: () => Promise<{ session: AppSession | null; error: AuthError | null }>;
  
  // Utility functions
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  isEmailVerified: () => boolean;
  isPhoneVerified: () => boolean;
}

/**
 * Authentication context type
 */
export interface AuthContextType extends UseAuthReturn {
  // Additional context-specific methods
  initialize: () => Promise<void>;
  reset: () => void;
}

/**
 * Authentication middleware options
 */
export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  requireVerification?: boolean;
  requiredRoles?: UserRole[];
  requiredPermissions?: Array<{ resource: string; action: string }>;
  redirectTo?: string;
  onUnauthorized?: (reason: string) => void;
}

/**
 * Route guard options
 */
export interface RouteGuardOptions extends AuthMiddlewareOptions {
  fallbackComponent?: React.ComponentType;
  loadingComponent?: React.ComponentType;
}

/**
 * Authentication error types
 */
export interface AuthErrorDetails {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

/**
 * Multi-factor authentication types
 */
export interface MFAOptions {
  factorType: 'totp' | 'phone';
  issuer?: string;
  friendlyName?: string;
}

export interface MFAChallenge {
  id: string;
  type: 'totp' | 'phone';
  challengeId: string;
}

export interface MFAVerification {
  factorId: string;
  challengeId: string;
  code: string;
}

/**
 * Social profile data from OAuth providers
 */
export interface SocialProfile {
  provider: AuthProvider;
  providerId: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  username?: string;
  verified?: boolean;
}

/**
 * Anonymous session upgrade options
 */
export interface AnonymousUpgradeOptions {
  email: string;
  password: string;
  profile?: Partial<ProfileUpdateRequest>;
}

/**
 * Device information for security
 */
export interface DeviceInfo {
  deviceId: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  platform: string;
  appVersion: string;
  lastSeen: Date;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

/**
 * Security event types
 */
export interface SecurityEvent {
  id: string;
  userId: string;
  type: 'sign_in' | 'sign_out' | 'password_change' | 'profile_update' | 'permission_change';
  details: Record<string, any>;
  deviceInfo?: DeviceInfo;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}