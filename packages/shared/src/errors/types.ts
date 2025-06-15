/**
 * Error severity levels for categorization and handling
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  EXTERNAL_SERVICE = 'external_service',
  DATABASE = 'database',
  UNKNOWN = 'unknown'
}

/**
 * Base error metadata interface
 */
export interface ErrorMetadata {
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  platform?: 'web' | 'ios' | 'android';
  version?: string;
  environment?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * Error context for additional debugging information
 */
export interface ErrorContext {
  operation?: string;
  input?: unknown;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
}

/**
 * Base custom error class
 */
export abstract class BaseError extends Error {
  public readonly id: string;
  public readonly timestamp: Date;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly metadata?: ErrorMetadata;
  public readonly context?: ErrorContext;
  public readonly originalError?: Error;

  constructor(
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    originalError?: Error,
    metadata?: Partial<ErrorMetadata>,
    context?: ErrorContext
  ) {
    super(message);
    this.name = this.constructor.name;
    this.id = this.generateErrorId();
    this.timestamp = new Date();
    this.category = category;
    this.severity = severity;
    this.originalError = originalError;
    this.metadata = metadata ? { ...metadata, timestamp: this.timestamp } : { timestamp: this.timestamp };
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  private generateErrorId(): string {
    return `${this.constructor.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      message: this.message,
      category: this.category,
      severity: this.severity,
      timestamp: this.timestamp,
      metadata: this.metadata,
      context: this.context,
      stack: this.stack,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack
      } : undefined
    };
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends BaseError {
  public readonly statusCode?: number;
  public readonly endpoint?: string;

  constructor(
    message: string,
    statusCode?: number,
    endpoint?: string,
    originalError?: Error,
    metadata?: Partial<ErrorMetadata>,
    context?: ErrorContext
  ) {
    super(message, ErrorCategory.NETWORK, ErrorSeverity.HIGH, originalError, metadata, context);
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}

/**
 * Validation errors
 */
export class ValidationError extends BaseError {
  public readonly validationErrors: ValidationErrorDetail[];

  constructor(
    message: string,
    validationErrors: ValidationErrorDetail[],
    metadata?: Partial<ErrorMetadata>,
    context?: ErrorContext
  ) {
    super(message, ErrorCategory.VALIDATION, ErrorSeverity.LOW, undefined, metadata, context);
    this.validationErrors = validationErrors;
  }
}

export interface ValidationErrorDetail {
  field: string;
  value?: unknown;
  message: string;
  code?: string;
}

/**
 * Authentication errors
 */
export class AuthenticationError extends BaseError {
  public readonly code?: string;

  constructor(
    message: string,
    code?: string,
    metadata?: Partial<ErrorMetadata>,
    context?: ErrorContext
  ) {
    super(message, ErrorCategory.AUTHENTICATION, ErrorSeverity.HIGH, undefined, metadata, context);
    this.code = code;
  }
}

/**
 * Authorization errors
 */
export class AuthorizationError extends BaseError {
  public readonly resource?: string;
  public readonly action?: string;

  constructor(
    message: string,
    resource?: string,
    action?: string,
    metadata?: Partial<ErrorMetadata>,
    context?: ErrorContext
  ) {
    super(message, ErrorCategory.AUTHORIZATION, ErrorSeverity.HIGH, undefined, metadata, context);
    this.resource = resource;
    this.action = action;
  }
}

/**
 * Business logic errors
 */
export class BusinessLogicError extends BaseError {
  public readonly code: string;

  constructor(
    message: string,
    code: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    metadata?: Partial<ErrorMetadata>,
    context?: ErrorContext
  ) {
    super(message, ErrorCategory.BUSINESS_LOGIC, severity, undefined, metadata, context);
    this.code = code;
  }
}

/**
 * System errors
 */
export class SystemError extends BaseError {
  constructor(
    message: string,
    originalError?: Error,
    metadata?: Partial<ErrorMetadata>,
    context?: ErrorContext
  ) {
    super(message, ErrorCategory.SYSTEM, ErrorSeverity.CRITICAL, originalError, metadata, context);
  }
}

/**
 * External service errors
 */
export class ExternalServiceError extends BaseError {
  public readonly service: string;
  public readonly statusCode?: number;

  constructor(
    message: string,
    service: string,
    statusCode?: number,
    originalError?: Error,
    metadata?: Partial<ErrorMetadata>,
    context?: ErrorContext
  ) {
    super(message, ErrorCategory.EXTERNAL_SERVICE, ErrorSeverity.HIGH, originalError, metadata, context);
    this.service = service;
    this.statusCode = statusCode;
  }
}

/**
 * Database errors
 */
export class DatabaseError extends BaseError {
  public readonly query?: string;
  public readonly code?: string;

  constructor(
    message: string,
    query?: string,
    code?: string,
    originalError?: Error,
    metadata?: Partial<ErrorMetadata>,
    context?: ErrorContext
  ) {
    super(message, ErrorCategory.DATABASE, ErrorSeverity.CRITICAL, originalError, metadata, context);
    this.query = query;
    this.code = code;
  }
}

/**
 * Error reporting interface
 */
export interface ErrorReporter {
  report(error: BaseError): Promise<void>;
  reportBatch(errors: BaseError[]): Promise<void>;
}

/**
 * Error handler interface
 */
export interface ErrorHandler {
  handle(error: Error | BaseError): void | Promise<void>;
  canHandle(error: Error | BaseError): boolean;
}

/**
 * Error recovery strategy interface
 */
export interface ErrorRecoveryStrategy {
  canRecover(error: BaseError): boolean;
  recover(error: BaseError): Promise<void>;
}

/**
 * API error response format
 */
export interface ApiErrorResponse {
  error: {
    id: string;
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
  };
}