/**
 * Authentication Guards for Web App
 * Navigation guards and route protection utilities
 */

'use client';

import { redirect } from 'next/navigation';
import { useAuth } from './context';

/**
 * Server-side authentication guard
 */
export async function requireAuth(redirectTo: string = '/login') {
  // This would be used in server components
  // For now, we'll implement client-side guards
  redirect(redirectTo);
}

/**
 * Server-side role guard
 */
export async function requireRole(role: string, redirectTo: string = '/unauthorized') {
  // This would check user role on server side
  redirect(redirectTo);
}

/**
 * Client-side navigation guard hook
 */
export function useNavigationGuard() {
  const auth = useAuth();

  const guardRoute = (
    options: {
      requireAuth?: boolean;
      requireVerification?: boolean;
      requiredRoles?: string[];
      requiredPermissions?: Array<{ resource: string; action: string }>;
    },
    redirectTo: string = '/login'
  ): boolean => {
    if (auth.isLoading) return false;

    if (options.requireAuth && !auth.isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return false;
    }

    if (options.requireVerification && !auth.isEmailVerified()) {
      if (typeof window !== 'undefined') {
        window.location.href = '/verify-email';
      }
      return false;
    }

    if (options.requiredRoles?.length) {
      const hasRole = options.requiredRoles.some(role => auth.hasRole(role));
      if (!hasRole) {
        if (typeof window !== 'undefined') {
          window.location.href = '/unauthorized';
        }
        return false;
      }
    }

    if (options.requiredPermissions?.length) {
      const hasPermissions = options.requiredPermissions.every(({ resource, action }) =>
        auth.hasPermission(resource, action)
      );
      if (!hasPermissions) {
        if (typeof window !== 'undefined') {
          window.location.href = '/unauthorized';
        }
        return false;
      }
    }

    return true;
  };

  return { guardRoute, ...auth };
}

/**
 * Route guard configuration
 */
export const routeGuards = {
  // Public routes (no authentication required)
  public: {
    requireAuth: false,
  },

  // Protected routes (authentication required)
  protected: {
    requireAuth: true,
  },

  // Verified routes (email verification required)
  verified: {
    requireAuth: true,
    requireVerification: true,
  },

  // Admin routes
  admin: {
    requireAuth: true,
    requireVerification: true,
    requiredRoles: ['admin', 'super_admin'],
  },

  // Moderator routes
  moderator: {
    requireAuth: true,
    requireVerification: true,
    requiredRoles: ['moderator', 'admin', 'super_admin'],
  },

  // User management routes
  userManagement: {
    requireAuth: true,
    requireVerification: true,
    requiredPermissions: [
      { resource: 'users', action: 'read' },
      { resource: 'users', action: 'write' },
    ],
  },

  // Content management routes
  contentManagement: {
    requireAuth: true,
    requireVerification: true,
    requiredPermissions: [
      { resource: 'content', action: 'write' },
    ],
  },

  // Settings routes
  settings: {
    requireAuth: true,
    requiredPermissions: [
      { resource: 'settings', action: 'read' },
    ],
  },
} as const;

/**
 * Page-level route guards
 */
export const pageGuards = {
  '/dashboard': routeGuards.protected,
  '/dashboard/admin': routeGuards.admin,
  '/dashboard/users': routeGuards.userManagement,
  '/dashboard/content': routeGuards.contentManagement,
  '/dashboard/settings': routeGuards.settings,
  '/profile': routeGuards.verified,
  '/settings': routeGuards.protected,
} as const;

/**
 * Middleware guard function
 */
export function createGuardMiddleware(guards: typeof pageGuards) {
  return function guardMiddleware(pathname: string) {
    const guard = guards[pathname as keyof typeof guards];
    
    if (!guard) {
      // No guard configured, allow access
      return { allowed: true };
    }

    // This would be used in middleware.ts
    // For now, we return the configuration
    return {
      allowed: false,
      guard,
    };
  };
}

/**
 * Component-level guards
 */
export function GuardedComponent({
  children,
  fallback,
  ...guardOptions
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
} & Parameters<typeof useNavigationGuard>[0]) {
  const { guardRoute } = useNavigationGuard();

  if (!guardRoute(guardOptions)) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Conditional rendering based on permissions
 */
export function CanAccess({
  children,
  fallback,
  roles,
  permissions,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  roles?: string[];
  permissions?: Array<{ resource: string; action: string }>;
}) {
  const auth = useAuth();

  if (auth.isLoading) {
    return fallback || null;
  }

  if (!auth.isAuthenticated) {
    return fallback || null;
  }

  if (roles?.length) {
    const hasRole = roles.some(role => auth.hasRole(role));
    if (!hasRole) {
      return fallback || null;
    }
  }

  if (permissions?.length) {
    const hasPermissions = permissions.every(({ resource, action }) =>
      auth.hasPermission(resource, action)
    );
    if (!hasPermissions) {
      return fallback || null;
    }
  }

  return <>{children}</>;
}

/**
 * Show content only for specific roles
 */
export function ShowForRoles({
  children,
  roles,
  fallback,
}: {
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
}) {
  return (
    <CanAccess roles={roles} fallback={fallback}>
      {children}
    </CanAccess>
  );
}

/**
 * Show content only for specific permissions
 */
export function ShowForPermissions({
  children,
  permissions,
  fallback,
}: {
  children: React.ReactNode;
  permissions: Array<{ resource: string; action: string }>;
  fallback?: React.ReactNode;
}) {
  return (
    <CanAccess permissions={permissions} fallback={fallback}>
      {children}
    </CanAccess>
  );
}

/**
 * Show content only for authenticated users
 */
export function ShowForAuth({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Show content only for guests (unauthenticated users)
 */
export function ShowForGuests({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const auth = useAuth();

  if (auth.isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Admin-only component wrapper
 */
export function AdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <ShowForRoles roles={['admin', 'super_admin']} fallback={fallback}>
      {children}
    </ShowForRoles>
  );
}

/**
 * Moderator+ component wrapper
 */
export function ModeratorPlus({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <ShowForRoles roles={['moderator', 'admin', 'super_admin']} fallback={fallback}>
      {children}
    </ShowForRoles>
  );
}