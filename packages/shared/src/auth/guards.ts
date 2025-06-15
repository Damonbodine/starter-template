/**
 * Authentication Guards
 * Route protection and access control utilities
 */

import { User, Permission, AuthState } from './types';
import { hasPermission, hasRole, hasAnyRole, hasAllRoles, isEmailVerified } from './utils';

/**
 * Guard function type
 */
export type AuthGuard = (user: User | null) => boolean;

/**
 * Async guard function type for more complex checks
 */
export type AsyncAuthGuard = (user: User | null) => Promise<boolean>;

/**
 * Guard result with optional redirect
 */
export interface GuardResult {
  allowed: boolean;
  redirect?: string;
  message?: string;
}

/**
 * Basic authentication guard
 */
export const isAuthenticated: AuthGuard = (user) => {
  return user !== null;
};

/**
 * Guest only guard (for login/register pages)
 */
export const isGuest: AuthGuard = (user) => {
  return user === null;
};

/**
 * Email verification guard
 */
export const isVerified: AuthGuard = (user) => {
  return user !== null && isEmailVerified(user);
};

/**
 * Create role-based guard
 */
export function requireRole(roleName: string): AuthGuard {
  return (user) => user !== null && hasRole(user, roleName);
}

/**
 * Create guard for any of the specified roles
 */
export function requireAnyRole(...roleNames: string[]): AuthGuard {
  return (user) => user !== null && hasAnyRole(user, roleNames);
}

/**
 * Create guard for all of the specified roles
 */
export function requireAllRoles(...roleNames: string[]): AuthGuard {
  return (user) => user !== null && hasAllRoles(user, roleNames);
}

/**
 * Create permission-based guard
 */
export function requirePermission(resource: string, action: string): AuthGuard {
  return (user) => user !== null && hasPermission(user, resource, action);
}

/**
 * Create guard for any of the specified permissions
 */
export function requireAnyPermission(
  ...permissions: Array<{ resource: string; action: string }>
): AuthGuard {
  return (user) => {
    if (!user) return false;
    return permissions.some((perm) => hasPermission(user, perm.resource, perm.action));
  };
}

/**
 * Create guard for all of the specified permissions
 */
export function requireAllPermissions(
  ...permissions: Array<{ resource: string; action: string }>
): AuthGuard {
  return (user) => {
    if (!user) return false;
    return permissions.every((perm) => hasPermission(user, perm.resource, perm.action));
  };
}

/**
 * Combine multiple guards with AND logic
 */
export function combineGuards(...guards: AuthGuard[]): AuthGuard {
  return (user) => guards.every((guard) => guard(user));
}

/**
 * Combine multiple guards with OR logic
 */
export function combineGuardsOr(...guards: AuthGuard[]): AuthGuard {
  return (user) => guards.some((guard) => guard(user));
}

/**
 * Guard with redirect information
 */
export function createGuardWithRedirect(
  guard: AuthGuard,
  redirectPath: string,
  message?: string
): (user: User | null) => GuardResult {
  return (user) => {
    const allowed = guard(user);
    return {
      allowed,
      redirect: allowed ? undefined : redirectPath,
      message: allowed ? undefined : message,
    };
  };
}

/**
 * Common route guards with redirects
 */
export const routeGuards = {
  authenticated: createGuardWithRedirect(
    isAuthenticated,
    '/login',
    'Please login to continue'
  ),

  guest: createGuardWithRedirect(
    isGuest,
    '/dashboard',
    'You are already logged in'
  ),

  verified: createGuardWithRedirect(
    isVerified,
    '/verify-email',
    'Please verify your email to continue'
  ),

  admin: createGuardWithRedirect(
    requireRole('admin'),
    '/unauthorized',
    'Admin access required'
  ),

  superAdmin: createGuardWithRedirect(
    requireRole('super_admin'),
    '/unauthorized',
    'Super admin access required'
  ),
};

/**
 * Route configuration with guards
 */
