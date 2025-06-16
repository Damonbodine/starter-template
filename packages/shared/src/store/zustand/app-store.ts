/**
 * App Store
 * Manages application-level state
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { BaseStore, AppState } from './types';
import { createStoreWithMiddleware } from './middleware';

/**
 * App store state interface
 */
export interface AppStoreState extends BaseStore {
  // App metadata
  version: string;
  buildNumber: string;
  environment: 'development' | 'staging' | 'production';
  
  // Feature flags
  features: Record<string, boolean>;
  
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
  
  // Performance metrics
  performance: {
    loadTime: number;
    navigationTiming?: PerformanceNavigationTiming;
    memoryUsage?: number;
  };
  
  // Actions
  setVersion: (version: string, buildNumber: string) => void;
  setEnvironment: (environment: 'development' | 'staging' | 'production') => void;
  setFeature: (feature: string, enabled: boolean) => void;
  setFeatures: (features: Record<string, boolean>) => void;
  setNetworkState: (isOnline: boolean, networkType?: string) => void;
  setAppState: (isActive: boolean, isBackground: boolean) => void;
  addError: (error: Error, context?: Record<string, any>) => void;
  clearErrors: () => void;
  setAnalyticsUserId: (userId?: string) => void;
  trackEvent: (name: string, properties?: Record<string, any>) => void;
  clearAnalytics: () => void;
  setPerformanceMetrics: (metrics: Partial<AppStoreState['performance']>) => void;
  reset: () => void;
}

/**
 * Generate session ID
 */
const generateSessionId = () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Generate error ID
 */
