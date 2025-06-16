/**
 * Authentication Utilities
 * Helper functions for authentication logic
 */

import type {
  UserProfile,
  UserRole,
  Permission,
  AuthProvider,
  UserStatus,
} from './types';

/**
 * Check if user has a specific role
 */
export function hasRole(user: UserProfile | null, role: UserRole): boolean {
  if (!user) return false;
  return user.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: UserProfile | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: UserProfile | null, resource: string, action: string): boolean {
  if (!user) return false;
  
  return user.permissions.some(permission => 
    permission.resource === resource && permission.action === action
  );
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  user: UserProfile | null, 
  permissions: Array<{ resource: string; action: string }>
): boolean {
  if (!user) return false;
  
  return permissions.some(({ resource, action }) => 
    hasPermission(user, resource, action)
  );
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  user: UserProfile | null,
  permissions: Array<{ resource: string; action: string }>
): boolean {
  if (!user) return false;
  
  return permissions.every(({ resource, action }) => 
    hasPermission(user, resource, action)
  );
}

/**
 * Check if user is active
 */
export function isUserActive(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.status === 'active';
}

/**
 * Check if user is verified (email verified)
 */
export function isUserVerified(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.email_verified;
}

/**
 * Check if user's phone is verified
 */
export function isPhoneVerified(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.phone_verified;
}

/**
 * Check if user completed onboarding
 */
export function hasCompletedOnboarding(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.onboarding_completed;
}

/**
 * Check if user is anonymous
 */
export function isAnonymousUser(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.is_anonymous;
}

/**
 * Get user's full name
 */
export function getUserFullName(user: UserProfile | null): string {
  if (!user) return '';
  
  if (user.display_name) return user.display_name;
  
  const parts = [user.first_name, user.last_name].filter(Boolean);
  return parts.join(' ') || user.email || 'User';
}

/**
 * Get user's initials
 */
export function getUserInitials(user: UserProfile | null): string {
  if (!user) return '';
  
  const name = getUserFullName(user);
  const parts = name.split(' ');
  
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  
  if (parts[0]) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  
  return '';
}

/**
 * Get auth provider display name
 */
export function getAuthProviderDisplayName(provider: AuthProvider): string {
  const providerNames: Record<AuthProvider, string> = {
    email: 'Email',
    google: 'Google',
    github: 'GitHub', 
    apple: 'Apple',
    facebook: 'Facebook',
    anonymous: 'Anonymous',
  };
  
  return providerNames[provider] || provider;
}

/**
 * Get user status display name
 */
export function getUserStatusDisplayName(status: UserStatus): string {
  const statusNames: Record<UserStatus, string> = {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    pending_verification: 'Pending Verification',
  };
  
  return statusNames[status] || status;
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    user: 'User',
    admin: 'Administrator',
    moderator: 'Moderator',
    super_admin: 'Super Administrator',
  };
  
  return roleNames[role] || role;
}

/**
 * Check if role has elevated privileges
 */
export function isElevatedRole(role: UserRole): boolean {
  return ['admin', 'moderator', 'super_admin'].includes(role);
}

/**
 * Get role hierarchy level (higher number = more privileges)
 */
export function getRoleLevel(role: UserRole): number {
  const roleLevels: Record<UserRole, number> = {
    user: 1,
    moderator: 2,
    admin: 3,
    super_admin: 4,
  };
  
  return roleLevels[role] || 0;
}

/**
 * Check if one role is higher than another
 */
