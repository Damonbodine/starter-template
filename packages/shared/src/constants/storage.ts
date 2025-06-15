/**
 * Storage-related constants for local storage, session storage,
 * AsyncStorage, and cache management
 */

/**
 * Local storage keys for web
 */
export const LOCAL_STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
  USER_PROFILE: 'user_profile',
  REMEMBER_ME: 'remember_me',
  
  // User preferences
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  SOUND_ENABLED: 'sound_enabled',
  
  // App state
  LAST_ROUTE: 'last_route',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  TUTORIAL_COMPLETED: 'tutorial_completed',
  FIRST_LAUNCH: 'first_launch',
  APP_VERSION: 'app_version',
  
  // UI state
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  SELECTED_TAB: 'selected_tab',
  GRID_VIEW: 'grid_view',
  SORT_PREFERENCE: 'sort_preference',
  
  // Content
  DRAFT_CONTENT: 'draft_content',
  SEARCH_HISTORY: 'search_history',
  RECENT_ITEMS: 'recent_items',
  BOOKMARKS: 'bookmarks',
  
  // Settings
  AUTO_SAVE: 'auto_save',
  BACKUP_ENABLED: 'backup_enabled',
  ANALYTICS_ENABLED: 'analytics_enabled',
  
  // Cache
  CACHE_TIMESTAMP: 'cache_timestamp',
  CACHED_DATA: 'cached_data',
} as const;

/**
 * Session storage keys for temporary data
 */
export const SESSION_STORAGE_KEYS = {
  // Temporary auth
  TEMP_TOKEN: 'temp_token',
  LOGIN_REDIRECT: 'login_redirect',
  REGISTRATION_DATA: 'registration_data',
  
  // Form data
  FORM_DRAFT: 'form_draft',
  UPLOAD_PROGRESS: 'upload_progress',
  SEARCH_FILTERS: 'search_filters',
  
  // Navigation
  SCROLL_POSITION: 'scroll_position',
  MODAL_STATE: 'modal_state',
  TAB_STATE: 'tab_state',
  
  // Temporary flags
  SHOW_WELCOME: 'show_welcome',
  POPUP_DISMISSED: 'popup_dismissed',
  ERROR_OCCURRED: 'error_occurred',
} as const;

/**
 * AsyncStorage keys for React Native
 */
export const ASYNC_STORAGE_KEYS = {
  // Authentication (persisted)
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_PROFILE: '@user_profile',
  BIOMETRIC_ENABLED: '@biometric_enabled',
  
  // User preferences (persisted)
  THEME_PREFERENCE: '@theme_preference',
  LANGUAGE_PREFERENCE: '@language_preference',
  NOTIFICATION_SETTINGS: '@notification_settings',
  PRIVACY_SETTINGS: '@privacy_settings',
  
  // App data (persisted)
  OFFLINE_DATA: '@offline_data',
  CACHED_IMAGES: '@cached_images',
  DOWNLOADED_CONTENT: '@downloaded_content',
  
  // Settings (persisted)
  APP_SETTINGS: '@app_settings',
  FEATURE_FLAGS: '@feature_flags',
  DEBUG_SETTINGS: '@debug_settings',
  
  // State (can be cleared)
  NAVIGATION_STATE: '@navigation_state',
  PENDING_UPLOADS: '@pending_uploads',
  BACKGROUND_TASKS: '@background_tasks',
} as const;

/**
 * IndexedDB database and store names for web
 */
export const INDEXED_DB = {
  DATABASE_NAME: 'MyAppDB',
  VERSION: 1,
  
  STORES: {
    USERS: 'users',
    CONTENT: 'content',
    FILES: 'files',
    CACHE: 'cache',
    SYNC_QUEUE: 'sync_queue',
    OFFLINE_ACTIONS: 'offline_actions',
  },
  
  INDEXES: {
    BY_ID: 'id',
    BY_TIMESTAMP: 'timestamp',
    BY_USER_ID: 'userId',
    BY_STATUS: 'status',
  },
} as const;

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  // Cache durations (in milliseconds)
  DURATIONS: {
    IMMEDIATE: 0,
    SHORT: 5 * 60 * 1000,      // 5 minutes
    MEDIUM: 30 * 60 * 1000,    // 30 minutes
    LONG: 2 * 60 * 60 * 1000,  // 2 hours
    DAY: 24 * 60 * 60 * 1000,  // 24 hours
    WEEK: 7 * 24 * 60 * 60 * 1000, // 7 days
    MONTH: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  
  // Cache strategies
  STRATEGIES: {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    CACHE_ONLY: 'cache-only',
    NETWORK_ONLY: 'network-only',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  },
  
  // Cache sizes (in bytes)
  MAX_SIZES: {
    SMALL: 1 * 1024 * 1024,      // 1MB
    MEDIUM: 10 * 1024 * 1024,    // 10MB
    LARGE: 50 * 1024 * 1024,     // 50MB
    XLARGE: 100 * 1024 * 1024,   // 100MB
  },
  
  // Default cache configuration by data type
  DEFAULTS: {
    USER_DATA: {
      duration: 30 * 60 * 1000, // 30 minutes
      strategy: 'stale-while-revalidate',
      maxSize: 1 * 1024 * 1024, // 1MB
    },
    CONTENT: {
      duration: 2 * 60 * 60 * 1000, // 2 hours
      strategy: 'cache-first',
      maxSize: 10 * 1024 * 1024, // 10MB
    },
    IMAGES: {
      duration: 7 * 24 * 60 * 60 * 1000, // 7 days
      strategy: 'cache-first',
      maxSize: 50 * 1024 * 1024, // 50MB
    },
    API_RESPONSES: {
      duration: 5 * 60 * 1000, // 5 minutes
      strategy: 'network-first',
      maxSize: 5 * 1024 * 1024, // 5MB
    },
  },
} as const;

