// Types
export * from './types'

// Utils
export * from './utils'

// Constants  
export * from './constants'

// API
export * from './api'

// Errors
export * from './errors'

// Auth
export * from './auth'

// Re-export commonly used items for convenience
export type {
  ApiResponse,
  PaginatedResponse,
  LoadingState,
  UserProfile,
  Post,
  Comment,
  HttpMethod,
  ErrorResponse
} from './types'

export {
  formatDate,
  isValidEmail,
  slugify,
  formatCurrency,
  unique,
  deepMerge,
  getPlatformInfo,
  debounce,
  throttle
} from './utils'

export {
  APP_METADATA,
  API_ENDPOINTS,
  COLORS,
  BREAKPOINTS,
  VALIDATION_LIMITS,
  ROUTES
} from './constants'

export {
  ApiClient,
  createApiClient,
  buildEndpoint
} from './api'

export {
  AppError,
  NetworkError,
  ValidationError,
  initializeErrorHandling,
  safeExecute
} from './errors'

export {
  AuthStorageService,
  validatePassword,
  hasRole,
  requirePermission,
  isAuthenticated
} from './auth'