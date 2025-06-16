/**
 * Authentication Hooks
 * React hooks for authentication state management
 */

import { useState, useEffect, useCallback } from 'react';
import { AuthError, User, Session } from '@supabase/supabase-js';
import { authClient } from './client';
import type {
  UseAuthReturn,
  AuthState,
  UserProfile,
  SignUpCredentials,
  SignInCredentials,
  OAuthSignInOptions,
  MagicLinkOptions,
  PhoneAuthOptions,
  OTPVerificationOptions,
  PasswordResetRequest,
  PasswordUpdateRequest,
  ProfileUpdateRequest,
  AppSession,
} from './types';
import {
  hasPermission,
  hasRole,
  isUserVerified,
  isPhoneVerified,
} from './utils';

/**
 * Main authentication hook
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const { session, error } = await authClient.getSession();
        
        if (error) {
          if (mounted) {
            setState(prev => ({
              ...prev,
              isLoading: false,
              error,
            }));
          }
          return;
        }

        // Get user profile if session exists
        let userProfile: UserProfile | null = null;
        if (session?.user) {
          const { profile } = await authClient.getUserProfile();
          userProfile = profile;
        }

        if (mounted) {
          setState({
            user: userProfile,
            session,
            isLoading: false,
            isAuthenticated: Boolean(session?.user),
            error: null,
          });
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: error as AuthError,
          }));
        }
      }
    };

    initializeAuth();

    // Listen to auth state changes
    const { data: { subscription } } = authClient.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        let userProfile: UserProfile | null = null;
        
        if (session?.user) {
          const { profile } = await authClient.getUserProfile();
          userProfile = profile;
        }

        setState({
          user: userProfile,
          session,
          isLoading: false,
          isAuthenticated: Boolean(session?.user),
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error as AuthError,
        }));
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up
  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { user, error } = await authClient.signUp(credentials);
      
      if (error) {
        setState(prev => ({ ...prev, isLoading: false, error }));
        return { user: null, error };
      }

      // Profile will be updated by the auth state listener
      return { user: state.user, error: null };
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({ ...prev, isLoading: false, error: authError }));
      return { user: null, error: authError };
    }
  }, [state.user]);

  // Sign in
  const signIn = useCallback(async (credentials: SignInCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { user, error } = await authClient.signIn(credentials);
      
      if (error) {
        setState(prev => ({ ...prev, isLoading: false, error }));
        return { user: null, error };
      }

      // Profile will be updated by the auth state listener
      return { user: state.user, error: null };
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({ ...prev, isLoading: false, error: authError }));
      return { user: null, error: authError };
    }
  }, [state.user]);

  // Sign out
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { error } = await authClient.signOut();
      
      if (error) {
        setState(prev => ({ ...prev, isLoading: false, error }));
        return { error };
      }

      // State will be updated by the auth state listener
      return { error: null };
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({ ...prev, isLoading: false, error: authError }));
      return { error: authError };
    }
  }, []);

  // OAuth sign in
  const signInWithOAuth = useCallback(async (options: OAuthSignInOptions) => {
    setState(prev => ({ ...prev, error: null }));
    
    try {
      const { error } = await authClient.signInWithOAuth(options);
      
      if (error) {
        setState(prev => ({ ...prev, error }));
      }
      
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({ ...prev, error: authError }));
      return { error: authError };
    }
  }, []);

  // Magic link sign in
  const signInWithMagicLink = useCallback(async (options: MagicLinkOptions) => {
    setState(prev => ({ ...prev, error: null }));
    
    try {
      const { error } = await authClient.signInWithMagicLink(options);
      
      if (error) {
        setState(prev => ({ ...prev, error }));
      }
      
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({ ...prev, error: authError }));
      return { error: authError };
    }
  }, []);

  // Phone sign in
  const signInWithPhone = useCallback(async (options: PhoneAuthOptions) => {
    setState(prev => ({ ...prev, error: null }));
    
    try {
      const { error } = await authClient.signInWithPhone(options);
      
      if (error) {
        setState(prev => ({ ...prev, error }));
      }
      
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({ ...prev, error: authError }));
      return { error: authError };
    }
  }, []);

  // OTP verification
  const verifyOTP = useCallback(async (options: OTPVerificationOptions) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { user, error } = await authClient.verifyOTP(options);
      
      if (error) {
        setState(prev => ({ ...prev, isLoading: false, error }));
        return { user: null, error };
      }

      // State will be updated by the auth state listener
      return { user: state.user, error: null };
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({ ...prev, isLoading: false, error: authError }));
      return { user: null, error: authError };
    }
  }, [state.user]);

  // Reset password
  const resetPassword = useCallback(async (request: PasswordResetRequest) => {
    setState(prev => ({ ...prev, error: null }));
    
    try {
      const { error } = await authClient.resetPassword(request);
      
      if (error) {
        setState(prev => ({ ...prev, error }));
      }
      
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({ ...prev, error: authError }));
      return { error: authError };
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (request: PasswordUpdateRequest) => {
    setState(prev => ({ ...prev, error: null }));
    
    try {
      const { error } = await authClient.updatePassword(request);
      
      if (error) {
        setState(prev => ({ ...prev, error }));
      }
      
      return { error };
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({ ...prev, error: authError }));
      return { error: authError };
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (request: ProfileUpdateRequest) => {
    setState(prev => ({ ...prev, error: null }));
    
    try {
      const { profile, error } = await authClient.updateProfile(request);
      
      if (error) {
        setState(prev => ({ ...prev, error }));
        return { user: null, error };
      }

      // Update state with new profile
      setState(prev => ({
        ...prev,
        user: profile,
      }));
      
      return { user: profile, error: null };
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({ ...prev, error: authError }));
      return { user: null, error: authError };
    }
  }, []);

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      const { session, error } = await authClient.refreshSession();
      
      if (error) {
        setState(prev => ({ ...prev, error }));
        return { session: null, error };
      }

      // State will be updated by the auth state listener
      return { session, error: null };
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({ ...prev, error: authError }));
      return { session: null, error: authError };
    }
  }, []);

  // Utility functions
  const hasPermissionCheck = useCallback((resource: string, action: string) => {
    return hasPermission(state.user, resource, action);
  }, [state.user]);

  const hasRoleCheck = useCallback((role: string) => {
    return hasRole(state.user, role as any);
  }, [state.user]);

  const isEmailVerified = useCallback(() => {
    return isUserVerified(state.user);
  }, [state.user]);

  const isPhoneVerifiedCheck = useCallback(() => {
    return isPhoneVerified(state.user);
  }, [state.user]);

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    signInWithOAuth,
    signInWithMagicLink,
    signInWithPhone,
    verifyOTP,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    hasPermission: hasPermissionCheck,
    hasRole: hasRoleCheck,
    isEmailVerified,
    isPhoneVerified: isPhoneVerifiedCheck,
  };
}

/**
 * Hook for session management
 */
