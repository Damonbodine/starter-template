/**
 * Session Management
 * Handles session storage, refresh, and persistence
 */

import { authClient } from './client';
import type { AppSession, SessionStorageAdapter } from './types';

/**
 * Session storage interface
 */
export interface SessionStorage {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

/**
 * Default localStorage adapter for web
 */
class LocalStorageAdapter implements SessionStorage {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore errors
    }
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  }
}

/**
 * Secure storage adapter for React Native
 */
class SecureStorageAdapter implements SessionStorage {
  private secureStore: any;

  constructor() {
    // Dynamically import SecureStore for React Native
    try {
      this.secureStore = require('expo-secure-store');
    } catch {
      this.secureStore = null;
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.secureStore) return null;
    try {
      return await this.secureStore.getItemAsync(key);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.secureStore) return;
    try {
      await this.secureStore.setItemAsync(key, value);
    } catch {
      // Ignore errors
    }
  }

  async removeItem(key: string): Promise<void> {
    if (!this.secureStore) return;
    try {
      await this.secureStore.deleteItemAsync(key);
    } catch {
      // Ignore errors
    }
  }
}

/**
 * Session manager class
 */
export class SessionManager {
  private storage: SessionStorage;
  private refreshTimer: NodeJS.Timeout | null = null;
  private readonly SESSION_KEY = 'supabase.auth.token';
  private readonly REFRESH_BUFFER = 60; // Refresh 60 seconds before expiry

  constructor(storage?: SessionStorage) {
    this.storage = storage || this.getDefaultStorage();
  }

  private getDefaultStorage(): SessionStorage {
    // Check if we're in React Native environment
    if (typeof window === 'undefined' || (globalThis as any).ExpoSecureStore) {
      return new SecureStorageAdapter();
    }
    return new LocalStorageAdapter();
  }

  /**
   * Store session securely
   */
  async storeSession(session: AppSession): Promise<void> {
    try {
      const sessionData = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: session.token_type,
        user: session.user,
        stored_at: Date.now(),
      };

      await this.storage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
      this.scheduleRefresh(session);
    } catch (error) {
      console.warn('Failed to store session:', error);
    }
  }

  /**
   * Retrieve stored session
   */
  async getStoredSession(): Promise<AppSession | null> {
    try {
      const sessionData = await this.storage.getItem(this.SESSION_KEY);
      
      if (!sessionData) return null;

      const session = JSON.parse(sessionData) as AppSession & { stored_at: number };
      
      // Check if session is expired
      if (this.isSessionExpired(session)) {
        await this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.warn('Failed to retrieve stored session:', error);
      return null;
    }
  }

  /**
   * Clear stored session
   */
  async clearSession(): Promise<void> {
    try {
      await this.storage.removeItem(this.SESSION_KEY);
      this.clearRefreshTimer();
    } catch (error) {
      console.warn('Failed to clear session:', error);
    }
  }

  /**
   * Check if session is expired
   */
  private isSessionExpired(session: AppSession): boolean {
    if (!session.expires_at) return false;
    
    const now = Math.floor(Date.now() / 1000);
    return session.expires_at <= now;
  }

  /**
   * Check if session needs refresh
   */
  private shouldRefreshSession(session: AppSession): boolean {
    if (!session.expires_at) return false;
    
    const now = Math.floor(Date.now() / 1000);
    return session.expires_at - now <= this.REFRESH_BUFFER;
  }

  /**
   * Schedule automatic session refresh
   */
  private scheduleRefresh(session: AppSession): void {
    this.clearRefreshTimer();

    if (!session.expires_at) return;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilRefresh = (session.expires_at - now - this.REFRESH_BUFFER) * 1000;

    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(async () => {
        try {
          await this.refreshSession();
        } catch (error) {
          console.warn('Automatic session refresh failed:', error);
        }
      }, timeUntilRefresh);
    }
  }

  /**
   * Clear refresh timer
   */
  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Manually refresh session
   */
  async refreshSession(): Promise<AppSession | null> {
    try {
      const { session, error } = await authClient.refreshSession();
      
      if (error || !session) {
        await this.clearSession();
        return null;
      }

      await this.storeSession(session);
      return session;
    } catch (error) {
      console.warn('Session refresh failed:', error);
      await this.clearSession();
      return null;
    }
  }

  /**
   * Initialize session from storage
   */
  async initializeSession(): Promise<AppSession | null> {
    try {
      // First try to get the current session from Supabase
      const { session: currentSession } = await authClient.getSession();
      
      if (currentSession) {
        await this.storeSession(currentSession);
        return currentSession;
      }

      // If no current session, try to restore from storage
      const storedSession = await this.getStoredSession();
      
      if (!storedSession) return null;

      // Check if stored session needs refresh
      if (this.shouldRefreshSession(storedSession)) {
        return await this.refreshSession();
      }

      this.scheduleRefresh(storedSession);
      return storedSession;
    } catch (error) {
      console.warn('Session initialization failed:', error);
      await this.clearSession();
      return null;
    }
  }

  /**
   * Get session time remaining in seconds
   */
  getSessionTimeRemaining(session: AppSession): number {
    if (!session.expires_at) return 0;
    
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, session.expires_at - now);
  }

  /**
   * Check if session is expiring soon
   */
  isSessionExpiringSoon(session: AppSession): boolean {
    const timeRemaining = this.getSessionTimeRemaining(session);
    return timeRemaining > 0 && timeRemaining <= this.REFRESH_BUFFER;
  }

  /**
   * Destroy session manager
   */
  destroy(): void {
    this.clearRefreshTimer();
  }
}

/**
 * Default session manager instance
 */
export const sessionManager = new SessionManager();

/**
 * Create a new session manager instance
 */
export function createSessionManager(storage?: SessionStorage): SessionManager {
  return new SessionManager(storage);
}

/**
 * Session refresh hook for React components
 */
export function useSessionRefresh(intervalMs: number = 5 * 60 * 1000) {
  if (typeof window === 'undefined') return;

  const checkAndRefresh = async () => {
    try {
      const storedSession = await sessionManager.getStoredSession();
      
      if (storedSession && sessionManager.isSessionExpiringSoon(storedSession)) {
        await sessionManager.refreshSession();
      }
    } catch (error) {
      console.warn('Session refresh check failed:', error);
    }
  };

  // Initial check
  checkAndRefresh();

  // Set up interval
  const interval = setInterval(checkAndRefresh, intervalMs);

  return () => clearInterval(interval);
}

/**
 * Session event listeners
 */
export interface SessionEventListener {
  onSessionRefreshed?: (session: AppSession) => void;
  onSessionExpired?: () => void;
  onSessionError?: (error: any) => void;
}

class SessionEventManager {
  private listeners: SessionEventListener[] = [];

  addListener(listener: SessionEventListener): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  emitSessionRefreshed(session: AppSession): void {
    this.listeners.forEach(listener => {
      try {
        listener.onSessionRefreshed?.(session);
      } catch (error) {
        console.warn('Session event listener error:', error);
      }
    });
  }

  emitSessionExpired(): void {
    this.listeners.forEach(listener => {
      try {
        listener.onSessionExpired?.();
      } catch (error) {
        console.warn('Session event listener error:', error);
      }
    });
  }

  emitSessionError(error: any): void {
    this.listeners.forEach(listener => {
      try {
        listener.onSessionError?.(error);
      } catch (error) {
        console.warn('Session event listener error:', error);
      }
    });
  }
}

export const sessionEvents = new SessionEventManager();