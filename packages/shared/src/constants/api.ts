/**
 * API-related constants including base URLs, endpoints,
 * HTTP status codes, timeouts, and rate limiting
 */

import { ENVIRONMENTS, CURRENT_ENV } from './app';

/**
 * Base URLs for different environments
 */
export const API_BASE_URLS = {
  [ENVIRONMENTS.DEVELOPMENT]: 'http://localhost:3001/api',
  [ENVIRONMENTS.STAGING]: 'https://api-staging.your-app.com/api',
  [ENVIRONMENTS.PRODUCTION]: 'https://api.your-app.com/api',
} as const;

/**
 * Current API base URL based on environment
 */
export const API_BASE_URL = API_BASE_URLS[CURRENT_ENV];

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
  },
  
  // User management
  users: {
    profile: '/users/profile',
    update: '/users/profile',
    delete: '/users/profile',
    avatar: '/users/avatar',
    preferences: '/users/preferences',
  },
  
  // Content
  content: {
    list: '/content',
    create: '/content',
    get: (id: string) => `/content/${id}`,
    update: (id: string) => `/content/${id}`,
    delete: (id: string) => `/content/${id}`,
    search: '/content/search',
  },
  
  // File uploads
  files: {
    upload: '/files/upload',
    delete: (id: string) => `/files/${id}`,
    download: (id: string) => `/files/${id}/download`,
  },
  
  // System
  system: {
    health: '/system/health',
    version: '/system/version',
    status: '/system/status',
  },
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * HTTP methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

export type HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];

/**
 * Request timeout configurations (in milliseconds)
 */
export const REQUEST_TIMEOUTS = {
  SHORT: 5000,     // 5 seconds
  MEDIUM: 15000,   // 15 seconds
  LONG: 30000,     // 30 seconds
  UPLOAD: 60000,   // 60 seconds for file uploads
  DEFAULT: 10000,  // 10 seconds default
} as const;

/**
 * Rate limiting constants
 */
export const RATE_LIMITS = {
  // Requests per minute
  AUTH_REQUESTS: 5,        // Login/register attempts
  API_REQUESTS: 100,       // General API requests
  FILE_UPLOADS: 10,        // File upload requests
  SEARCH_REQUESTS: 30,     // Search requests
  
  // Burst limits (requests per second)
  BURST_LIMIT: 10,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,       // Base delay in milliseconds
  RETRY_BACKOFF: 2,        // Exponential backoff multiplier
} as const;

/**
 * Content type headers
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml',
} as const;

/**
 * Common request headers
 */
export const REQUEST_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
  USER_AGENT: 'User-Agent',
  X_API_KEY: 'X-API-Key',
  X_REQUEST_ID: 'X-Request-ID',
  X_CLIENT_VERSION: 'X-Client-Version',
} as const;

/**
 * API response metadata keys
 */
export const RESPONSE_METADATA = {
  PAGINATION: 'pagination',
  TOTAL: 'total',
  PAGE: 'page',
  LIMIT: 'limit',
  HAS_MORE: 'hasMore',
  NEXT_CURSOR: 'nextCursor',
} as const;

/**
 * WebSocket event types
 */
export const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  MESSAGE: 'message',
  RECONNECT: 'reconnect',
  PING: 'ping',
  PONG: 'pong',
} as const;