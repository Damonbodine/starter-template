/**
 * Main types export file
 * Re-exports all types and interfaces from the shared types package
 */

// Common types
export * from './common';

// User-related types
export * from './user';

// Content-related types
export * from './content';

// API-related types
export * from './api';

// Platform-specific types
export * from './platform';

// Type utility exports for convenience
export type {
  // Common utilities
  ApiResponse,
  ErrorResponse,
  PaginatedResponse,
  AsyncState,
  LoadingState,
  PlatformInfo,
  BaseEntity,
  AuditableEntity,
  
  // User types
  UserProfile,
  UserCredentials,
  UserRegistration,
  AuthState,
  UserPermissions,
  UserPreferences,
  UserRole,
  UserStatus,
  
  // Content types
  Post,
  Article,
  VideoContent,
  Comment,
  Category,
  Tag,
  MediaFile,
  ContentStatus,
  ContentVisibility,
  ContentType,
  
  // API types
  ApiRequestConfig,
  ApiClient,
  HttpMethod,
  HttpStatusCode,
  ValidationErrorResponse,
  AuthErrorResponse,
  BulkRequest,
  BulkResponse,
  
  // Platform types
  PlatformType,
  DeviceType,
  NavigationType,
  StorageType,
  PermissionType,
  PermissionStatus,
  PlatformCapabilities,
  PlatformConfig,
  CrossPlatformComponentProps,
} from './common';

export type {
  // Re-export specific user types for direct access
  JWTPayload,
  NotificationSettings,
  UserActivity,
  UserSession,
  PasswordResetRequest,
  PasswordChangeRequest,
  UserSearchFilters,
  UserStatistics,
} from './user';

export type {
  // Re-export specific content types for direct access
  Reaction,
  ReactionType,
  Bookmark,
  ContentReport,
  ContentRevision,
  ContentSearchFilters,
  ContentStatistics,
  FeedItem,
  MediaType,
} from './content';

export type {
  // Re-export specific API types for direct access
  ApiEndpoints,
  ApiClientConfig,
  WebSocketMessage,
  WebSocketMessageType,
  WebSocketConfig,
  FileUploadRequest,
  FileUploadResponse,
  ListRequestParams,
  CreateRequest,
  UpdateRequest,
} from './api';

export type {
  // Re-export specific platform types for direct access
  NavigationConfig,
  StorageConfig,
  PermissionResult,
  PlatformUIComponents,
  PlatformStyling,
  PlatformHooks,
  PlatformApiEndpoints,
  PlatformErrorHandling,
  PlatformDevTools,
} from './platform';