/**
 * Storage quotas and limits
 */
export const STORAGE_LIMITS = {
  // Local storage (strings only, ~5-10MB typically)
  LOCAL_STORAGE_MAX: 5 * 1024 * 1024, // 5MB estimated
  
  // Session storage (strings only, ~5-10MB typically)
  SESSION_STORAGE_MAX: 5 * 1024 * 1024, // 5MB estimated
  
  // AsyncStorage (can be much larger)
  ASYNC_STORAGE_MAX: 100 * 1024 * 1024, // 100MB
  
  // IndexedDB (can be very large, browser dependent)
  INDEXED_DB_MAX: 1024 * 1024 * 1024, // 1GB
  
  // Individual item limits
  MAX_ITEM_SIZE: 1 * 1024 * 1024, // 1MB per item
  MAX_KEY_LENGTH: 1024, // 1KB per key
  
  // Collection limits
  MAX_SEARCH_HISTORY: 100,
  MAX_RECENT_ITEMS: 50,
  MAX_BOOKMARKS: 1000,
  MAX_OFFLINE_ACTIONS: 500,
} as const;

/**
 * Storage encryption settings
 */
export const ENCRYPTION_CONFIG = {
  // Keys that should be encrypted
  ENCRYPTED_KEYS: [
    LOCAL_STORAGE_KEYS.AUTH_TOKEN,
    LOCAL_STORAGE_KEYS.REFRESH_TOKEN,
    ASYNC_STORAGE_KEYS.AUTH_TOKEN,
    ASYNC_STORAGE_KEYS.REFRESH_TOKEN,
    ASYNC_STORAGE_KEYS.USER_PROFILE,
  ],
  
  // Encryption algorithm
  ALGORITHM: 'AES-GCM',
  KEY_LENGTH: 256,
  IV_LENGTH: 12,
  
  // Salt for key derivation
  SALT_LENGTH: 16,
  ITERATIONS: 100000,
} as const;

/**
 * Data synchronization settings
 */
export const SYNC_CONFIG = {
  // Sync intervals (in milliseconds)
  INTERVALS: {
    IMMEDIATE: 0,
    FAST: 30 * 1000,       // 30 seconds
    NORMAL: 5 * 60 * 1000, // 5 minutes
    SLOW: 30 * 60 * 1000,  // 30 minutes
  },
  
  // Sync strategies
  STRATEGIES: {
    MANUAL: 'manual',
    AUTOMATIC: 'automatic',
    ON_CHANGE: 'on-change',
    SCHEDULED: 'scheduled',
  },
  
  // Sync priorities
  PRIORITIES: {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
  },
  
  // Conflict resolution
  CONFLICT_RESOLUTION: {
    CLIENT_WINS: 'client-wins',
    SERVER_WINS: 'server-wins',
    LAST_WRITE_WINS: 'last-write-wins',
    MANUAL_MERGE: 'manual-merge',
  },
} as const;

/**
 * Backup and restore settings
 */
export const BACKUP_CONFIG = {
  // Backup types
  TYPES: {
    FULL: 'full',
    INCREMENTAL: 'incremental',
    DIFFERENTIAL: 'differential',
  },
  
  // Backup frequencies
  FREQUENCIES: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    MANUAL: 'manual',
  },
  
  // Backup retention
  RETENTION: {
    DAYS: 30,
    WEEKS: 12,
    MONTHS: 12,
  },
  
  // Backup destinations
  DESTINATIONS: {
    LOCAL: 'local',
    CLOUD: 'cloud',
    EXTERNAL: 'external',
  },
} as const;