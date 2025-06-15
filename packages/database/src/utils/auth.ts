import { supabase } from '../client';
import type { Tables, TablesInsert, TablesUpdate } from '../types/database';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// Auth result types
export interface AuthResult<T = any> {
  data: T | null;
  error: Error | null;
}

export interface SignUpResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface SignInResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

// Profile types
export type Profile = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

/**
 * Authentication Functions
 */

// Sign up with email and password
export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, any>
): Promise<SignUpResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    return {
      user: data.user,
      session: data.session,
      error,
    };
  } catch (error) {
    console.error('Error signing up:', error);
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

// Sign in with email and password
export async function signIn(
  email: string,
  password: string
): Promise<SignInResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data.user,
      session: data.session,
      error,
    };
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

// Sign in with OAuth provider
export async function signInWithOAuth(
  provider: 'github' | 'google' | 'discord' | 'twitter',
  options?: {
    redirectTo?: string;
    scopes?: string;
  }
): Promise<AuthResult<{ url: string }>> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: options?.redirectTo,
        scopes: options?.scopes,
      },
    });

    return {
      data: data.url ? { url: data.url } : null,
      error,
    };
  } catch (error) {
    console.error(`Error signing in with ${provider}:`, error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Sign out
export async function signOut(): Promise<AuthResult<void>> {
  try {
    const { error } = await supabase.auth.signOut();
    return {
      data: null,
      error,
    };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Get current session
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Refresh session
export async function refreshSession(): Promise<AuthResult<Session>> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    return {
      data: data.session,
      error,
    };
  } catch (error) {
    console.error('Error refreshing session:', error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Reset password
export async function resetPassword(email: string): Promise<AuthResult<void>> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    return {
      data: null,
      error,
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Update password
export async function updatePassword(password: string): Promise<AuthResult<User>> {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    
    return {
      data: data.user,
      error,
    };
  } catch (error) {
    console.error('Error updating password:', error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

// Update email
export async function updateEmail(email: string): Promise<AuthResult<User>> {
  try {
    const { data, error } = await supabase.auth.updateUser({
      email,
    });
    
    return {
      data: data.user,
      error,
    };
  } catch (error) {
    console.error('Error updating email:', error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

/**
 * Profile Management Functions
 */

// Get user profile
export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
}

// Get current user's profile
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  return getProfile(user.id);
}

// Create user profile
export async function createProfile(profileData: ProfileInsert): Promise<Profile> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
}

// Update user profile
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<Profile> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// Update current user's profile
export async function updateCurrentProfile(updates: ProfileUpdate): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  return updateProfile(user.id, updates);
}

// Delete user profile
export async function deleteProfile(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
}

/**
 * Session Management Functions
 */

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentSession() !== null;
}

// Get user ID from session
export async function getUserId(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.user?.id || null;
}

// Get user email from session
export async function getUserEmail(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.user?.email || null;
}

/**
 * Role-Based Access Control Helpers
 */

// Check if user has required role (if you implement roles in your schema)
export async function hasRole(userId: string, role: string): Promise<boolean> {
  try {
    // This assumes you have a roles system in place
    // You might need to modify this based on your actual schema
    const profile = await getProfile(userId);
    
    // For now, we'll assume roles are stored in the bio field or need to be implemented differently
    // You might want to create a separate roles table or add a metadata JSON field to your schema
    // This is a placeholder implementation
    const userRoles: string[] = [];
    
    // If you have a metadata field in your schema, uncomment this:
    // const metadata = (profile as any)?.metadata;
    // const userRoles = metadata?.roles || [];
    
    return Array.isArray(userRoles) && userRoles.includes(role);
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

// Check if current user has required role
export async function currentUserHasRole(role: string): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  
  return hasRole(userId, role);
}

// Check if user is admin (convenience function)
export async function isAdmin(userId?: string): Promise<boolean> {
  const targetUserId = userId || await getUserId();
  if (!targetUserId) return false;
  
  return hasRole(targetUserId, 'admin');
}

// Check if current user is admin
export async function isCurrentUserAdmin(): Promise<boolean> {
  return isAdmin();
}

/**
 * Auth Event Listeners
 */

// Listen to auth state changes
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}

// Listen to specific auth events
export function onSignIn(callback: (session: Session) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      callback(session);
    }
  });
}

export function onSignOut(callback: () => void) {
  return supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      callback();
    }
  });
}

/**
 * Utility Functions
 */

// Create a complete user account with profile
export async function createUserAccount(
  email: string,
  password: string,
  profileData: Omit<ProfileInsert, 'id' | 'email'>
): Promise<{
  user: User | null;
  profile: Profile | null;
  error: Error | null;
}> {
  try {
    // Sign up the user
    const { user, error: signUpError } = await signUp(email, password);
    
    if (signUpError || !user) {
      return {
        user: null,
        profile: null,
        error: signUpError || new Error('Failed to create user'),
      };
    }

    // Create the profile
    const profile = await createProfile({
      id: user.id,
      email: user.email!,
      ...profileData,
    });

    return {
      user,
      profile,
      error: null,
    };
  } catch (error) {
    console.error('Error creating user account:', error);
    return {
      user: null,
      profile: null,
      error: error as Error,
    };
  }
}

// Get user with profile
export async function getUserWithProfile(userId: string): Promise<{
  user: User | null;
  profile: Profile | null;
}> {
  try {
    const [user, profile] = await Promise.all([
      getCurrentUser(),
      getProfile(userId),
    ]);

    return { user, profile };
  } catch (error) {
    console.error('Error getting user with profile:', error);
    return { user: null, profile: null };
  }
}