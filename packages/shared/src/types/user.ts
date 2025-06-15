/**
 * User-related types and interfaces
 */

import { BaseEntity, AuditableEntity, ID, Timestamp } from './common';

/**
 * User role types
 */
export type UserRole = 
  | 'admin'       // Full system access
  | 'moderator'   // Content moderation
  | 'editor'      // Content editing
  | 'user'        // Standard user
  | 'guest';      // Limited access

/**
 * User status types
 */
export type UserStatus = 
  | 'active'      // Active user
  | 'inactive'    // Temporarily inactive
  | 'suspended'   // Suspended by admin
  | 'banned'      // Permanently banned
  | 'pending';    // Pending verification

/**
 * Authentication provider types
 */
export type AuthProvider = 
  | 'email'       // Email/password
  | 'google'      // Google OAuth
  | 'facebook'    // Facebook OAuth
  | 'apple'       // Apple Sign In
  | 'github'      // GitHub OAuth
  | 'twitter';    // Twitter OAuth

/**
 * User profile information
 */
export interface UserProfile extends AuditableEntity {
  /** User's email address */
  email: string;
  /** Username (unique) */
  username: string;
  /** Display name */
  displayName: string;
  /** First name */
  firstName?: string;
  /** Last name */
  lastName?: string;
  /** Profile avatar URL */
  avatar?: string;
  /** Profile bio/description */
  bio?: string;
  /** User's website URL */
  website?: string;
  /** User's location */
  location?: string;
  /** Birth date */
  birthDate?: string;
  /** Phone number */
  phone?: string;
  /** Whether email is verified */
  emailVerified: boolean;
  /** Whether phone is verified */
  phoneVerified: boolean;
  /** User role */
  role: UserRole;
  /** User status */
  status: UserStatus;
  /** Authentication provider */
  authProvider: AuthProvider;
  /** Last login timestamp */
  lastLoginAt?: Timestamp;
  /** Account verification token */
  verificationToken?: string;
  /** Password reset token */
  resetToken?: string;
  /** Reset token expiry */
  resetTokenExpiry?: Timestamp;
}

/**
 * User authentication credentials
 */
export interface UserCredentials {
  /** Email or username */
  identifier: string;
  /** Password */
  password: string;
  /** Remember me flag */
  rememberMe?: boolean;
}

/**
 * User registration data
 */
export interface UserRegistration {
  /** Email address */
  email: string;
  /** Username */
  username: string;
  /** Password */
  password: string;
  /** Password confirmation */
  confirmPassword: string;
  /** Display name */
  displayName: string;
  /** First name */
  firstName?: string;
  /** Last name */
  lastName?: string;
  /** Terms of service acceptance */
  acceptTerms: boolean;
  /** Newsletter subscription */
  subscribeNewsletter?: boolean;
}

/**
 * User authentication state
 */
export interface AuthState {
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Current user profile */
  user?: UserProfile;
  /** Authentication loading state */
  isLoading: boolean;
  /** Authentication error */
  error?: string;
  /** JWT access token */
  accessToken?: string;
  /** JWT refresh token */
  refreshToken?: string;
  /** Token expiry timestamp */
  tokenExpiry?: Timestamp;
}

/**
 * JWT token payload
 */
export interface JWTPayload {
  /** User ID */
  sub: ID;
  /** User email */
  email: string;
  /** User role */
  role: UserRole;
  /** Issued at timestamp */
  iat: number;
  /** Expiry timestamp */
  exp: number;
  /** Token issuer */
  iss: string;
  /** Token audience */
  aud: string;
}

/**
 * User permissions
 */
export interface UserPermissions {
  /** Can create content */
  canCreate: boolean;
  /** Can edit own content */
  canEdit: boolean;
  /** Can delete own content */
  canDelete: boolean;
  /** Can edit others' content */
  canEditOthers: boolean;
  /** Can delete others' content */
  canDeleteOthers: boolean;
  /** Can moderate content */
  canModerate: boolean;
  /** Can manage users */
  canManageUsers: boolean;
  /** Can access admin panel */
  canAccessAdmin: boolean;
  /** Can view analytics */
  canViewAnalytics: boolean;
}

