/**
 * UI Store
 * Manages UI-related client state
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { BaseStore, UIState } from './types';
import { createStoreWithMiddleware } from './middleware';

/**
 * Toast notification interface
 */
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

/**
 * UI store state interface
 */
export interface UIStoreState extends BaseStore {
  // Layout state
  sidebarCollapsed: boolean;
  sidebarMobile: boolean;
  
  // Modal state
  modals: Record<string, { isOpen: boolean; data?: any }>;
  
  // Loading states
  loading: Record<string, boolean>;
  
  // Toast notifications
  toasts: Toast[];
  
  // Search state
  search: {
    query: string;
    filters: Record<string, any>;
    results: any[];
    isSearching: boolean;
  };
  
  // Page state
  currentPage: string;
  breadcrumbs: Array<{ label: string; path?: string }>;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarMobile: () => void;
  setSidebarMobile: (open: boolean) => void;
  
  openModal: (id: string, data?: any) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  setLoading: (key: string, loading: boolean) => void;
  clearLoading: () => void;
  
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  setSearch: (query: string, filters?: Record<string, any>) => void;
  setSearchResults: (results: any[]) => void;
  setSearching: (searching: boolean) => void;
  clearSearch: () => void;
  
  setCurrentPage: (page: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => void;
  
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  sidebarCollapsed: false,
  sidebarMobile: false,
  modals: {},
  loading: {},
  toasts: [],
  search: {
    query: '',
    filters: {},
    results: [],
    isSearching: false,
  },
  currentPage: '',
  breadcrumbs: [],
};

/**
 * Generate unique ID for toasts
 */
const generateToastId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * UI store creator
 */
const createUIStore = () => (set, get) => ({
  ...initialState,

  toggleSidebar: () =>
    set((state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    }),

  setSidebarCollapsed: (collapsed: boolean) =>
    set((state) => {
      state.sidebarCollapsed = collapsed;
    }),

  toggleSidebarMobile: () =>
    set((state) => {
      state.sidebarMobile = !state.sidebarMobile;
    }),

  setSidebarMobile: (open: boolean) =>
    set((state) => {
      state.sidebarMobile = open;
    }),

  openModal: (id: string, data?: any) =>
    set((state) => {
      state.modals[id] = { isOpen: true, data };
    }),

  closeModal: (id: string) =>
    set((state) => {
      if (state.modals[id]) {
        state.modals[id].isOpen = false;
        delete state.modals[id].data;
      }
    }),

  closeAllModals: () =>
    set((state) => {
      state.modals = {};
    }),

  setLoading: (key: string, loading: boolean) =>
    set((state) => {
      if (loading) {
        state.loading[key] = true;
      } else {
        delete state.loading[key];
      }
    }),

  clearLoading: () =>
    set((state) => {
      state.loading = {};
    }),

  addToast: (toast: Omit<Toast, 'id'>) => {
    const id = generateToastId();
    const newToast: Toast = { ...toast, id };
    
    set((state) => {
      state.toasts.push(newToast);
    });

    // Auto-remove toast after duration
    const duration = toast.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id: string) =>
    set((state) => {
      state.toasts = state.toasts.filter(toast => toast.id !== id);
    }),

  clearToasts: () =>
    set((state) => {
      state.toasts = [];
    }),

  setSearch: (query: string, filters: Record<string, any> = {}) =>
    set((state) => {
      state.search.query = query;
      state.search.filters = filters;
    }),

  setSearchResults: (results: any[]) =>
    set((state) => {
      state.search.results = results;
      state.search.isSearching = false;
    }),

  setSearching: (searching: boolean) =>
    set((state) => {
      state.search.isSearching = searching;
    }),

  clearSearch: () =>
    set((state) => {
      state.search = {
        query: '',
        filters: {},
        results: [],
        isSearching: false,
      };
    }),

  setCurrentPage: (page: string) =>
    set((state) => {
      state.currentPage = page;
    }),

  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) =>
    set((state) => {
      state.breadcrumbs = breadcrumbs;
    }),

  reset: () => set(() => ({ ...initialState })),
});

/**
 * UI store with middleware
 */
export const useUIStore = create<UIStoreState>()(
  subscribeWithSelector(
    createStoreWithMiddleware(createUIStore(), {
      name: 'ui-store',
      version: 1,
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    })
  )
);

/**
 * UI store selectors
 */
export const uiSelectors = {
  sidebarCollapsed: (state: UIStoreState) => state.sidebarCollapsed,
  sidebarMobile: (state: UIStoreState) => state.sidebarMobile,
  modals: (state: UIStoreState) => state.modals,
  isModalOpen: (id: string) => (state: UIStoreState) => state.modals[id]?.isOpen || false,
  modalData: (id: string) => (state: UIStoreState) => state.modals[id]?.data,
  loading: (state: UIStoreState) => state.loading,
  isLoading: (key: string) => (state: UIStoreState) => state.loading[key] || false,
  hasAnyLoading: (state: UIStoreState) => Object.keys(state.loading).length > 0,
  toasts: (state: UIStoreState) => state.toasts,
  search: (state: UIStoreState) => state.search,
  isSearching: (state: UIStoreState) => state.search.isSearching,
  searchQuery: (state: UIStoreState) => state.search.query,
  searchResults: (state: UIStoreState) => state.search.results,
  currentPage: (state: UIStoreState) => state.currentPage,
  breadcrumbs: (state: UIStoreState) => state.breadcrumbs,
};

/**
 * UI store actions (for use outside components)
 */
export const uiActions = {
  toggleSidebar: () => useUIStore.getState().toggleSidebar(),
  setSidebarCollapsed: (collapsed: boolean) => useUIStore.getState().setSidebarCollapsed(collapsed),
  openModal: (id: string, data?: any) => useUIStore.getState().openModal(id, data),
  closeModal: (id: string) => useUIStore.getState().closeModal(id),
  setLoading: (key: string, loading: boolean) => useUIStore.getState().setLoading(key, loading),
  addToast: (toast: Omit<Toast, 'id'>) => useUIStore.getState().addToast(toast),
  removeToast: (id: string) => useUIStore.getState().removeToast(id),
  setCurrentPage: (page: string) => useUIStore.getState().setCurrentPage(page),
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => 
    useUIStore.getState().setBreadcrumbs(breadcrumbs),
};

/**
 * Toast helper functions
 */
export const toast = {
  success: (title: string, message?: string, duration?: number) =>
    uiActions.addToast({ type: 'success', title, message, duration }),
    
  error: (title: string, message?: string, duration?: number) =>
    uiActions.addToast({ type: 'error', title, message, duration: duration || 0 }),
    
  warning: (title: string, message?: string, duration?: number) =>
    uiActions.addToast({ type: 'warning', title, message, duration }),
    
  info: (title: string, message?: string, duration?: number) =>
    uiActions.addToast({ type: 'info', title, message, duration }),
};

/**
 * Loading helper functions
 */
export const loading = {
  start: (key: string) => uiActions.setLoading(key, true),
  stop: (key: string) => uiActions.setLoading(key, false),
  toggle: (key: string) => {
    const isLoading = useUIStore.getState().loading[key];
    uiActions.setLoading(key, !isLoading);
  },
};

/**
 * Modal helper functions
 */
export const modal = {
  open: (id: string, data?: any) => uiActions.openModal(id, data),
  close: (id: string) => uiActions.closeModal(id),
  isOpen: (id: string) => useUIStore.getState().modals[id]?.isOpen || false,
  getData: (id: string) => useUIStore.getState().modals[id]?.data,
};