/**
 * Error types and interfaces
 */
export {
  // Enums
  ErrorSeverity,
  ErrorCategory,
  
  // Interfaces
  ErrorMetadata,
  ErrorContext,
  ValidationErrorDetail,
  ErrorReporter,
  ErrorHandler,
  ErrorRecoveryStrategy,
  ApiErrorResponse,
  
  // Base error class
  BaseError,
  
  // Specific error classes
  NetworkError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  BusinessLogicError,
  SystemError,
  ExternalServiceError,
  DatabaseError
} from './types';

/**
 * Error logging
 */
export {
  // Enums
  LogLevel,
  
  // Interfaces
  LogEntry,
  LoggerConfig,
  LogFormatter,
  LogFilter,
  RemoteLogTransport,
  
  // Classes
  ConsoleFormatter,
  JSONFormatter,
  ErrorLogger,
  ErrorFormatter
} from './logger';

/**
 * Error handlers
 */
export {
  GlobalErrorHandler,
  ApiErrorHandler,
  ValidationErrorHandler,
  NetworkErrorHandler,
  ErrorHandlerFactory
} from './handlers';

/**
 * Error recovery
 */
export {
  // Interfaces
  RetryConfig,
  CircuitBreakerConfig,
  
  // Enums
  CircuitState,
  
  // Classes
  RetryMechanism,
  FallbackStrategy,
  CircuitBreaker,
  CompositeRecoveryStrategy,
  RecoveryStrategyFactory
} from './recovery';

/**
 * Quick initialization helpers
 */
import { ErrorLogger, LogLevel } from './logger';
import { ErrorHandlerFactory } from './handlers';
import { RecoveryStrategyFactory } from './recovery';

/**
 * Initialize error handling with default configuration
 */
export function initializeErrorHandling(config?: {
  logLevel?: LogLevel;
  enableConsoleLogging?: boolean;
  enableRemoteLogging?: boolean;
  remoteEndpoint?: string;
  remoteApiKey?: string;
}): {
  logger: ErrorLogger;
  handlers: typeof ErrorHandlerFactory;
  recovery: typeof RecoveryStrategyFactory;
} {
  // Initialize logger
  const logger = ErrorLogger.getInstance({
    minLevel: config?.logLevel || LogLevel.INFO,
    enableConsole: config?.enableConsoleLogging ?? true,
    enableRemote: config?.enableRemoteLogging ?? false,
    remoteEndpoint: config?.remoteEndpoint,
    remoteApiKey: config?.remoteApiKey
  });

  // Create default handlers
  ErrorHandlerFactory.createDefaultHandlers(logger);

  return {
    logger,
    handlers: ErrorHandlerFactory,
    recovery: RecoveryStrategyFactory
  };
}

/**
 * Utility function to safely execute async operations with error handling
 */
export async function safeExecute<T>(
  operation: () => Promise<T>,
  options?: {
    fallback?: T | (() => T | Promise<T>);
    retry?: boolean;
    maxRetries?: number;
    onError?: (error: Error) => void;
  }
): Promise<T> {
  try {
    if (options?.retry) {
      const retryStrategy = RecoveryStrategyFactory.createRetryStrategy({
        maxAttempts: options.maxRetries || 3
      });
      return await retryStrategy.executeWithRetry(operation);
    }
    
    return await operation();
  } catch (error) {
    const logger = ErrorLogger.getInstance();
    logger.error('Operation failed', error as Error);
    
    if (options?.onError) {
      options.onError(error as Error);
    }
    
    if (options?.fallback !== undefined) {
      if (typeof options.fallback === 'function') {
        return await options.fallback();
      }
      return options.fallback;
    }
    
    throw error;
  }
}

/**
 * Type guard to check if an error is a BaseError
 */
export function isBaseError(error: unknown): error is BaseError {
  return error instanceof BaseError;
}

/**
 * Type guard to check if an error is a specific type of BaseError
 */
export function isErrorType<T extends BaseError>(
  error: unknown,
  ErrorClass: new (...args: any[]) => T
): error is T {
  return error instanceof ErrorClass;
}