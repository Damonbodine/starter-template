/**
 * Zustand Store Types
 * Type definitions for all stores
 */

import type { UserProfile } from '@starter-template/database/auth';

/**
 * Base store interface with common methods
 */
export interface BaseStore {
  reset: () => void;
}

/**
 * User preferences for UI and app behavior
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    activityVisibility: 'public' | 'private' | 'friends';
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

/**
 * UI state interface
 */
export interface UIState {
  // Layout
  sidebarCollapsed: boolean;
  sidebarMobile: boolean;
  
  // Modals and dialogs
  modals: {
    [key: string]: {
      isOpen: boolean;
      data?: any;
    };
  };
  
  // Loading states
  loading: {
    [key: string]: boolean;
  };
  
  // Toast notifications
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    actions?: Array<{
      label: string;
      action: () => void;
    }>;
  }>;
  
  // Search state
  search: {
    query: string;
    filters: Record<string, any>;
    results: any[];
    isSearching: boolean;
  };
}

/**
 * App state interface
 */
export interface AppState {
  // App metadata
  version: string;
  buildNumber: string;
  environment: 'development' | 'staging' | 'production';
  
  // Feature flags
  features: {
    [key: string]: boolean;
  };
  
  // Network state
  isOnline: boolean;
  networkType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  
  // App lifecycle
  isActive: boolean;
  isBackground: boolean;
  
  // Error tracking
  errors: Array<{
    id: string;
    error: Error;
    timestamp: Date;
    context?: Record<string, any>;
  }>;
  
  // Analytics
  analytics: {
    sessionId: string;
    userId?: string;
    events: Array<{
      name: string;
      properties: Record<string, any>;
      timestamp: Date;
    }>;
  };
}

/**
 * Notification item interface
 */
export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: Array<{
    id: string;
    label: string;
    action: 'dismiss' | 'navigate' | 'custom';
    payload?: any;
  }>;
  metadata?: Record<string, any>;
}

/**
 * Notification state interface
 */
export interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  settings: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    categories: {
      [key: string]: {
        enabled: boolean;
        sound: boolean;
        vibration: boolean;
      };
    };
  };
}

/**
 * Store middleware options
 */
export interface StoreMiddlewareOptions {
  name: string;
  partialize?: (state: any) => any;
  version?: number;
  migrate?: (persistedState: any, version: number) => any;
  storage?: {
    getItem: (name: string) => string | null | Promise<string | null>;
    setItem: (name: string, value: string) => void | Promise<void>;
    removeItem: (name: string) => void | Promise<void>;
  };
}

/**
 * Store subscription callback
 */
export type StoreSubscription<T> = (state: T, prevState: T) => void;

/**
 * Store selector function
 */
export type StoreSelector<T, U> = (state: T) => U;