export interface RouteConfig {
  path: string;
  guards?: AuthGuard[];
  redirectPath?: string;
  requireAuth?: boolean;
  requireVerified?: boolean;
  roles?: string[];
  permissions?: Array<{ resource: string; action: string }>;
}

/**
 * Build guard from route config
 */
export function buildRouteGuard(config: RouteConfig): AuthGuard {
  const guards: AuthGuard[] = [];

  if (config.requireAuth) {
    guards.push(isAuthenticated);
  }

  if (config.requireVerified) {
    guards.push(isVerified);
  }

  if (config.roles && config.roles.length > 0) {
    guards.push(requireAnyRole(...config.roles));
  }

  if (config.permissions && config.permissions.length > 0) {
    guards.push(requireAnyPermission(...config.permissions));
  }

  if (config.guards) {
    guards.push(...config.guards);
  }

  return guards.length === 0 ? () => true : combineGuards(...guards);
}

/**
 * Check route access
 */
export function checkRouteAccess(
  user: User | null,
  config: RouteConfig
): GuardResult {
  const guard = buildRouteGuard(config);
  const allowed = guard(user);

  return {
    allowed,
    redirect: allowed ? undefined : config.redirectPath || '/unauthorized',
  };
}

/**
 * React hook helper for guards (framework agnostic interface)
 */
export interface UseGuardResult {
  allowed: boolean;
  loading: boolean;
  redirect?: string;
  message?: string;
}

/**
 * Guard check with auth state
 */
export function checkGuardWithState(
  guard: AuthGuard,
  authState: AuthState,
  options?: {
    redirectPath?: string;
    message?: string;
    allowLoading?: boolean;
  }
): UseGuardResult {
  if (authState.isLoading && !options?.allowLoading) {
    return {
      allowed: false,
      loading: true,
    };
  }

  const allowed = guard(authState.user);

  return {
    allowed,
    loading: false,
    redirect: allowed ? undefined : options?.redirectPath,
    message: allowed ? undefined : options?.message,
  };
}

/**
 * Create custom guard
 */
export function createCustomGuard(
  checkFn: (user: User | null) => boolean,
  options?: {
    requireAuth?: boolean;
    requireVerified?: boolean;
  }
): AuthGuard {
  return (user) => {
    if (options?.requireAuth && !user) {
      return false;
    }

    if (options?.requireVerified && !isEmailVerified(user)) {
      return false;
    }

    return checkFn(user);
  };
}

/**
 * Time-based guard (e.g., for limited-time features)
 */
export function createTimeBasedGuard(
  startDate: Date,
  endDate: Date,
  baseGuard?: AuthGuard
): AuthGuard {
  return (user) => {
    const now = new Date();
    if (now < startDate || now > endDate) {
      return false;
    }

    return baseGuard ? baseGuard(user) : true;
  };
}

/**
 * Feature flag guard
 */
export function createFeatureFlagGuard(
  featureFlag: string,
  isEnabled: (flag: string, user: User | null) => boolean,
  baseGuard?: AuthGuard
): AuthGuard {
  return (user) => {
    if (!isEnabled(featureFlag, user)) {
      return false;
    }

    return baseGuard ? baseGuard(user) : true;
  };
}

/**
 * Subscription/plan-based guard
 */
export function createPlanGuard(
  requiredPlans: string[],
  getUserPlan: (user: User | null) => string | null
): AuthGuard {
  return (user) => {
    if (!user) return false;
    
    const userPlan = getUserPlan(user);
    if (!userPlan) return false;

    return requiredPlans.includes(userPlan);
  };
}

/**
 * IP-based guard (for server-side use)
 */
export function createIPGuard(
  allowedIPs: string[],
  getClientIP: () => string | null
): AuthGuard {
  return () => {
    const clientIP = getClientIP();
    if (!clientIP) return false;

    return allowedIPs.includes(clientIP);
  };
}

/**
 * Compose async guards
 */
export async function checkAsyncGuards(
  user: User | null,
  guards: AsyncAuthGuard[]
): Promise<boolean> {
  for (const guard of guards) {
    const allowed = await guard(user);
    if (!allowed) return false;
  }
  return true;
}