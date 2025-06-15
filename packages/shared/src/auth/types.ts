/**
 * Authentication Types
 * Shared types for authentication across web and mobile platforms
 */

export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  roles: UserRole[];
  permissions: Permission[];
  emailVerified: boolean;
  phoneNumber?: string;
  phoneVerified?: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn: number;
  tokenType: string;
}

export interface DecodedToken {
  sub: string; // Subject (user ID)
  email?: string;
  name?: string;
  iat: number; // Issued at
  exp: number; // Expiration
  aud?: string; // Audience
  iss?: string; // Issuer
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}

export interface Session {
  id: string;
  userId: string;
  tokens: AuthTokens;
  user: User;
  deviceInfo?: DeviceInfo;
  expiresAt: Date;
  createdAt: Date;
  lastActivityAt: Date;
}

export interface DeviceInfo {
  id?: string;
  name?: string;
  type: 'web' | 'ios' | 'android';
  os?: string;
  osVersion?: string;
  appVersion?: string;
  userAgent?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: any;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface AuthConfig {
  apiUrl: string;
  tokenRefreshThreshold: number; // Seconds before expiry to refresh
  sessionTimeout: number; // Session timeout in seconds
  rememberMeDuration: number; // Remember me duration in days
  enableBiometric: boolean;
  enableMFA: boolean;
  storagePrefix: string;
}

export interface MFAChallenge {
  challengeId: string;
  type: 'totp' | 'sms' | 'email' | 'push';
  createdAt: Date;
  expiresAt: Date;
}

export interface MFAVerification {
  challengeId: string;
  code: string;
}

export interface BiometricAuth {
  isAvailable: boolean;
  isEnabled: boolean;
  type?: 'fingerprint' | 'face' | 'iris';
}

export interface OAuthProvider {
  id: string;
  name: string;
  type: 'google' | 'facebook' | 'apple' | 'github' | 'microsoft';
  clientId: string;
  scopes: string[];
}

export interface OAuthTokens {
  provider: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  profile?: OAuthProfile;
}

export interface OAuthProfile {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  provider: string;
}