/**
 * Authentication Constants
 * Shared constants for authentication across platforms
 */

// Storage Keys
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  ID_TOKEN: 'auth_id_token',
  USER: 'auth_user',
  SESSION: 'auth_session',
  REMEMBER_ME: 'auth_remember_me',
  BIOMETRIC_ENABLED: 'auth_biometric_enabled',
  DEVICE_ID: 'auth_device_id',
} as const;

// Token Configuration
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_DURATION: 900, // 15 minutes in seconds
  REFRESH_TOKEN_DURATION: 2592000, // 30 days in seconds
  REFRESH_THRESHOLD: 300, // Refresh 5 minutes before expiry
  TOKEN_TYPE: 'Bearer',
} as const;

// Session Configuration
export const SESSION_CONFIG = {
  IDLE_TIMEOUT: 1800, // 30 minutes in seconds
  ABSOLUTE_TIMEOUT: 86400, // 24 hours in seconds
  REMEMBER_ME_DURATION: 30, // 30 days
  WARNING_THRESHOLD: 300, // Show warning 5 minutes before timeout
} as const;

// Password Requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
  SPECIAL_CHARS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
} as const;

// API Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  VERIFY_EMAIL: '/auth/verify-email',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  MFA_CHALLENGE: '/auth/mfa/challenge',
  MFA_VERIFY: '/auth/mfa/verify',
  USER_PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/profile',
  SESSIONS: '/auth/sessions',
  REVOKE_SESSION: '/auth/sessions/:sessionId/revoke',
} as const;

// OAuth Configuration
export const OAUTH_CONFIG = {
  GOOGLE: {
    SCOPES: ['openid', 'profile', 'email'],
    DISCOVERY_URL: 'https://accounts.google.com/.well-known/openid-configuration',
  },
  FACEBOOK: {
    SCOPES: ['public_profile', 'email'],
    API_VERSION: 'v12.0',
  },
  APPLE: {
    SCOPES: ['name', 'email'],
  },
  GITHUB: {
    SCOPES: ['user:email'],
  },
  MICROSOFT: {
    SCOPES: ['openid', 'profile', 'email', 'offline_access'],
    AUTHORITY: 'https://login.microsoftonline.com/common',
  },
} as const;

// Error Messages
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_NOT_VERIFIED: 'Please verify your email address',
  ACCOUNT_DISABLED: 'Your account has been disabled',
  ACCOUNT_LOCKED: 'Your account has been locked due to too many failed attempts',
  TOKEN_EXPIRED: 'Your session has expired, please login again',
  TOKEN_INVALID: 'Invalid authentication token',
  REFRESH_TOKEN_EXPIRED: 'Your session has expired, please login again',
  NETWORK_ERROR: 'Network error, please check your connection',
  SERVER_ERROR: 'Server error, please try again later',
  PERMISSION_DENIED: 'You do not have permission to perform this action',
  SESSION_EXPIRED: 'Your session has expired',
  UNKNOWN_ERROR: 'An unknown error occurred',
  PASSWORD_TOO_SHORT: `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`,
  PASSWORD_TOO_LONG: `Password must not exceed ${PASSWORD_REQUIREMENTS.MAX_LENGTH} characters`,
  PASSWORD_MISSING_UPPERCASE: 'Password must contain at least one uppercase letter',
  PASSWORD_MISSING_LOWERCASE: 'Password must contain at least one lowercase letter',
  PASSWORD_MISSING_NUMBER: 'Password must contain at least one number',
  PASSWORD_MISSING_SPECIAL: 'Password must contain at least one special character',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  EMAIL_ALREADY_EXISTS: 'Email address is already registered',
  USERNAME_ALREADY_EXISTS: 'Username is already taken',
  INVALID_EMAIL: 'Please enter a valid email address',
  TERMS_NOT_ACCEPTED: 'You must accept the terms and conditions',
} as const;

// Regular Expressions
export const AUTH_REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  STRONG_PASSWORD: new RegExp(
    `^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[${PASSWORD_REQUIREMENTS.SPECIAL_CHARS}])`
  ),
} as const;

// Role Names
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest',
} as const;

// Permission Actions
export const PERMISSIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
} as const;

// Biometric Configuration
export const BIOMETRIC_CONFIG = {
  IOS_PROMPT: 'Authenticate to access your account',
  ANDROID_PROMPT: 'Authenticate to access your account',
  ANDROID_TITLE: 'Biometric Authentication',
  ANDROID_SUBTITLE: 'Use your fingerprint or face to login',
  ANDROID_CANCEL: 'Cancel',
} as const;

// Security Headers
export const SECURITY_HEADERS = {
  AUTHORIZATION: 'Authorization',
  X_DEVICE_ID: 'X-Device-ID',
  X_SESSION_ID: 'X-Session-ID',
  X_CSRF_TOKEN: 'X-CSRF-Token',
} as const;