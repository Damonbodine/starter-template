/**
 * Authentication Storage Utilities
 * Cross-platform storage abstraction for authentication data
 */

import { AUTH_STORAGE_KEYS } from './constants';
import { AuthTokens, User, Session } from './types';

// Platform detection
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
const isWeb = typeof window !== 'undefined' && !isReactNative;

// Storage interface for cross-platform compatibility
export interface AuthStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Default storage implementation for web
class WebStorage implements AuthStorage {
  private storage: Storage;

  constructor(useSessionStorage = false) {
    this.storage = useSessionStorage ? sessionStorage : localStorage;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      console.error('WebStorage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      console.error('WebStorage setItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error('WebStorage removeItem error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      // Only clear auth-related items
      const keys = Object.keys(this.storage);
      for (const key of keys) {
        if (key.startsWith('auth_')) {
          this.storage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('WebStorage clear error:', error);
    }
  }
}

// Storage instance - will be overridden by React Native
let storageInstance: AuthStorage = isWeb ? new WebStorage() : null as any;

// Initialize storage with platform-specific implementation
export function initializeStorage(storage: AuthStorage): void {
  storageInstance = storage;
}

// Get storage instance
export function getStorage(): AuthStorage {
  if (!storageInstance) {
    throw new Error('Storage not initialized. Call initializeStorage() first.');
  }
  return storageInstance;
}

// Token storage utilities
export class TokenStorage {
  private storage: AuthStorage;
  private prefix: string;

  constructor(storage?: AuthStorage, prefix = '') {
    this.storage = storage || getStorage();
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}_${key}` : key;
  }

  async getTokens(): Promise<AuthTokens | null> {
    try {
      const accessToken = await this.storage.getItem(this.getKey(AUTH_STORAGE_KEYS.ACCESS_TOKEN));
      if (!accessToken) return null;

      const refreshToken = await this.storage.getItem(this.getKey(AUTH_STORAGE_KEYS.REFRESH_TOKEN));
      const idToken = await this.storage.getItem(this.getKey(AUTH_STORAGE_KEYS.ID_TOKEN));

      return {
        accessToken,
        refreshToken: refreshToken || undefined,
        idToken: idToken || undefined,
        expiresIn: 0, // This should be calculated from token
        tokenType: 'Bearer',
      };
    } catch (error) {
      console.error('TokenStorage getTokens error:', error);
      return null;
    }
  }

  async setTokens(tokens: AuthTokens): Promise<void> {
    try {
      await this.storage.setItem(this.getKey(AUTH_STORAGE_KEYS.ACCESS_TOKEN), tokens.accessToken);
      
      if (tokens.refreshToken) {
        await this.storage.setItem(this.getKey(AUTH_STORAGE_KEYS.REFRESH_TOKEN), tokens.refreshToken);
      }
      
      if (tokens.idToken) {
        await this.storage.setItem(this.getKey(AUTH_STORAGE_KEYS.ID_TOKEN), tokens.idToken);
      }
    } catch (error) {
      console.error('TokenStorage setTokens error:', error);
      throw error;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        this.storage.removeItem(this.getKey(AUTH_STORAGE_KEYS.ACCESS_TOKEN)),
        this.storage.removeItem(this.getKey(AUTH_STORAGE_KEYS.REFRESH_TOKEN)),
        this.storage.removeItem(this.getKey(AUTH_STORAGE_KEYS.ID_TOKEN)),
      ]);
    } catch (error) {
      console.error('TokenStorage clearTokens error:', error);
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      return await this.storage.getItem(this.getKey(AUTH_STORAGE_KEYS.ACCESS_TOKEN));
    } catch (error) {
      console.error('TokenStorage getAccessToken error:', error);
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await this.storage.getItem(this.getKey(AUTH_STORAGE_KEYS.REFRESH_TOKEN));
    } catch (error) {
      console.error('TokenStorage getRefreshToken error:', error);
      return null;
    }
  }
}

// User storage utilities
export class UserStorage {
  private storage: AuthStorage;
  private prefix: string;

  constructor(storage?: AuthStorage, prefix = '') {
    this.storage = storage || getStorage();
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}_${key}` : key;
  }

  async getUser(): Promise<User | null> {
    try {
      const userJson = await this.storage.getItem(this.getKey(AUTH_STORAGE_KEYS.USER));
      if (!userJson) return null;

      const user = JSON.parse(userJson);
      // Convert date strings back to Date objects
      user.createdAt = new Date(user.createdAt);
      user.updatedAt = new Date(user.updatedAt);
      if (user.lastLoginAt) {
        user.lastLoginAt = new Date(user.lastLoginAt);
      }
      return user;
    } catch (error) {
      console.error('UserStorage getUser error:', error);
      return null;
    }
  }

  async setUser(user: User): Promise<void> {
    try {
      const userJson = JSON.stringify(user);
      await this.storage.setItem(this.getKey(AUTH_STORAGE_KEYS.USER), userJson);
    } catch (error) {
      console.error('UserStorage setUser error:', error);
      throw error;
    }
  }

  async clearUser(): Promise<void> {
    try {
      await this.storage.removeItem(this.getKey(AUTH_STORAGE_KEYS.USER));
    } catch (error) {
      console.error('UserStorage clearUser error:', error);
    }
  }
}

// Session storage utilities
export class SessionStorage {
  private storage: AuthStorage;
  private prefix: string;

  constructor(storage?: AuthStorage, prefix = '') {
    this.storage = storage || getStorage();
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}_${key}` : key;
  }

  async getSession(): Promise<Session | null> {
    try {
      const sessionJson = await this.storage.getItem(this.getKey(AUTH_STORAGE_KEYS.SESSION));
      if (!sessionJson) return null;

      const session = JSON.parse(sessionJson);
      // Convert date strings back to Date objects
      session.expiresAt = new Date(session.expiresAt);
      session.createdAt = new Date(session.createdAt);
      session.lastActivityAt = new Date(session.lastActivityAt);
      
      // Check if session is expired
      if (new Date() > session.expiresAt) {
        await this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('SessionStorage getSession error:', error);
      return null;
    }
  }

  async setSession(session: Session): Promise<void> {
    try {
      const sessionJson = JSON.stringify(session);
      await this.storage.setItem(this.getKey(AUTH_STORAGE_KEYS.SESSION), sessionJson);
    } catch (error) {
      console.error('SessionStorage setSession error:', error);
      throw error;
    }
  }

  async updateLastActivity(): Promise<void> {
    try {
      const session = await this.getSession();
      if (session) {
        session.lastActivityAt = new Date();
        await this.setSession(session);
      }
    } catch (error) {
      console.error('SessionStorage updateLastActivity error:', error);
    }
  }

  async clearSession(): Promise<void> {
    try {
      await this.storage.removeItem(this.getKey(AUTH_STORAGE_KEYS.SESSION));
    } catch (error) {
      console.error('SessionStorage clearSession error:', error);
    }
  }
}

// Combined auth storage for convenience
export class AuthStorageService {
  public tokens: TokenStorage;
  public user: UserStorage;
  public session: SessionStorage;
  private storage: AuthStorage;
  private prefix: string;

  constructor(storage?: AuthStorage, prefix = '') {
    this.storage = storage || getStorage();
    this.prefix = prefix;
    this.tokens = new TokenStorage(this.storage, prefix);
    this.user = new UserStorage(this.storage, prefix);
    this.session = new SessionStorage(this.storage, prefix);
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}_${key}` : key;
  }

  async setRememberMe(value: boolean): Promise<void> {
    try {
      await this.storage.setItem(
        this.getKey(AUTH_STORAGE_KEYS.REMEMBER_ME),
        value.toString()
      );
    } catch (error) {
      console.error('AuthStorageService setRememberMe error:', error);
    }
  }

  async getRememberMe(): Promise<boolean> {
    try {
      const value = await this.storage.getItem(this.getKey(AUTH_STORAGE_KEYS.REMEMBER_ME));
      return value === 'true';
    } catch (error) {
      console.error('AuthStorageService getRememberMe error:', error);
      return false;
    }
  }

  async setBiometricEnabled(value: boolean): Promise<void> {
    try {
      await this.storage.setItem(
        this.getKey(AUTH_STORAGE_KEYS.BIOMETRIC_ENABLED),
        value.toString()
      );
    } catch (error) {
      console.error('AuthStorageService setBiometricEnabled error:', error);
    }
  }

  async getBiometricEnabled(): Promise<boolean> {
    try {
      const value = await this.storage.getItem(this.getKey(AUTH_STORAGE_KEYS.BIOMETRIC_ENABLED));
      return value === 'true';
    } catch (error) {
      console.error('AuthStorageService getBiometricEnabled error:', error);
      return false;
    }
  }

  async setDeviceId(deviceId: string): Promise<void> {
    try {
      await this.storage.setItem(this.getKey(AUTH_STORAGE_KEYS.DEVICE_ID), deviceId);
    } catch (error) {
      console.error('AuthStorageService setDeviceId error:', error);
    }
  }

  async getDeviceId(): Promise<string | null> {
    try {
      return await this.storage.getItem(this.getKey(AUTH_STORAGE_KEYS.DEVICE_ID));
    } catch (error) {
      console.error('AuthStorageService getDeviceId error:', error);
      return null;
    }
  }

  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        this.tokens.clearTokens(),
        this.user.clearUser(),
        this.session.clearSession(),
        this.storage.removeItem(this.getKey(AUTH_STORAGE_KEYS.REMEMBER_ME)),
        this.storage.removeItem(this.getKey(AUTH_STORAGE_KEYS.BIOMETRIC_ENABLED)),
      ]);
    } catch (error) {
      console.error('AuthStorageService clearAll error:', error);
    }
  }
}

// Default auth storage instance
let defaultAuthStorage: AuthStorageService;

export function getAuthStorage(): AuthStorageService {
  if (!defaultAuthStorage) {
    defaultAuthStorage = new AuthStorageService();
  }
  return defaultAuthStorage;
}

// Export platform detection for conditional imports
export { isWeb, isReactNative };