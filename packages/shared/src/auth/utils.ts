/**
 * Authentication Utilities
 * Helper functions for authentication across platforms
 */

import {
  AuthTokens,
  DecodedToken,
  User,
  Permission,
  UserRole,
  AuthError,
  AuthErrorCode,
} from './types';
import {
  TOKEN_CONFIG,
  PASSWORD_REQUIREMENTS,
  AUTH_REGEX,
  AUTH_ERROR_MESSAGES,
} from './constants';

/**
 * Decode JWT token without verification
 * Note: For client-side use only, server should verify tokens
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
}

/**
 * Get token expiration time in seconds
 */
export function getTokenExpiration(token: string): number | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp - now;
}

/**
 * Check if token needs refresh
 */
export function shouldRefreshToken(token: string, threshold = TOKEN_CONFIG.REFRESH_THRESHOLD): boolean {
  const expiration = getTokenExpiration(token);
  if (expiration === null) {
    return true;
  }

  return expiration <= threshold;
}

/**
 * Extract user info from token
 */
export function getUserFromToken(token: string): Partial<User> | null {
  const decoded = decodeToken(token);
  if (!decoded) {
    return null;
  }

  return {
    id: decoded.sub,
    email: decoded.email,
    displayName: decoded.name,
    roles: decoded.roles?.map((role: string) => ({ id: role, name: role, permissions: [] })) || [],
    permissions: decoded.permissions?.map((perm: string) => {
      const [resource, action] = perm.split(':');
      return { id: perm, name: perm, resource, action };
    }) || [],
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  return AUTH_REGEX.EMAIL.test(email);
}

/**
 * Validate username format
 */
export function validateUsername(username: string): boolean {
  return AUTH_REGEX.USERNAME.test(username);
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  return AUTH_REGEX.PHONE.test(phone);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    errors.push(AUTH_ERROR_MESSAGES.PASSWORD_TOO_SHORT);
  }

  if (password.length > PASSWORD_REQUIREMENTS.MAX_LENGTH) {
    errors.push(AUTH_ERROR_MESSAGES.PASSWORD_TOO_LONG);
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push(AUTH_ERROR_MESSAGES.PASSWORD_MISSING_UPPERCASE);
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push(AUTH_ERROR_MESSAGES.PASSWORD_MISSING_LOWERCASE);
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push(AUTH_ERROR_MESSAGES.PASSWORD_MISSING_NUMBER);
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL && !AUTH_REGEX.STRONG_PASSWORD.test(password)) {
    errors.push(AUTH_ERROR_MESSAGES.PASSWORD_MISSING_SPECIAL);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate password strength (0-100)
 */
export function calculatePasswordStrength(password: string): number {
  let strength = 0;

  // Length
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;

  // Character types
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

  return Math.min(strength, 100);
}

/**
 * Check if user has specific permission
 */
export function hasPermission(
  user: User | null,
  resource: string,
  action: string
): boolean {
  if (!user) return false;

  // Check direct permissions
  const hasDirectPermission = user.permissions.some(
    (perm) => perm.resource === resource && perm.action === action
  );

  if (hasDirectPermission) return true;

  // Check role permissions
  return user.roles.some((role) =>
    role.permissions.some(
      (perm) => perm.resource === resource && perm.action === action
    )
  );
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  user: User | null,
  permissions: Array<{ resource: string; action: string }>
): boolean {
  return permissions.some((perm) => hasPermission(user, perm.resource, perm.action));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  user: User | null,
  permissions: Array<{ resource: string; action: string }>
): boolean {
  return permissions.every((perm) => hasPermission(user, perm.resource, perm.action));
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, roleName: string): boolean {
  if (!user) return false;
  return user.roles.some((role) => role.name === roleName);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roleNames: string[]): boolean {
  if (!user) return false;
  return roleNames.some((roleName) => hasRole(user, roleName));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(user: User | null, roleNames: string[]): boolean {
  if (!user) return false;
  return roleNames.every((roleName) => hasRole(user, roleName));
}

/**
 * Create auth error object
 */
export function createAuthError(
  code: AuthErrorCode,
  message?: string,
  details?: any
): AuthError {
  return {
    code,
    message: message || AUTH_ERROR_MESSAGES[code] || 'Authentication error',
    details,
  };
}

/**
 * Format auth error for display
 */
export function formatAuthError(error: AuthError | Error | unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const authError = error as AuthError;
    return authError.message || AUTH_ERROR_MESSAGES[authError.code] || 'Authentication error';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Generate random device ID
 */
export function generateDeviceId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
}

/**
 * Check if session is active
 */
export function isSessionActive(expiresAt: Date, lastActivityAt: Date, idleTimeout: number): boolean {
  const now = new Date();
  
  // Check absolute expiration
  if (now > expiresAt) {
    return false;
  }

  // Check idle timeout
  const idleTime = (now.getTime() - lastActivityAt.getTime()) / 1000;
  return idleTime < idleTimeout;
}

/**
 * Calculate session time remaining
 */
export function getSessionTimeRemaining(expiresAt: Date): number {
  const now = new Date();
  const remaining = expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.floor(remaining / 1000));
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: any): any {
  if (!data) return data;

  const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken', 'idToken', 'secret'];
  
  if (typeof data === 'string') {
    return '***';
  }

  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }

  if (typeof data === 'object') {
    const masked: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        masked[key] = '***';
      } else {
        masked[key] = maskSensitiveData(value);
      }
    }
    return masked;
  }

  return data;
}

/**
 * Create authorization header
 */
export function createAuthHeader(token: string, type = TOKEN_CONFIG.TOKEN_TYPE): string {
  return `${type} ${token}`;
}

/**
 * Parse authorization header
 */
export function parseAuthHeader(header: string): { type: string; token: string } | null {
  const parts = header.split(' ');
  if (parts.length !== 2) {
    return null;
  }

  return {
    type: parts[0],
    token: parts[1],
  };
}

/**
 * Check if user email is verified
 */
export function isEmailVerified(user: User | null): boolean {
  return user?.emailVerified === true;
}

/**
 * Check if user phone is verified
 */
export function isPhoneVerified(user: User | null): boolean {
  return user?.phoneVerified === true;
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  
  return user.displayName || 
         user.username || 
         `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
         user.email?.split('@')[0] ||
         'User';
}

/**
 * Format last login time
 */
export function formatLastLogin(lastLoginAt?: Date): string {
  if (!lastLoginAt) return 'Never';

  const now = new Date();
  const diff = now.getTime() - lastLoginAt.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}