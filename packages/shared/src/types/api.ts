/**
 * API-related types including request/response types, HTTP methods, endpoints, and error responses
 */

import { ApiResponse, ErrorResponse, PaginatedResponse, QueryParams } from './common';

/**
 * HTTP methods
 */
export type HttpMethod = 
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

/**
 * HTTP status codes
 */
export type HttpStatusCode =
  | 200  // OK
  | 201  // Created
  | 204  // No Content
  | 400  // Bad Request
  | 401  // Unauthorized
  | 403  // Forbidden
  | 404  // Not Found
  | 409  // Conflict
  | 422  // Unprocessable Entity
  | 429  // Too Many Requests
  | 500  // Internal Server Error
  | 502  // Bad Gateway
  | 503; // Service Unavailable

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  /** HTTP method */
  method: HttpMethod;
  /** Request URL */
  url: string;
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body */
  body?: any;
  /** Query parameters */
  params?: Record<string, any>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Whether to include credentials */
  withCredentials?: boolean;
  /** Response type */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  /** Request metadata */
  metadata?: Record<string, any>;
}

/**
 * API response metadata
 */
export interface ApiResponseMeta {
  /** Response status code */
  status: HttpStatusCode;
  /** Response headers */
  headers: Record<string, string>;
  /** Response time in milliseconds */
  responseTime: number;
  /** Request ID for tracking */
  requestId?: string;
  /** Rate limit information */
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

/**
 * Complete API response with metadata
 */
export interface FullApiResponse<T = any> extends ApiResponse<T> {
  /** Response metadata */
  meta: ApiResponseMeta;
}

/**
 * API error details
 */
export interface ApiErrorDetails {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Field-specific errors */
  field?: string;
  /** Additional error data */
  data?: any;
}

/**
 * Validation error response
 */
export interface ValidationErrorResponse extends ErrorResponse {
  /** Validation error details */
  error: {
    code: 'VALIDATION_ERROR';
    details: {
      /** Field validation errors */
      fields: Record<string, string[]>;
    };
  };
}

/**
 * Authentication error response
 */
export interface AuthErrorResponse extends ErrorResponse {
  /** Authentication error details */
  error: {
    code: 'AUTH_ERROR' | 'TOKEN_EXPIRED' | 'INVALID_CREDENTIALS';
    details: {
      /** Whether to redirect to login */
      redirectToLogin?: boolean;
      /** Refresh token available */
      canRefresh?: boolean;
    };
  };
}

/**
 * Rate limit error response
 */
export interface RateLimitErrorResponse extends ErrorResponse {
  /** Rate limit error details */
  error: {
    code: 'RATE_LIMIT_EXCEEDED';
    details: {
      /** Retry after seconds */
      retryAfter: number;
      /** Rate limit info */
      rateLimit: {
        limit: number;
        remaining: number;
        reset: number;
      };
    };
  };
}

/**
 * Generic list request parameters
 */
export interface ListRequestParams extends QueryParams {
  /** Include deleted items */
  includeDeleted?: boolean;
  /** Fields to include */
  include?: string[];
  /** Fields to exclude */
  exclude?: string[];
}

/**
 * Generic create request
 */
export interface CreateRequest<T> {
  /** Data to create */
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
}

/**
 * Generic update request
 */
export interface UpdateRequest<T> {
  /** Data to update */
  data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
}

/**
 * Bulk operation request
 */
export interface BulkRequest<T> {
  /** Items to process */
  items: T[];
  /** Operation to perform */
  operation: 'create' | 'update' | 'delete';
  /** Whether to continue on error */
  continueOnError?: boolean;
}

/**
 * Bulk operation response
 */
export interface BulkResponse<T> extends ApiResponse {
  /** Operation results */
  data: {
    /** Successfully processed items */
    success: T[];
    /** Failed items with errors */
    errors: {
      item: T;
      error: string;
    }[];
    /** Summary statistics */
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  };
}

/**
 * File upload request
 */
export interface FileUploadRequest {
  /** File to upload */
  file: File | Blob;
  /** Upload path */
  path?: string;
  /** File metadata */
  metadata?: Record<string, any>;
  /** Progress callback */
  onProgress?: (loaded: number, total: number) => void;
}

/**
 * File upload response
 */
export interface FileUploadResponse extends ApiResponse {
  /** Upload result */
  data: {
    /** File ID */
    id: string;
    /** File URL */
    url: string;
    /** File size */
    size: number;
    /** File type */
    type: string;
    /** Original filename */
    filename: string;
  };
}

/**
 * API endpoint definitions
 */
export interface ApiEndpoints {
  // Authentication
  auth: {
    login: '/auth/login';
    logout: '/auth/logout';
    register: '/auth/register';
    refresh: '/auth/refresh';
    forgotPassword: '/auth/forgot-password';
    resetPassword: '/auth/reset-password';
    verifyEmail: '/auth/verify-email';
    resendVerification: '/auth/resend-verification';
  };
  
