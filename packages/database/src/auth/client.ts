/**
 * Supabase Authentication Client
 * Core authentication functionality using Supabase Auth
 */

import { createClient, SupabaseClient, AuthError, User, Session } from '@supabase/supabase-js';
import { createSupabaseClient } from '../client/supabase';
import type {
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
  AuthProvider,
  UserRole,
  UserPreferences,
  SocialProfile,
  AnonymousUpgradeOptions,
  MFAOptions,
  MFAChallenge,
  MFAVerification,
  SecurityEvent,
} from './types';

/**
 * Authentication client class
 */
export class AuthClient {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || createSupabaseClient();
  }

  /**
   * Get current session
   */
  async getSession(): Promise<{ session: AppSession | null; error: AuthError | null }> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) {
        return { session: null, error };
      }

      return { session: session as AppSession, error: null };
    } catch (error) {
      return { session: null, error: error as AuthError };
    }
  }

  /**
   * Get current user
   */
  async getUser(): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  }

  /**
   * Get user profile with additional data
   */
  async getUserProfile(userId?: string): Promise<{ profile: UserProfile | null; error: any }> {
    try {
      const targetUserId = userId || (await this.getUser()).user?.id;
      
      if (!targetUserId) {
        return { profile: null, error: new Error('No user ID provided') };
      }

      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select(`
          *,
          permissions:user_permissions (
            permission:permissions (*)
          )
        `)
        .eq('id', targetUserId)
        .single();

      if (error) {
        return { profile: null, error };
      }

      // Transform the data to match our UserProfile interface
      const userProfile: UserProfile = {
        ...profile,
        permissions: profile.permissions?.map((up: any) => up.permission) || [],
      };

      return { profile: userProfile, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(credentials: SignUpCredentials): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstName,
            last_name: credentials.lastName,
            display_name: credentials.displayName,
            phone: credentials.phone,
            ...credentials.metadata,
          },
        },
      });

      if (error) {
        return { user: null, error };
      }

      // Create profile record
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email: credentials.email,
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          displayName: credentials.displayName,
          phone: credentials.phone,
        });
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(credentials: SignInCredentials): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, error };
      }

      // Update last sign in
      if (data.user) {
        await this.updateLastSignIn(data.user.id);
        await this.logSecurityEvent(data.user.id, 'sign_in');
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(options: OAuthSignInOptions): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: options.provider,
        options: {
          redirectTo: options.redirectTo,
          scopes: options.scopes,
          queryParams: options.queryParams,
        },
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Sign in with magic link
   */
  async signInWithMagicLink(options: MagicLinkOptions): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.supabase.auth.signInWithOtp({
        email: options.email,
        options: {
          emailRedirectTo: options.redirectTo,
          shouldCreateUser: options.shouldCreateUser,
        },
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Sign in with phone
   */
  async signInWithPhone(options: PhoneAuthOptions): Promise<{ error: AuthError | null }> {
    try {
      if (options.password) {
        // Sign in with phone and password
        const { error } = await this.supabase.auth.signInWithPassword({
          phone: options.phone,
          password: options.password,
        });
        return { error };
      } else {
        // Send OTP to phone
        const { error } = await this.supabase.auth.signInWithOtp({
          phone: options.phone,
          options: {
            shouldCreateUser: options.shouldCreateUser,
          },
        });
        return { error };
      }
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(options: OTPVerificationOptions): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await this.supabase.auth.verifyOtp({
        phone: options.phone,
        email: options.email,
        token: options.token,
        type: options.type,
      });

      if (error) {
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      // Log security event before signing out
      const { user } = await this.getUser();
      if (user) {
        await this.logSecurityEvent(user.id, 'sign_out');
      }

      const { error } = await this.supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(request: PasswordResetRequest): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(request.email, {
        redirectTo: request.redirectTo,
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Update password
   */
  async updatePassword(request: PasswordUpdateRequest): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: request.newPassword,
      });

      if (!error) {
        const { user } = await this.getUser();
        if (user) {
          await this.logSecurityEvent(user.id, 'password_change');
        }
      }

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(request: ProfileUpdateRequest): Promise<{ profile: UserProfile | null; error: any }> {
    try {
      const { user } = await this.getUser();
      
      if (!user) {
        return { profile: null, error: new Error('No authenticated user') };
      }

      // Update auth metadata
      const authUpdateData: any = {};
      
      if (request.displayName) {
        authUpdateData.display_name = request.displayName;
      }
      
      if (request.phone) {
        authUpdateData.phone = request.phone;
      }

      if (Object.keys(authUpdateData).length > 0) {
        await this.supabase.auth.updateUser({
          data: authUpdateData,
        });
      }

      // Update profile table
      const profileUpdateData: any = {};
      
      if (request.firstName !== undefined) profileUpdateData.first_name = request.firstName;
      if (request.lastName !== undefined) profileUpdateData.last_name = request.lastName;
      if (request.displayName !== undefined) profileUpdateData.display_name = request.displayName;
      if (request.avatarUrl !== undefined) profileUpdateData.avatar_url = request.avatarUrl;
      if (request.bio !== undefined) profileUpdateData.bio = request.bio;
      if (request.phone !== undefined) profileUpdateData.phone = request.phone;
      if (request.preferences !== undefined) {
        profileUpdateData.preferences = {
          ...profileUpdateData.preferences,
          ...request.preferences,
        };
      }

      profileUpdateData.updated_at = new Date().toISOString();

      const { data: profile, error } = await this.supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { profile: null, error };
      }

      // Log security event
      await this.logSecurityEvent(user.id, 'profile_update', {
        updatedFields: Object.keys(profileUpdateData),
      });

      return { profile: profile as UserProfile, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<{ session: AppSession | null; error: AuthError | null }> {
    try {
      const { data: { session }, error } = await this.supabase.auth.refreshSession();
      
      return { session: session as AppSession, error };
    } catch (error) {
      return { session: null, error: error as AuthError };
    }
  }

  /**
   * Create anonymous session
   */
  async signInAnonymously(): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await this.supabase.auth.signInAnonymously();
      
      if (error) {
        return { user: null, error };
      }

      // Create anonymous profile
      if (data.user) {
        await this.createUserProfile(data.user.id, {
          email: '',
          role: 'user',
          isAnonymous: true,
        });
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  }

  /**
   * Upgrade anonymous account
   */
  async upgradeAnonymousUser(options: AnonymousUpgradeOptions): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      // Link email/password to anonymous user
      const { data, error } = await this.supabase.auth.updateUser({
        email: options.email,
        password: options.password,
      });

      if (error) {
        return { user: null, error };
      }

      // Update profile
      if (data.user && options.profile) {
        await this.updateProfile(options.profile);
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  }

  /**
   * Set up MFA
   */
  async enrollMFA(options: MFAOptions): Promise<{ factor: any; error: AuthError | null }> {
    try {
      const { data, error } = await this.supabase.auth.mfa.enroll({
        factorType: options.factorType,
        issuer: options.issuer,
        friendlyName: options.friendlyName,
      });

      return { factor: data, error };
    } catch (error) {
      return { factor: null, error: error as AuthError };
    }
  }

  /**
   * Challenge MFA
   */
  async challengeMFA(factorId: string): Promise<{ challenge: MFAChallenge | null; error: AuthError | null }> {
    try {
      const { data, error } = await this.supabase.auth.mfa.challenge({
        factorId,
      });

      return { challenge: data as MFAChallenge, error };
    } catch (error) {
      return { challenge: null, error: error as AuthError };
    }
  }

  /**
   * Verify MFA
   */
  async verifyMFA(verification: MFAVerification): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await this.supabase.auth.mfa.verify({
        factorId: verification.factorId,
        challengeId: verification.challengeId,
        code: verification.code,
      });

      return { user: data?.user || null, error };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: AppSession | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session as AppSession);
    });
  }

  /**
   * Private helper methods
   */
  
  private async createUserProfile(userId: string, data: Partial<ProfileUpdateRequest & { email: string; role?: UserRole; isAnonymous?: boolean }>): Promise<void> {
    const defaultPreferences: UserPreferences = {
      email_notifications: true,
      push_notifications: true,
      marketing_emails: false,
      theme: 'system',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      profile_visibility: 'public',
      activity_visibility: 'public',
      beta_features: false,
      analytics_opt_out: false,
    };

    await this.supabase.from('profiles').insert({
      id: userId,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      display_name: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      phone: data.phone,
      role: data.role || 'user',
      status: 'active',
      is_anonymous: data.isAnonymous || false,
      onboarding_completed: false,
      preferences: defaultPreferences,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  private async updateLastSignIn(userId: string): Promise<void> {
    await this.supabase
      .from('profiles')
      .update({
        last_sign_in_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  }

  private async logSecurityEvent(userId: string, type: SecurityEvent['type'], details: Record<string, any> = {}): Promise<void> {
    try {
      await this.supabase.from('security_events').insert({
        user_id: userId,
        type,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Failed to log security event:', error);
    }
  }
}

/**
 * Default auth client instance
 */
export const authClient = new AuthClient();

/**
 * Create a new auth client instance
 */
export function createAuthClient(supabaseClient?: SupabaseClient): AuthClient {
  return new AuthClient(supabaseClient);
}