export function useSession() {
  const [session, setSession] = useState<AppSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      const { session } = await authClient.getSession();
      if (mounted) {
        setSession(session);
        setIsLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = authClient.onAuthStateChange((_, session) => {
      if (mounted) {
        setSession(session);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return { session, isLoading };
}

/**
 * Hook for user profile
 */
export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const getProfile = async () => {
      try {
        const { profile, error } = await authClient.getUserProfile(userId);
        
        if (mounted) {
          setProfile(profile);
          setError(error);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          setIsLoading(false);
        }
      }
    };

    getProfile();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const updateProfile = useCallback(async (request: ProfileUpdateRequest) => {
    try {
      const { profile: updatedProfile, error } = await authClient.updateProfile(request);
      
      if (error) {
        setError(error);
        return { user: null, error };
      }

      setProfile(updatedProfile);
      return { user: updatedProfile, error: null };
    } catch (err) {
      setError(err);
      return { user: null, error: err };
    }
  }, []);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
  };
}

/**
 * Hook for authentication guards
 */
export function useAuthGuards() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const requireAuth = useCallback(() => {
    return isAuthenticated && !isLoading;
  }, [isAuthenticated, isLoading]);

  const requireRole = useCallback((role: string) => {
    return requireAuth() && hasRole(user, role as any);
  }, [requireAuth, user]);

  const requirePermission = useCallback((resource: string, action: string) => {
    return requireAuth() && hasPermission(user, resource, action);
  }, [requireAuth, user]);

  const requireVerification = useCallback(() => {
    return requireAuth() && isUserVerified(user);
  }, [requireAuth, user]);

  return {
    requireAuth,
    requireRole,
    requirePermission,
    requireVerification,
    isLoading,
  };
}

/**
 * Hook for periodic session refresh
 */
export function useSessionRefresh(intervalMs: number = 5 * 60 * 1000) { // 5 minutes
  const { refreshSession, session } = useAuth();

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(async () => {
      try {
        await refreshSession();
      } catch (error) {
        console.warn('Session refresh failed:', error);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [session, refreshSession, intervalMs]);
}

/**
 * Hook for auth state persistence
 */
export function useAuthPersistence() {
  const { user, session, isAuthenticated } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      if (isAuthenticated && user) {
        localStorage.setItem('auth_user_id', user.id);
        localStorage.setItem('auth_last_seen', new Date().toISOString());
      } else {
        localStorage.removeItem('auth_user_id');
        localStorage.removeItem('auth_last_seen');
      }
    } catch (error) {
      console.warn('Failed to persist auth state:', error);
    }
  }, [user, isAuthenticated]);

  const getLastAuthState = useCallback(() => {
    if (typeof window === 'undefined') return null;

    try {
      const userId = localStorage.getItem('auth_user_id');
      const lastSeen = localStorage.getItem('auth_last_seen');
      
      return userId ? { userId, lastSeen } : null;
    } catch (error) {
      return null;
    }
  }, []);

  return { getLastAuthState };
}