export function isRoleHigher(role1: UserRole, role2: UserRole): boolean {
  return getRoleLevel(role1) > getRoleLevel(role2);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check if it's between 10 and 15 digits (international range)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  
  if (digitsOnly.length === 11 && digitsOnly[0] === '1') {
    return `+1 (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
  }
  
  return phone; // Return original if can't format
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length < 8) {
    issues.push('Password must be at least 8 characters long');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }
  
  // Character type checks
  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }
  
  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }
  
  if (!/\d/.test(password)) {
    issues.push('Password must contain at least one number');
  } else {
    score += 1;
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    issues.push('Password must contain at least one special character');
  } else {
    score += 1;
  }
  
  // Common patterns check
  if (/(.)\1{2,}/.test(password)) {
    issues.push('Password should not contain repeated characters');
    score -= 1;
  }
  
  if (/123|abc|qwe|password|admin/i.test(password)) {
    issues.push('Password should not contain common patterns');
    score -= 1;
  }
  
  return {
    isValid: issues.length === 0,
    score: Math.max(0, Math.min(5, score)),
    issues,
  };
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Get time until session expires
 */
export function getSessionTimeRemaining(expiresAt: number): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, expiresAt - now);
}

/**
 * Check if session is about to expire (within 5 minutes)
 */
export function isSessionExpiringSoon(expiresAt: number): boolean {
  const timeRemaining = getSessionTimeRemaining(expiresAt);
  return timeRemaining > 0 && timeRemaining < 300; // 5 minutes
}

/**
 * Format time remaining in human readable format
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  if (minutes > 0) {
    return `${minutes}m`;
  }
  
  return `${seconds}s`;
}

/**
 * Create a user avatar URL fallback
 */
export function getUserAvatarUrl(user: UserProfile | null, size: number = 150): string {
  if (!user) return `https://ui-avatars.com/api/?size=${size}&background=random`;
  
  if (user.avatar_url) {
    return user.avatar_url;
  }
  
  const name = encodeURIComponent(getUserFullName(user));
  const initials = encodeURIComponent(getUserInitials(user));
  
  return `https://ui-avatars.com/api/?name=${name}&initials=${initials}&size=${size}&background=random`;
}

/**
 * Sanitize user input for profile updates
 */
export function sanitizeProfileInput(input: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      // Basic HTML entity encoding and trim
      sanitized[key] = value
        .trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Extract profile data from OAuth provider
 */
export function extractOAuthProfile(user: any, provider: AuthProvider): Partial<UserProfile> {
  const profile: Partial<UserProfile> = {
    auth_provider: provider,
  };
  
  switch (provider) {
    case 'google':
      profile.first_name = user.user_metadata?.given_name;
      profile.last_name = user.user_metadata?.family_name;
      profile.display_name = user.user_metadata?.full_name;
      profile.avatar_url = user.user_metadata?.avatar_url;
      break;
      
    case 'github':
      profile.display_name = user.user_metadata?.full_name || user.user_metadata?.user_name;
      profile.avatar_url = user.user_metadata?.avatar_url;
      break;
      
    case 'facebook':
      profile.first_name = user.user_metadata?.given_name;
      profile.last_name = user.user_metadata?.family_name;
      profile.display_name = user.user_metadata?.full_name;
      profile.avatar_url = user.user_metadata?.avatar_url;
      break;
      
    default:
      break;
  }
  
  return profile;
}

/**
 * Check if user needs to complete profile setup
 */
export function needsProfileSetup(user: UserProfile | null): boolean {
  if (!user) return false;
  
  // Anonymous users always need setup when upgrading
  if (user.is_anonymous) return true;
  
  // Check if essential profile fields are missing
  const hasDisplayName = Boolean(user.display_name || user.first_name);
  const hasCompletedOnboarding = user.onboarding_completed;
  
  return !hasDisplayName || !hasCompletedOnboarding;
}

/**
 * Get required profile completion steps
 */
export function getProfileCompletionSteps(user: UserProfile | null): string[] {
  const steps: string[] = [];
  
  if (!user) return ['Login required'];
  
  if (!user.email_verified) {
    steps.push('Verify email address');
  }
  
  if (!user.display_name && !user.first_name) {
    steps.push('Add your name');
  }
  
  if (!user.avatar_url) {
    steps.push('Add profile picture');
  }
  
  if (!user.onboarding_completed) {
    steps.push('Complete onboarding');
  }
  
  return steps;
}