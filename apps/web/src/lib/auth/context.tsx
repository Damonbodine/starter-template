/**
 * Authentication Context for Web App
 * React context for managing authentication state
 */

'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useSupabaseAuth } from '@starter-template/database/auth';
import type { AuthContextType } from '@starter-template/database/auth';

/**
 * Authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider props
 */
interface AuthProviderProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * Authentication provider component
 */
export function AuthProvider({ 
  children, 
  redirectTo = '/login',
  requireAuth = false 
}: AuthProviderProps) {
  const auth = useSupabaseAuth();
  const router = useRouter();

  // Initialize authentication
  const initialize = async () => {
    // Auth state is automatically initialized by the useSupabaseAuth hook
  };

  // Reset authentication state
  const reset = () => {
    // This could clear any additional app-specific state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_redirect_url');
    }
  };

  // Handle authentication redirects
  useEffect(() => {
    if (auth.isLoading) return;

    if (requireAuth && !auth.isAuthenticated) {
      // Store the current URL for redirect after login
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_redirect_url', window.location.pathname);
      }
      router.push(redirectTo);
    }
  }, [auth.isAuthenticated, auth.isLoading, requireAuth, redirectTo, router]);

  // Handle successful authentication
  useEffect(() => {
    if (auth.isAuthenticated && typeof window !== 'undefined') {
      const redirectUrl = localStorage.getItem('auth_redirect_url');
      if (redirectUrl && redirectUrl !== '/login' && redirectUrl !== '/signup') {
        localStorage.removeItem('auth_redirect_url');
        router.push(redirectUrl);
      }
    }
  }, [auth.isAuthenticated, router]);

  // Create context value with additional methods
  const contextValue: AuthContextType = {
    ...auth,
    initialize,
    reset,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Higher-order component for authenticated routes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    requireVerification?: boolean;
    requiredRoles?: string[];
    requiredPermissions?: Array<{ resource: string; action: string }>;
  }
) {
  return function AuthenticatedComponent(props: P) {
    const auth = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (auth.isLoading) return;

      if (!auth.isAuthenticated) {
        router.push(options?.redirectTo || '/login');
        return;
      }

      if (options?.requireVerification && !auth.isEmailVerified()) {
        router.push('/verify-email');
        return;
      }

      if (options?.requiredRoles?.length) {
        const hasRequiredRole = options.requiredRoles.some(role => 
          auth.hasRole(role)
        );
        if (!hasRequiredRole) {
          router.push('/unauthorized');
          return;
        }
      }

      if (options?.requiredPermissions?.length) {
        const hasRequiredPermissions = options.requiredPermissions.every(({ resource, action }) =>
          auth.hasPermission(resource, action)
        );
        if (!hasRequiredPermissions) {
          router.push('/unauthorized');
          return;
        }
      }
    }, [auth, router]);

    if (auth.isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!auth.isAuthenticated) {
      return null;
    }

    if (options?.requireVerification && !auth.isEmailVerified()) {
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Component for protecting routes
 */
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  requireVerification?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: Array<{ resource: string; action: string }>;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback,
  requireAuth = true,
  requireVerification = false,
  requiredRoles = [],
  requiredPermissions = [],
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.isLoading) return;

    if (requireAuth && !auth.isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (requireVerification && !auth.isEmailVerified()) {
      router.push('/verify-email');
      return;
    }

    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => auth.hasRole(role));
      if (!hasRequiredRole) {
        router.push('/unauthorized');
        return;
      }
    }

    if (requiredPermissions.length > 0) {
      const hasRequiredPermissions = requiredPermissions.every(({ resource, action }) =>
        auth.hasPermission(resource, action)
      );
      if (!hasRequiredPermissions) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [
    auth,
    router,
    requireAuth,
    requireVerification,
    requiredRoles,
    requiredPermissions,
    redirectTo,
  ]);

  // Loading state
  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Authentication check
  if (requireAuth && !auth.isAuthenticated) {
    return fallback || null;
  }

  // Email verification check
  if (requireVerification && !auth.isEmailVerified()) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Email Verification Required</h2>
          <p className="text-gray-600">Please verify your email address to continue.</p>
        </div>
      </div>
    );
  }

  // Role check
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => auth.hasRole(role));
    if (!hasRequiredRole) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have the required permissions to access this page.</p>
          </div>
        </div>
      );
    }
  }

  // Permission check
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(({ resource, action }) =>
      auth.hasPermission(resource, action)
    );
    if (!hasRequiredPermissions) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have the required permissions to access this page.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

/**
 * Hook for conditional rendering based on auth state
 */
export function useAuthGuard() {
  const auth = useAuth();

  const canAccess = (options: {
    requireAuth?: boolean;
    requireVerification?: boolean;
    requiredRoles?: string[];
    requiredPermissions?: Array<{ resource: string; action: string }>;
  }) => {
    const {
      requireAuth = false,
      requireVerification = false,
      requiredRoles = [],
      requiredPermissions = [],
    } = options;

    if (requireAuth && !auth.isAuthenticated) {
      return false;
    }

    if (requireVerification && !auth.isEmailVerified()) {
      return false;
    }

    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => auth.hasRole(role));
      if (!hasRequiredRole) {
        return false;
      }
    }

    if (requiredPermissions.length > 0) {
      const hasRequiredPermissions = requiredPermissions.every(({ resource, action }) =>
        auth.hasPermission(resource, action)
      );
      if (!hasRequiredPermissions) {
        return false;
      }
    }

    return true;
  };

  return {
    ...auth,
    canAccess,
  };
}