const generateErrorId = () => `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Initial state
 */
const initialState = {
  version: '1.0.0',
  buildNumber: '1',
  environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
  features: {},
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  networkType: undefined,
  isActive: true,
  isBackground: false,
  errors: [],
  analytics: {
    sessionId: generateSessionId(),
    userId: undefined,
    events: [],
  },
  performance: {
    loadTime: 0,
    navigationTiming: undefined,
    memoryUsage: undefined,
  },
};

/**
 * App store creator
 */
const createAppStore = () => (set, get) => ({
  ...initialState,

  setVersion: (version: string, buildNumber: string) =>
    set((state) => {
      state.version = version;
      state.buildNumber = buildNumber;
    }),

  setEnvironment: (environment: 'development' | 'staging' | 'production') =>
    set((state) => {
      state.environment = environment;
    }),

  setFeature: (feature: string, enabled: boolean) =>
    set((state) => {
      state.features[feature] = enabled;
    }),

  setFeatures: (features: Record<string, boolean>) =>
    set((state) => {
      state.features = { ...state.features, ...features };
    }),

  setNetworkState: (isOnline: boolean, networkType?: string) =>
    set((state) => {
      state.isOnline = isOnline;
      state.networkType = networkType as any;
    }),

  setAppState: (isActive: boolean, isBackground: boolean) =>
    set((state) => {
      state.isActive = isActive;
      state.isBackground = isBackground;
    }),

  addError: (error: Error, context?: Record<string, any>) =>
    set((state) => {
      const errorEntry = {
        id: generateErrorId(),
        error,
        timestamp: new Date(),
        context,
      };
      
      state.errors.push(errorEntry);
      
      // Keep only last 50 errors
      if (state.errors.length > 50) {
        state.errors = state.errors.slice(-50);
      }
    }),

  clearErrors: () =>
    set((state) => {
      state.errors = [];
    }),

  setAnalyticsUserId: (userId?: string) =>
    set((state) => {
      state.analytics.userId = userId;
    }),

  trackEvent: (name: string, properties: Record<string, any> = {}) =>
    set((state) => {
      const event = {
        name,
        properties,
        timestamp: new Date(),
      };
      
      state.analytics.events.push(event);
      
      // Keep only last 100 events
      if (state.analytics.events.length > 100) {
        state.analytics.events = state.analytics.events.slice(-100);
      }
    }),

  clearAnalytics: () =>
    set((state) => {
      state.analytics = {
        sessionId: generateSessionId(),
        userId: state.analytics.userId,
        events: [],
      };
    }),

  setPerformanceMetrics: (metrics: Partial<AppStoreState['performance']>) =>
    set((state) => {
      state.performance = { ...state.performance, ...metrics };
    }),

  reset: () => set(() => ({ ...initialState })),
});

/**
 * App store with middleware
 */
export const useAppStore = create<AppStoreState>()(
  subscribeWithSelector(
    createStoreWithMiddleware(createAppStore(), {
      name: 'app-store',
      version: 1,
      partialize: (state) => ({
        features: state.features,
        version: state.version,
        buildNumber: state.buildNumber,
      }),
    })
  )
);

/**
 * App store selectors
 */
export const appSelectors = {
  version: (state: AppStoreState) => state.version,
  buildNumber: (state: AppStoreState) => state.buildNumber,
  environment: (state: AppStoreState) => state.environment,
  features: (state: AppStoreState) => state.features,
  isFeatureEnabled: (feature: string) => (state: AppStoreState) => state.features[feature] || false,
  isOnline: (state: AppStoreState) => state.isOnline,
  networkType: (state: AppStoreState) => state.networkType,
  isActive: (state: AppStoreState) => state.isActive,
  isBackground: (state: AppStoreState) => state.isBackground,
  errors: (state: AppStoreState) => state.errors,
  errorCount: (state: AppStoreState) => state.errors.length,
  recentErrors: (count: number = 10) => (state: AppStoreState) => 
    state.errors.slice(-count).reverse(),
  analytics: (state: AppStoreState) => state.analytics,
  sessionId: (state: AppStoreState) => state.analytics.sessionId,
  eventCount: (state: AppStoreState) => state.analytics.events.length,
  performance: (state: AppStoreState) => state.performance,
  
  // Computed selectors
  isDevelopment: (state: AppStoreState) => state.environment === 'development',
  isProduction: (state: AppStoreState) => state.environment === 'production',
  appInfo: (state: AppStoreState) => ({
    version: state.version,
    buildNumber: state.buildNumber,
    environment: state.environment,
  }),
};

/**
 * App store actions (for use outside components)
 */
export const appActions = {
  setVersion: (version: string, buildNumber: string) => 
    useAppStore.getState().setVersion(version, buildNumber),
    
  setFeature: (feature: string, enabled: boolean) => 
    useAppStore.getState().setFeature(feature, enabled),
    
  setFeatures: (features: Record<string, boolean>) => 
    useAppStore.getState().setFeatures(features),
    
  addError: (error: Error, context?: Record<string, any>) => 
    useAppStore.getState().addError(error, context),
    
  trackEvent: (name: string, properties?: Record<string, any>) => 
    useAppStore.getState().trackEvent(name, properties),
    
  setNetworkState: (isOnline: boolean, networkType?: string) => 
    useAppStore.getState().setNetworkState(isOnline, networkType),
    
  setAppState: (isActive: boolean, isBackground: boolean) => 
    useAppStore.getState().setAppState(isActive, isBackground),
};

/**
 * Feature flag helper
 */
export const useFeature = (feature: string, defaultValue: boolean = false) => {
  return useAppStore(state => state.features[feature] ?? defaultValue);
};

/**
 * Error tracking helper
 */
export const errorTracker = {
  captureError: (error: Error, context?: Record<string, any>) => {
    appActions.addError(error, context);
    
    // Log to console in development
    if (useAppStore.getState().environment === 'development') {
      console.error('Error captured:', error, context);
    }
  },
  
  captureException: (message: string, context?: Record<string, any>) => {
    const error = new Error(message);
    errorTracker.captureError(error, context);
  },
};

/**
 * Analytics helper
 */
export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    appActions.trackEvent(event, properties);
    
    // Log in development
    if (useAppStore.getState().environment === 'development') {
      console.log('Analytics event:', event, properties);
    }
  },
  
  page: (page: string, properties?: Record<string, any>) => {
    analytics.track('page_view', { page, ...properties });
  },
  
  user: (userId: string, properties?: Record<string, any>) => {
    useAppStore.getState().setAnalyticsUserId(userId);
    analytics.track('user_identified', { userId, ...properties });
  },
};

/**
 * Setup app store subscriptions and listeners
 */
export const setupAppStoreSubscriptions = () => {
  // Network state listeners
  if (typeof window !== 'undefined') {
    const updateOnlineStatus = () => {
      appActions.setNetworkState(navigator.onLine);
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // App visibility listeners
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      appActions.setAppState(isVisible, !isVisible);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Performance monitoring
    if ('performance' in window && 'navigation' in performance) {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (perfData) {
        useAppStore.getState().setPerformanceMetrics({
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          navigationTiming: perfData,
        });
      }
    }
    
    // Memory usage monitoring (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        if (memory) {
          useAppStore.getState().setPerformanceMetrics({
            memoryUsage: memory.usedJSHeapSize,
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }
  
  // Global error handler
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      errorTracker.captureError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      errorTracker.captureError(
        new Error(event.reason?.message || 'Unhandled Promise Rejection'),
        { reason: event.reason }
      );
    });
  }
};