/**
 * User preferences/settings
 */
export interface UserPreferences {
  /** Theme preference */
  theme: 'light' | 'dark' | 'system';
  /** Language preference */
  language: string;
  /** Timezone */
  timezone: string;
  /** Date format preference */
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  /** Time format preference */
  timeFormat: '12h' | '24h';
  /** Email notifications enabled */
  emailNotifications: boolean;
  /** Push notifications enabled */
  pushNotifications: boolean;
  /** SMS notifications enabled */
  smsNotifications: boolean;
  /** Newsletter subscription */
  newsletter: boolean;
  /** Profile visibility */
  profileVisibility: 'public' | 'private' | 'friends';
  /** Show online status */
  showOnlineStatus: boolean;
}

/**
 * User notification settings
 */
export interface NotificationSettings {
  /** Email notifications */
  email: {
    /** New messages */
    newMessages: boolean;
    /** New followers */
    newFollowers: boolean;
    /** Content updates */
    contentUpdates: boolean;
    /** Marketing emails */
    marketing: boolean;
  };
  /** Push notifications */
  push: {
    /** New messages */
    newMessages: boolean;
    /** New followers */
    newFollowers: boolean;
    /** Content updates */
    contentUpdates: boolean;
    /** Breaking news */
    breakingNews: boolean;
  };
  /** SMS notifications */
  sms: {
    /** Security alerts */
    security: boolean;
    /** Account updates */
    account: boolean;
  };
}

/**
 * User activity log entry
 */
export interface UserActivity extends BaseEntity {
  /** User ID */
  userId: ID;
  /** Activity type */
  type: string;
  /** Activity description */
  description: string;
  /** Activity metadata */
  metadata?: Record<string, any>;
  /** IP address */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
  /** Location */
  location?: string;
}

/**
 * User session information
 */
export interface UserSession extends BaseEntity {
  /** User ID */
  userId: ID;
  /** Session token */
  token: string;
  /** Session expiry */
  expiresAt: Timestamp;
  /** IP address */
  ipAddress: string;
  /** User agent */
  userAgent: string;
  /** Device information */
  device?: string;
  /** Location */
  location?: string;
  /** Whether session is active */
  isActive: boolean;
  /** Last activity timestamp */
  lastActivityAt: Timestamp;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  /** Email address */
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirm {
  /** Reset token */
  token: string;
  /** New password */
  password: string;
  /** Password confirmation */
  confirmPassword: string;
}

/**
 * Password change request
 */
export interface PasswordChangeRequest {
  /** Current password */
  currentPassword: string;
  /** New password */
  newPassword: string;
  /** Password confirmation */
  confirmPassword: string;
}

/**
 * Email verification request
 */
export interface EmailVerificationRequest {
  /** Verification token */
  token: string;
}

/**
 * User search filters
 */
export interface UserSearchFilters {
  /** Search query */
  query?: string;
  /** Role filter */
  role?: UserRole;
  /** Status filter */
  status?: UserStatus;
  /** Registration date range */
  registeredAfter?: Timestamp;
  /** Registration date range */
  registeredBefore?: Timestamp;
  /** Last login date range */
  lastLoginAfter?: Timestamp;
  /** Last login date range */
  lastLoginBefore?: Timestamp;
}

/**
 * User statistics
 */
export interface UserStatistics {
  /** Total users */
  totalUsers: number;
  /** Active users */
  activeUsers: number;
  /** New users this month */
  newUsersThisMonth: number;
  /** Users by role */
  usersByRole: Record<UserRole, number>;
  /** Users by status */
  usersByStatus: Record<UserStatus, number>;
  /** Average session duration */
  averageSessionDuration: number;
}