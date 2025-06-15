/**
 * Common types and interfaces used across the application
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  /** The response data */
  data: T;
  /** Success status */
  success: boolean;
  /** Human-readable message */
  message?: string;
  /** Additional metadata */
  meta?: Record<string, any>;
  /** Timestamp of the response */
  timestamp: string;
}

/**
 * Generic error response structure
 */
export interface ErrorResponse {
  /** Error success status (always false) */
  success: false;
  /** Error message */
  message: string;
  /** Detailed error information */
  error?: {
    /** Error code */
    code: string;
    /** Error details */
    details?: Record<string, any>;
    /** Stack trace (development only) */
    stack?: string;
  };
  /** Timestamp of the error */
  timestamp: string;
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total count of items (optional for requests) */
  total?: number;
}

/**
 * Pagination metadata in API responses
 */
export interface PaginationMeta extends PaginationParams {
  /** Total count of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there's a next page */
  hasNext: boolean;
  /** Whether there's a previous page */
  hasPrev: boolean;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  /** Pagination metadata */
  pagination: PaginationMeta;
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort parameters
 */
export interface SortParams {
  /** Field to sort by */
  field: string;
  /** Sort direction */
  direction: SortDirection;
}

/**
 * Filter operator types
 */
export type FilterOperator = 
  | 'eq'      // equals
  | 'ne'      // not equals
  | 'gt'      // greater than
  | 'gte'     // greater than or equal
  | 'lt'      // less than
  | 'lte'     // less than or equal
  | 'in'      // in array
  | 'nin'     // not in array
  | 'like'    // contains (case-insensitive)
  | 'regex';  // regular expression

/**
 * Filter condition
 */
export interface FilterCondition {
  /** Field to filter */
  field: string;
  /** Filter operator */
  operator: FilterOperator;
  /** Filter value */
  value: any;
}

/**
 * Filter parameters
 */
export interface FilterParams {
  /** Filter conditions */
  conditions: FilterCondition[];
  /** Logic operator between conditions */
  logic?: 'and' | 'or';
}

/**
 * Query parameters combining pagination, sorting, and filtering
 */
export interface QueryParams {
  /** Pagination parameters */
  pagination?: Partial<PaginationParams>;
  /** Sort parameters */
  sort?: SortParams[];
  /** Filter parameters */
  filter?: FilterParams;
  /** Search query */
  search?: string;
  /** Additional query parameters */
  [key: string]: any;
}

/**
 * Loading states for async operations
 */
export type LoadingState = 
  | 'idle'      // Not started
  | 'loading'   // In progress
  | 'success'   // Completed successfully
  | 'error';    // Failed with error

/**
 * Async operation state
 */
export interface AsyncState<T = any, E = Error> {
  /** Current loading state */
  status: LoadingState;
  /** Data when successful */
  data?: T;
  /** Error when failed */
  error?: E;
  /** Last updated timestamp */
  lastUpdated?: string;
}

/**
 * Platform detection types
 */
export type PlatformType = 'web' | 'ios' | 'android' | 'desktop';

/**
 * Device type detection
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Platform information
 */
export interface PlatformInfo {
  /** Platform type */
  type: PlatformType;
  /** Device type */
  device: DeviceType;
  /** Operating system */
  os: string;
  /** OS version */
  osVersion: string;
  /** Browser name (web only) */
  browser?: string;
  /** Browser version (web only) */
  browserVersion?: string;
  /** User agent string */
  userAgent: string;
  /** Whether device supports touch */
  touchSupported: boolean;
}

/**
 * Generic ID type
 */
export type ID = string | number;

/**
 * Timestamp type (ISO string)
 */
export type Timestamp = string;

/**
 * Base entity interface with common fields
 */
export interface BaseEntity {
  /** Unique identifier */
  id: ID;
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last update timestamp */
  updatedAt: Timestamp;
  /** Soft delete timestamp (optional) */
  deletedAt?: Timestamp;
}

/**
 * Audit fields for tracking changes
 */
export interface AuditFields {
  /** User who created the entity */
  createdBy?: ID;
  /** User who last updated the entity */
  updatedBy?: ID;
  /** User who deleted the entity */
  deletedBy?: ID;
}

/**
 * Complete base entity with audit fields
 */
export interface AuditableEntity extends BaseEntity, AuditFields {}

/**
 * Generic key-value pairs
 */
export interface KeyValuePair<K = string, V = any> {
  key: K;
  value: V;
}

/**
 * Option type for select/dropdown components
 */
export interface Option<T = any> {
  /** Display label */
  label: string;
  /** Option value */
  value: T;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Additional data */
  data?: Record<string, any>;
}

/**
 * Generic callback function types
 */
export type Callback<T = void> = (value: T) => void;
export type AsyncCallback<T = void> = (value: T) => Promise<void>;

/**
 * Generic event handler types
 */
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

/**
 * Utility type to make all properties optional
 */
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Utility type to make all properties required
 */
export type Required<T> = {
  [P in keyof T]-?: T[P];
};

/**
 * Utility type to pick specific properties
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Utility type to omit specific properties
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;