  // Users
  users: {
    list: '/users';
    create: '/users';
    get: '/users/:id';
    update: '/users/:id';
    delete: '/users/:id';
    profile: '/users/profile';
    updateProfile: '/users/profile';
    changePassword: '/users/change-password';
    uploadAvatar: '/users/avatar';
  };
  
  // Content
  posts: {
    list: '/posts';
    create: '/posts';
    get: '/posts/:id';
    update: '/posts/:id';
    delete: '/posts/:id';
    publish: '/posts/:id/publish';
    unpublish: '/posts/:id/unpublish';
    like: '/posts/:id/like';
    unlike: '/posts/:id/unlike';
    bookmark: '/posts/:id/bookmark';
    unbookmark: '/posts/:id/unbookmark';
    share: '/posts/:id/share';
  };
  
  // Comments
  comments: {
    list: '/posts/:postId/comments';
    create: '/posts/:postId/comments';
    get: '/comments/:id';
    update: '/comments/:id';
    delete: '/comments/:id';
    like: '/comments/:id/like';
    unlike: '/comments/:id/unlike';
  };
  
  // Categories
  categories: {
    list: '/categories';
    create: '/categories';
    get: '/categories/:id';
    update: '/categories/:id';
    delete: '/categories/:id';
  };
  
  // Tags
  tags: {
    list: '/tags';
    create: '/tags';
    get: '/tags/:id';
    update: '/tags/:id';
    delete: '/tags/:id';
    search: '/tags/search';
  };
  
  // Media
  media: {
    upload: '/media/upload';
    list: '/media';
    get: '/media/:id';
    delete: '/media/:id';
  };
  
  // Admin
  admin: {
    dashboard: '/admin/dashboard';
    users: '/admin/users';
    content: '/admin/content';
    reports: '/admin/reports';
    analytics: '/admin/analytics';
  };
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  /** Base URL for API */
  baseURL: string;
  /** Default headers */
  defaultHeaders?: Record<string, string>;
  /** Request timeout */
  timeout?: number;
  /** Retry configuration */
  retry?: {
    attempts: number;
    delay: number;
    retryCondition?: (error: any) => boolean;
  };
  /** Request/response interceptors */
  interceptors?: {
    request?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
    response?: (response: any) => any | Promise<any>;
    error?: (error: any) => any | Promise<any>;
  };
}

/**
 * API client interface
 */
export interface ApiClient {
  /** Make GET request */
  get<T = any>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>;
  
  /** Make POST request */
  post<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>;
  
  /** Make PUT request */
  put<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>;
  
  /** Make PATCH request */
  patch<T = any>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>;
  
  /** Make DELETE request */
  delete<T = any>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>;
  
  /** Upload file */
  upload<T = any>(url: string, file: File | Blob, config?: Partial<FileUploadRequest>): Promise<FileUploadResponse>;
  
  /** Set authentication token */
  setAuthToken(token: string): void;
  
  /** Clear authentication token */
  clearAuthToken(): void;
}

/**
 * WebSocket message types
 */
export type WebSocketMessageType = 
  | 'connection'
  | 'disconnection'
  | 'error'
  | 'notification'
  | 'chat'
  | 'update'
  | 'heartbeat';

/**
 * WebSocket message
 */
export interface WebSocketMessage<T = any> {
  /** Message type */
  type: WebSocketMessageType;
  /** Message payload */
  payload: T;
  /** Message timestamp */
  timestamp: string;
  /** Message ID */
  id?: string;
  /** User ID (if authenticated) */
  userId?: string;
}

/**
 * WebSocket event handlers
 */
export interface WebSocketEventHandlers {
  /** Connection opened */
  onOpen?: () => void;
  /** Connection closed */
  onClose?: (code: number, reason: string) => void;
  /** Error occurred */
  onError?: (error: Event) => void;
  /** Message received */
  onMessage?: (message: WebSocketMessage) => void;
  /** Connection reconnected */
  onReconnect?: () => void;
}

/**
 * WebSocket client configuration
 */
export interface WebSocketConfig {
  /** WebSocket URL */
  url: string;
  /** Connection protocols */
  protocols?: string[];
  /** Auto-reconnect configuration */
  reconnect?: {
    enabled: boolean;
    attempts: number;
    delay: number;
    maxDelay: number;
  };
  /** Heartbeat configuration */
  heartbeat?: {
    enabled: boolean;
    interval: number;
    message: string;
  };
  /** Event handlers */
  handlers?: WebSocketEventHandlers;
}