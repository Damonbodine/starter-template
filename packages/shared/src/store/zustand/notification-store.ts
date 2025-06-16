/**
 * Notification Store
 * Manages in-app notifications and alerts
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { BaseStore, NotificationItem, NotificationState } from './types';
import { createStoreWithMiddleware } from './middleware';

/**
 * Notification store state interface
 */
export interface NotificationStoreState extends BaseStore {
  items: NotificationItem[];
  unreadCount: number;
  settings: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    categories: Record<string, {
      enabled: boolean;
      sound: boolean;
      vibration: boolean;
    }>;
  };
  
  // Actions
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationStoreState['settings']>) => void;
  updateCategorySettings: (category: string, settings: Partial<NotificationStoreState['settings']['categories'][string]>) => void;
  reset: () => void;
}

/**
 * Generate notification ID
 */
const generateNotificationId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Default notification settings
 */
const defaultSettings = {
  enabled: true,
  sound: true,
  vibration: true,
  categories: {
    system: { enabled: true, sound: true, vibration: false },
    security: { enabled: true, sound: true, vibration: true },
    social: { enabled: true, sound: false, vibration: false },
    marketing: { enabled: false, sound: false, vibration: false },
    updates: { enabled: true, sound: false, vibration: false },
  },
};

/**
 * Initial state
 */
const initialState = {
  items: [],
  unreadCount: 0,
  settings: defaultSettings,
};

/**
 * Notification store creator
 */
const createNotificationStore = () => (set, get) => ({
  ...initialState,

  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) => {
    const id = generateNotificationId();
    const newNotification: NotificationItem = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false,
    };

    set((state) => {
      state.items.unshift(newNotification);
      state.unreadCount += 1;
      
      // Keep only last 100 notifications
      if (state.items.length > 100) {
        state.items = state.items.slice(0, 100);
      }
    });

    // Check if notifications should be shown for this type
    const categoryKey = notification.metadata?.category || 'system';
    const categorySettings = get().settings.categories[categoryKey];
    
    if (get().settings.enabled && categorySettings?.enabled) {
      // Trigger browser notification if supported
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: id,
            silent: !categorySettings.sound,
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: id,
                silent: !categorySettings.sound,
              });
            }
          });
        }
      }

      // Trigger vibration if supported and enabled
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator && categorySettings.vibration) {
        navigator.vibrate([200, 100, 200]);
      }
    }

    return id;
  },

  markAsRead: (id: string) =>
    set((state) => {
      const notification = state.items.find(item => item.id === id);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    }),

  markAllAsRead: () =>
    set((state) => {
      state.items.forEach(item => {
        item.read = true;
      });
      state.unreadCount = 0;
    }),

  removeNotification: (id: string) =>
    set((state) => {
      const index = state.items.findIndex(item => item.id === id);
      if (index !== -1) {
        const notification = state.items[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items.splice(index, 1);
      }
    }),

  clearAll: () =>
    set((state) => {
      state.items = [];
      state.unreadCount = 0;
    }),

  updateSettings: (newSettings: Partial<NotificationStoreState['settings']>) =>
    set((state) => {
      state.settings = { ...state.settings, ...newSettings };
    }),

  updateCategorySettings: (category: string, newSettings: Partial<NotificationStoreState['settings']['categories'][string]>) =>
    set((state) => {
      if (!state.settings.categories[category]) {
        state.settings.categories[category] = {
          enabled: true,
          sound: false,
          vibration: false,
        };
      }
      state.settings.categories[category] = {
        ...state.settings.categories[category],
        ...newSettings,
      };
    }),

  reset: () => set(() => ({ ...initialState })),
});

/**
 * Notification store with middleware
 */
export const useNotificationStore = create<NotificationStoreState>()(
  subscribeWithSelector(
    createStoreWithMiddleware(createNotificationStore(), {
      name: 'notification-store',
      version: 1,
      partialize: (state) => ({
        settings: state.settings,
        // Don't persist actual notifications
      }),
    })
  )
);

