/**
 * Route constants for navigation across platforms
 * Supports both web URLs and mobile screen names
 */

/**
 * Public routes (no authentication required)
 */
export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  FAQ: '/faq',
  
  // Authentication routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  
  // Content routes
  BLOG: '/blog',
  BLOG_POST: (slug: string) => `/blog/${slug}`,
  SEARCH: '/search',
  SEARCH_RESULTS: (query: string) => `/search?q=${encodeURIComponent(query)}`,
} as const;

/**
 * Protected routes (authentication required)
 */
export const PROTECTED_ROUTES = {
  // User routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ACCOUNT: '/account',
  
  // Profile sub-routes
  PROFILE_EDIT: '/profile/edit',
  PROFILE_AVATAR: '/profile/avatar',
  PROFILE_PREFERENCES: '/profile/preferences',
  PROFILE_SECURITY: '/profile/security',
  
  // Settings sub-routes
  SETTINGS_GENERAL: '/settings/general',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_PRIVACY: '/settings/privacy',
  SETTINGS_BILLING: '/settings/billing',
  SETTINGS_DANGER_ZONE: '/settings/danger-zone',
  
  // Content management
  CONTENT: '/content',
  CONTENT_CREATE: '/content/create',
  CONTENT_EDIT: (id: string) => `/content/${id}/edit`,
  CONTENT_VIEW: (id: string) => `/content/${id}`,
  
  // File management
  FILES: '/files',
  FILES_UPLOAD: '/files/upload',
  FILES_MANAGE: '/files/manage',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_SETTINGS: '/notifications/settings',
} as const;

/**
 * Admin routes (admin role required)
 */
export const ADMIN_ROUTES = {
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAIL: (id: string) => `/admin/users/${id}`,
  ADMIN_CONTENT: '/admin/content',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_LOGS: '/admin/logs',
  ADMIN_SYSTEM: '/admin/system',
} as const;

/**
 * API routes for client-side requests
 */
export const API_ROUTES = {
  // Base API path
  BASE: '/api',
  
  // Authentication
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_FORGOT_PASSWORD: '/api/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/api/auth/reset-password',
  AUTH_VERIFY_EMAIL: '/api/auth/verify-email',
  
  // User management
  USERS: '/api/users',
  USER_PROFILE: '/api/users/profile',
  USER_AVATAR: '/api/users/avatar',
  USER_PREFERENCES: '/api/users/preferences',
  
  // Content
  CONTENT: '/api/content',
  CONTENT_SEARCH: '/api/content/search',
  
  // Files
  FILES_UPLOAD: '/api/files/upload',
  FILES_DELETE: (id: string) => `/api/files/${id}`,
  
  // System
  HEALTH: '/api/health',
  VERSION: '/api/version',
} as const;

/**
 * Mobile screen names for React Navigation
 */
export const MOBILE_SCREENS = {
  // Tab screens
  HOME_TAB: 'HomeTab',
  EXPLORE_TAB: 'ExploreTab',
  PROFILE_TAB: 'ProfileTab',
  SETTINGS_TAB: 'SettingsTab',
  
  // Stack screens
  HOME: 'Home',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  RESET_PASSWORD: 'ResetPassword',
  
  // Profile screens
  PROFILE: 'Profile',
  PROFILE_EDIT: 'ProfileEdit',
  PROFILE_AVATAR: 'ProfileAvatar',
  
  // Settings screens
  SETTINGS: 'Settings',
  SETTINGS_GENERAL: 'SettingsGeneral',
  SETTINGS_NOTIFICATIONS: 'SettingsNotifications',
  SETTINGS_PRIVACY: 'SettingsPrivacy',
  SETTINGS_ABOUT: 'SettingsAbout',
  
  // Content screens
  CONTENT_LIST: 'ContentList',
  CONTENT_DETAIL: 'ContentDetail',
  CONTENT_CREATE: 'ContentCreate',
  CONTENT_EDIT: 'ContentEdit',
  
  // Modal screens
  MODAL_CAMERA: 'ModalCamera',
  MODAL_IMAGE_PICKER: 'ModalImagePicker',
  MODAL_CONFIRMATION: 'ModalConfirmation',
  
  // Onboarding
  ONBOARDING: 'Onboarding',
  WELCOME: 'Welcome',
  TUTORIAL: 'Tutorial',
} as const;

/**
 * Route parameters for dynamic routes
 */
export const ROUTE_PARAMS = {
  // URL parameters
  ID: 'id',
  SLUG: 'slug',
  TOKEN: 'token',
  EMAIL: 'email',
  
  // Query parameters
  QUERY: 'q',
  PAGE: 'page',
  LIMIT: 'limit',
  SORT: 'sort',
  ORDER: 'order',
  FILTER: 'filter',
  CATEGORY: 'category',
  TAG: 'tag',
  
  // Navigation state
  TAB: 'tab',
  STEP: 'step',
  RETURN_TO: 'returnTo',
  REDIRECT: 'redirect',
} as const;

/**
 * Route metadata for navigation
 */
export const ROUTE_METADATA = {
  [PUBLIC_ROUTES.HOME]: {
    title: 'Home',
    description: 'Welcome to our application',
    requiresAuth: false,
    showInNav: true,
  },
  [PUBLIC_ROUTES.ABOUT]: {
    title: 'About',
    description: 'Learn more about us',
    requiresAuth: false,
    showInNav: true,
  },
  [PUBLIC_ROUTES.LOGIN]: {
    title: 'Login',
    description: 'Sign in to your account',
    requiresAuth: false,
    showInNav: false,
  },
  [PUBLIC_ROUTES.REGISTER]: {
    title: 'Register',
    description: 'Create a new account',
    requiresAuth: false,
    showInNav: false,
  },
  [PROTECTED_ROUTES.DASHBOARD]: {
    title: 'Dashboard',
    description: 'Your personal dashboard',
    requiresAuth: true,
    showInNav: true,
  },
  [PROTECTED_ROUTES.PROFILE]: {
    title: 'Profile',
    description: 'Manage your profile',
    requiresAuth: true,
    showInNav: true,
  },
  [PROTECTED_ROUTES.SETTINGS]: {
    title: 'Settings',
    description: 'Manage your settings',
    requiresAuth: true,
    showInNav: true,
  },
} as const;

/**
 * Deep linking schemes for mobile
 */
export const DEEP_LINK_SCHEMES = {
  APP_SCHEME: 'myapp://',
  UNIVERSAL_LINK: 'https://myapp.com',
  
  // Deep link patterns
  HOME: 'myapp://home',
  PROFILE: 'myapp://profile',
  CONTENT: (id: string) => `myapp://content/${id}`,
  SHARE: (id: string) => `myapp://share/${id}`,
  
  // Universal link patterns
  UNIVERSAL_HOME: 'https://myapp.com/app',
  UNIVERSAL_PROFILE: 'https://myapp.com/app/profile',
  UNIVERSAL_CONTENT: (id: string) => `https://myapp.com/app/content/${id}`,
} as const;

/**
 * Navigation configuration
 */
export const NAVIGATION_CONFIG = {
  // Default navigation options
  defaultOptions: {
    headerShown: true,
    gestureEnabled: true,
    animationEnabled: true,
  },
  
  // Tab bar configuration
  tabBar: {
    showLabel: true,
    activeTintColor: '#007bff',
    inactiveTintColor: '#6c757d',
    style: {
      height: 60,
      paddingBottom: 8,
    },
  },
  
  // Stack navigation options
  stack: {
    headerMode: 'screen',
    cardStyle: { backgroundColor: '#ffffff' },
    gestureEnabled: true,
  },
} as const;