/**
 * Authentication Context for Mobile App
 * React context for managing authentication state in React Native
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
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
}

/**
 * Authentication provider component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useSupabaseAuth();
  const router = useRouter();
  const segments = useSegments();

  // Initialize authentication
  const initialize = async () => {
    // Auth state is automatically initialized by the useSupabaseAuth hook
  };

  // Reset authentication state
  const reset = () => {
    // This could clear any additional app-specific state
  };

  // Handle authentication routing
  useEffect(() => {
    if (auth.isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!auth.isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not in auth group, redirect to login
      router.replace('/auth/login');
    } else if (auth.isAuthenticated && inAuthGroup) {
      // User is authenticated but in auth group, redirect to main app
      router.replace('/(tabs)');
    }
  }, [auth.isAuthenticated, auth.isLoading, segments, router]);

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
 * Protected route wrapper for mobile screens
 */
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  requireVerification?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: Array<{ resource: string; action: string }>;
}

export function ProtectedRoute({
  children,
  fallback,
  requireAuth = true,
  requireVerification = false,
  requiredRoles = [],
  requiredPermissions = [],
}: ProtectedRouteProps) {
  const auth = useAuth();

  // Loading state
  if (auth.isLoading) {
    return fallback || null;
  }

  // Authentication check
  if (requireAuth && !auth.isAuthenticated) {
    return fallback || null;
  }

  // Email verification check
  if (requireVerification && !auth.isEmailVerified()) {
    return fallback || null;
  }

  // Role check
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => auth.hasRole(role));
    if (!hasRequiredRole) {
      return fallback || null;
    }
  }

  // Permission check
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(({ resource, action }) =>
      auth.hasPermission(resource, action)
    );
    if (!hasRequiredPermissions) {
      return fallback || null;
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