/**
 * Notification store selectors
 */
export const notificationSelectors = {
  items: (state: NotificationStoreState) => state.items,
  unreadCount: (state: NotificationStoreState) => state.unreadCount,
  unreadItems: (state: NotificationStoreState) => state.items.filter(item => !item.read),
  readItems: (state: NotificationStoreState) => state.items.filter(item => item.read),
  recentItems: (count: number = 10) => (state: NotificationStoreState) => 
    state.items.slice(0, count),
  settings: (state: NotificationStoreState) => state.settings,
  isCategoryEnabled: (category: string) => (state: NotificationStoreState) =>
    state.settings.categories[category]?.enabled ?? true,
  
  // Grouped notifications
  groupedByType: (state: NotificationStoreState) => {
    return state.items.reduce((groups, item) => {
      const type = item.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(item);
      return groups;
    }, {} as Record<string, NotificationItem[]>);
  },
  
  // Notifications by date
  groupedByDate: (state: NotificationStoreState) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return state.items.reduce((groups, item) => {
      const itemDate = new Date(item.timestamp);
      const isToday = itemDate.toDateString() === today.toDateString();
      const isYesterday = itemDate.toDateString() === yesterday.toDateString();
      
      let group: string;
      if (isToday) {
        group = 'Today';
      } else if (isYesterday) {
        group = 'Yesterday';
      } else {
        group = itemDate.toLocaleDateString();
      }
      
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {} as Record<string, NotificationItem[]>);
  },
};

/**
 * Notification store actions (for use outside components)
 */
export const notificationActions = {
  add: (notification: Omit<NotificationItem, 'id' | 'timestamp'>) =>
    useNotificationStore.getState().addNotification(notification),
    
  markAsRead: (id: string) =>
    useNotificationStore.getState().markAsRead(id),
    
  markAllAsRead: () =>
    useNotificationStore.getState().markAllAsRead(),
    
  remove: (id: string) =>
    useNotificationStore.getState().removeNotification(id),
    
  clearAll: () =>
    useNotificationStore.getState().clearAll(),
    
  updateSettings: (settings: Partial<NotificationStoreState['settings']>) =>
    useNotificationStore.getState().updateSettings(settings),
};

/**
 * Notification helper functions
 */
export const notifications = {
  info: (title: string, message: string, metadata?: Record<string, any>) =>
    notificationActions.add({ type: 'info', title, message, metadata, read: false }),
    
  success: (title: string, message: string, metadata?: Record<string, any>) =>
    notificationActions.add({ type: 'success', title, message, metadata, read: false }),
    
  warning: (title: string, message: string, metadata?: Record<string, any>) =>
    notificationActions.add({ type: 'warning', title, message, metadata, read: false }),
    
  error: (title: string, message: string, metadata?: Record<string, any>) =>
    notificationActions.add({ type: 'error', title, message, metadata, read: false }),
    
  system: (title: string, message: string, metadata?: Record<string, any>) =>
    notificationActions.add({ 
      type: 'system', 
      title, 
      message, 
      metadata: { ...metadata, category: 'system' }, 
      read: false 
    }),
};

/**
 * Setup notification permissions and listeners
 */
export const setupNotificationPermissions = async () => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }
  return false;
};

/**
 * Setup notification store subscriptions
 */
export const setupNotificationStoreSubscriptions = () => {
  // Subscribe to unread count changes for badge updates
  useNotificationStore.subscribe(
    (state) => state.unreadCount,
    (unreadCount) => {
      // Update document title with unread count
      if (typeof document !== 'undefined') {
        const title = document.title.replace(/^\(\d+\)\s*/, '');
        document.title = unreadCount > 0 ? `(${unreadCount}) ${title}` : title;
      }
      
      // Update favicon badge if library is available
      // This would require a library like favico.js
    }
  );
};