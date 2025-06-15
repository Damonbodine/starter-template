/**
 * Authentication Module
 * Main exports for cross-platform authentication
 */

// Types
export * from './types';

// Constants
export * from './constants';

// Storage utilities
export {
  AuthStorage,
  TokenStorage,
  UserStorage,
  SessionStorage,
  AuthStorageService,
  initializeStorage,
  getStorage,
  getAuthStorage,
  isWeb,
  isReactNative,
} from './storage';

// Authentication utilities
export {
  // Token utilities
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  shouldRefreshToken,
  getUserFromToken,
  createAuthHeader,
  parseAuthHeader,
  
  // Validation utilities
  validateEmail,
  validateUsername,
  validatePhoneNumber,
  validatePassword,
  calculatePasswordStrength,
  
  // Permission utilities
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  
  // User utilities
  isEmailVerified,
  isPhoneVerified,
  getUserDisplayName,
  formatLastLogin,
  
  // Session utilities
  isSessionActive,
  getSessionTimeRemaining,
  
  // Error utilities
  createAuthError,
  formatAuthError,
  
  // Other utilities
  generateDeviceId,
  maskSensitiveData,
} from './utils';

// Guards
export {
  // Types
  AuthGuard,
  AsyncAuthGuard,
  GuardResult,
  RouteConfig,
  UseGuardResult,
  
  // Basic guards
  isAuthenticated,
  isGuest,
  isVerified,
  
  // Guard factories
  requireRole,
  requireAnyRole,
  requireAllRoles,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  
  // Guard combinators
  combineGuards,
  combineGuardsOr,
  createGuardWithRedirect,
  
  // Route guards
  routeGuards,
  buildRouteGuard,
  checkRouteAccess,
  checkGuardWithState,
  
  // Custom guards
  createCustomGuard,
  createTimeBasedGuard,
  createFeatureFlagGuard,
  createPlanGuard,
  createIPGuard,
  
  // Async guards
  checkAsyncGuards,
} from './guards';

// Default configuration
export const defaultAuthConfig = {
  apiUrl: process.env.API_URL || '',
  tokenRefreshThreshold: 300, // 5 minutes
  sessionTimeout: 1800, // 30 minutes
  rememberMeDuration: 30, // 30 days
  enableBiometric: true,
  enableMFA: false,
  storagePrefix: 'app',
};

// Re-export commonly used types for convenience
export type {
  User,
  Session,
  AuthTokens,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
} from './types';