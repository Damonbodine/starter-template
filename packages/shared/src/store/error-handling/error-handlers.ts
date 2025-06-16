/**
 * Error Handlers
 * Centralized error handling utilities
 */

import { toast } from '../zustand/ui-store';
import { errorTracker } from '../zustand/app-store';

/**
 * Error types
 */
export interface AppError extends Error {
  code?: string;
  status?: number;
  context?: Record<string, any>;
  retryable?: boolean;
  userMessage?: string;
}

/**
 * Error categories
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Categorize error based on status code and message
 */
export function categorizeError(error: any): ErrorCategory {
  if (!error) return ErrorCategory.UNKNOWN;

  const status = error.status || error.response?.status;
  const message = error.message?.toLowerCase() || '';

  // Network errors
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    !status
  ) {
    return ErrorCategory.NETWORK;
  }

  // Status code based categorization
  switch (status) {
    case 401:
      return ErrorCategory.AUTHENTICATION;
    case 403:
      return ErrorCategory.AUTHORIZATION;
    case 404:
      return ErrorCategory.NOT_FOUND;
    case 422:
    case 400:
      return ErrorCategory.VALIDATION;
    default:
      if (status >= 500) return ErrorCategory.SERVER;
      if (status >= 400) return ErrorCategory.CLIENT;
      return ErrorCategory.UNKNOWN;
  }
}

/**
 * Determine error severity
 */
export function getErrorSeverity(error: any): ErrorSeverity {
  const category = categorizeError(error);
  const status = error.status || error.response?.status;

  switch (category) {
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
      return ErrorSeverity.HIGH;
    case ErrorCategory.SERVER:
      return status >= 500 ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH;
    case ErrorCategory.NETWORK:
      return ErrorSeverity.MEDIUM;
    case ErrorCategory.VALIDATION:
    case ErrorCategory.NOT_FOUND:
      return ErrorSeverity.LOW;
    default:
      return ErrorSeverity.MEDIUM;
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const category = categorizeError(error);
  const status = error.status || error.response?.status;

  // Network errors are usually retryable
  if (category === ErrorCategory.NETWORK) return true;

  // Server errors (5xx) are retryable
  if (status >= 500) return true;

  // Rate limiting (429) is retryable
  if (status === 429) return true;

  // Timeout errors are retryable
  if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) return true;

  return false;
}

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: any): string {
  if (error.userMessage) return error.userMessage;

  const category = categorizeError(error);
  const status = error.status || error.response?.status;

  switch (category) {
    case ErrorCategory.NETWORK:
      return 'Connection error. Please check your internet connection and try again.';
    case ErrorCategory.AUTHENTICATION:
      return 'Your session has expired. Please sign in again.';
    case ErrorCategory.AUTHORIZATION:
      return 'You don\'t have permission to perform this action.';
    case ErrorCategory.NOT_FOUND:
      return 'The requested resource was not found.';
    case ErrorCategory.VALIDATION:
      return error.message || 'Please check your input and try again.';
    case ErrorCategory.SERVER:
      return status >= 500 
        ? 'Server error. Please try again later.'
        : 'Something went wrong. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Global error handler
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private handlers: Map<ErrorCategory, (error: any) => void> = new Map();

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Register category-specific error handler
   */
  registerHandler(category: ErrorCategory, handler: (error: any) => void): void {
    this.handlers.set(category, handler);
  }

  /**
   * Handle error with appropriate strategy
   */
  handle(error: any, context?: Record<string, any>): void {
    const category = categorizeError(error);
    const severity = getErrorSeverity(error);
    const userMessage = getUserErrorMessage(error);

    // Track error
    errorTracker.captureError(error, { category, severity, ...context });

    // Show user notification based on severity
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        toast.error('Critical Error', userMessage, 0); // Persistent
        break;
      case ErrorSeverity.HIGH:
        toast.error('Error', userMessage, 10000); // 10 seconds
        break;
      case ErrorSeverity.MEDIUM:
        toast.warning('Warning', userMessage, 5000); // 5 seconds
        break;
      case ErrorSeverity.LOW:
        toast.info('Notice', userMessage, 3000); // 3 seconds
        break;
    }

    // Call category-specific handler
    const categoryHandler = this.handlers.get(category);
    if (categoryHandler) {
      try {
        categoryHandler(error);
      } catch (handlerError) {
        console.error('Error in category handler:', handlerError);
      }
    }

    // Default handlers for specific categories
    this.handleDefaultBehavior(category, error);
  }

  /**
   * Default behavior for specific error categories
   */
  private handleDefaultBehavior(category: ErrorCategory, error: any): void {
    switch (category) {
      case ErrorCategory.AUTHENTICATION:
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        break;
      case ErrorCategory.AUTHORIZATION:
        // Redirect to unauthorized page
        if (typeof window !== 'undefined') {
          window.location.href = '/unauthorized';
        }
        break;
      case ErrorCategory.NETWORK:
        // Could trigger offline mode or retry logic
        break;
    }
  }
}

/**
 * Hook for error handling
 */
export const useErrorHandler = () => {
  const errorHandler = ErrorHandler.getInstance();

  const handleError = (error: any, context?: Record<string, any>) => {
    errorHandler.handle(error, context);
  };

  const registerHandler = (category: ErrorCategory, handler: (error: any) => void) => {
    errorHandler.registerHandler(category, handler);
  };

  return {
    handleError,
    registerHandler,
    categorizeError,
    getErrorSeverity,
    isRetryableError,
    getUserErrorMessage,
  };
};

/**
 * Query error handler
 */
export const createQueryErrorHandler = () => {
  const { handleError } = useErrorHandler();

  return {
    onError: (error: any, context?: Record<string, any>) => {
      handleError(error, { source: 'query', ...context });
    },
  };
};

/**
 * Mutation error handler
 */
export const createMutationErrorHandler = () => {
  const { handleError } = useErrorHandler();

  return {
    onError: (error: any, variables: any, context?: any) => {
      handleError(error, { 
        source: 'mutation', 
        variables, 
        mutationContext: context 
      });
    },
  };
};

/**
 * Setup default error handlers
 */
export const setupDefaultErrorHandlers = () => {
  const errorHandler = ErrorHandler.getInstance();

  // Authentication error handler
  errorHandler.registerHandler(ErrorCategory.AUTHENTICATION, (error) => {
    // Clear any stored authentication data
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_user_id');
      localStorage.removeItem('auth_last_seen');
    }
  });

  // Network error handler
  errorHandler.registerHandler(ErrorCategory.NETWORK, (error) => {
    // Could implement retry logic or offline caching
    console.log('Network error detected:', error);
  });

  // Server error handler
  errorHandler.registerHandler(ErrorCategory.SERVER, (error) => {
    // Could implement automatic error reporting
    console.error('Server error:', error);
  });
};

/**
 * Error boundary fallback component props
 */
export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  retry?: () => void;
}

/**
 * Common error boundary actions
 */
export const errorBoundaryActions = {
  reload: () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  },
  
  goHome: () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },
  
  goBack: () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  },
  
  reportError: (error: Error, context?: Record<string, any>) => {
    errorTracker.captureError(error, { source: 'error_boundary', ...context });
  },
};