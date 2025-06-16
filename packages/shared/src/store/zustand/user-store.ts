/**
 * User Store
 * Manages user-related client state
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { UserProfile } from '@starter-template/database/auth';
import type { BaseStore, UserPreferences } from './types';
import { createStoreWithMiddleware } from './middleware';

/**
 * User store state interface
 */
export interface UserState extends BaseStore {
  // Current user
  currentUser: UserProfile | null;
  
  // User preferences
  preferences: UserPreferences;
  
  // Recently viewed users
  recentUsers: UserProfile[];
  
  // User search state
  searchResults: UserProfile[];
  searchQuery: string;
  isSearching: boolean;
  
  // Actions
  setCurrentUser: (user: UserProfile | null) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  addRecentUser: (user: UserProfile) => void;
  clearRecentUsers: () => void;
  setSearchResults: (users: UserProfile[], query: string) => void;
  clearSearch: () => void;
  setSearching: (isSearching: boolean) => void;
  reset: () => void;
}

/**
 * Default user preferences
 */
const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    email: true,
    push: true,
    marketing: false,
  },
  privacy: {
    profileVisibility: 'public',
    activityVisibility: 'public',
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
  },
};

/**
 * Initial state
 */
const initialState = {
  currentUser: null,
  preferences: defaultPreferences,
  recentUsers: [],
  searchResults: [],
  searchQuery: '',
  isSearching: false,
};

/**
 * User store creator
 */
const createUserStore = () => (set, get) => ({
  ...initialState,

  setCurrentUser: (user: UserProfile | null) =>
    set((state) => {
      state.currentUser = user;
      
      // Update preferences from user profile if available
      if (user?.preferences) {
        state.preferences = { ...state.preferences, ...user.preferences };
      }
    }),

  updatePreferences: (newPreferences: Partial<UserPreferences>) =>
    set((state) => {
      state.preferences = { ...state.preferences, ...newPreferences };
    }),

  addRecentUser: (user: UserProfile) =>
    set((state) => {
      // Remove user if already in recent list
      state.recentUsers = state.recentUsers.filter(u => u.id !== user.id);
      
      // Add to beginning of list
      state.recentUsers.unshift(user);
      
      // Limit to 10 recent users
      if (state.recentUsers.length > 10) {
        state.recentUsers = state.recentUsers.slice(0, 10);
      }
    }),

  clearRecentUsers: () =>
    set((state) => {
      state.recentUsers = [];
    }),

  setSearchResults: (users: UserProfile[], query: string) =>
    set((state) => {
      state.searchResults = users;
      state.searchQuery = query;
      state.isSearching = false;
    }),

  clearSearch: () =>
    set((state) => {
      state.searchResults = [];
      state.searchQuery = '';
      state.isSearching = false;
    }),

  setSearching: (isSearching: boolean) =>
    set((state) => {
      state.isSearching = isSearching;
    }),

  reset: () => set(() => ({ ...initialState })),
});

/**
 * User store with middleware
 */
export const useUserStore = create<UserState>()(
  subscribeWithSelector(
    createStoreWithMiddleware(createUserStore(), {
      name: 'user-store',
      version: 1,
      partialize: (state) => ({
        preferences: state.preferences,
        recentUsers: state.recentUsers,
      }),
    })
  )
);

/**
 * User store selectors
 */
export const userSelectors = {
  currentUser: (state: UserState) => state.currentUser,
  preferences: (state: UserState) => state.preferences,
  theme: (state: UserState) => state.preferences.theme,
  language: (state: UserState) => state.preferences.language,
  recentUsers: (state: UserState) => state.recentUsers,
  searchResults: (state: UserState) => state.searchResults,
  isSearching: (state: UserState) => state.isSearching,
  isLoggedIn: (state: UserState) => !!state.currentUser,
  userRole: (state: UserState) => state.currentUser?.role,
  userPermissions: (state: UserState) => state.currentUser?.permissions || [],
  
  // Computed selectors
  isDarkMode: (state: UserState) => {
    const { theme } = state.preferences;
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    // System theme detection would need to be handled in components
    return false;
  },
  
  hasPermission: (resource: string, action: string) => (state: UserState) => {
    return state.currentUser?.permissions?.some(
      p => p.resource === resource && p.action === action
    ) || false;
  },
  
  hasRole: (role: string) => (state: UserState) => {
    return state.currentUser?.role === role;
  },
};

/**
 * User store actions (for use outside components)
 */
export const userActions = {
  setCurrentUser: (user: UserProfile | null) => 
    useUserStore.getState().setCurrentUser(user),
    
  updatePreferences: (preferences: Partial<UserPreferences>) => 
    useUserStore.getState().updatePreferences(preferences),
    
  addRecentUser: (user: UserProfile) => 
    useUserStore.getState().addRecentUser(user),
    
  clearRecentUsers: () => 
    useUserStore.getState().clearRecentUsers(),
    
  reset: () => 
    useUserStore.getState().reset(),
};

/**
 * User store subscriptions for side effects
 */
export const setupUserStoreSubscriptions = () => {
  // Subscribe to user changes
  useUserStore.subscribe(
    (state) => state.currentUser,
    (currentUser, previousUser) => {
      if (currentUser?.id !== previousUser?.id) {
        console.log('User changed:', { currentUser, previousUser });
        
        // Could trigger analytics events, etc.
      }
    }
  );
  
  // Subscribe to theme changes
  useUserStore.subscribe(
    (state) => state.preferences.theme,
    (theme) => {
      // Apply theme to document
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
    }
  );
  
  // Subscribe to language changes
  useUserStore.subscribe(
    (state) => state.preferences.language,
    (language) => {
      // Update document language
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
      }
    }
  );
};