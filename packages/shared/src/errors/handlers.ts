import {
  BaseError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  BusinessLogicError,
  SystemError,
  ExternalServiceError,
  DatabaseError,
  ErrorCategory,
  ErrorSeverity,
  ErrorHandler,
  ApiErrorResponse,
  ErrorContext,
  ErrorMetadata
} from './types';
import { ErrorLogger } from './logger';

/**
 * Global error handler for uncaught errors
 */
export class GlobalErrorHandler implements ErrorHandler {
  private logger: ErrorLogger;
  private fallbackHandlers: ErrorHandler[] = [];

  constructor(logger?: ErrorLogger) {
    this.logger = logger || ErrorLogger.getInstance();
    this.setupGlobalHandlers();
  }

  public handle(error: Error | BaseError): void {
    // Log the error
    this.logger.logError(error);

    // Convert to BaseError if needed
    const baseError = this.normalizeError(error);

    // Try fallback handlers
    for (const handler of this.fallbackHandlers) {
      if (handler.canHandle(baseError)) {
        handler.handle(baseError);
        return;
      }
    }

    // Default handling based on severity
    this.handleBySeverity(baseError);
  }

  public canHandle(error: Error | BaseError): boolean {
    return true; // Global handler can handle any error
  }

  public addFallbackHandler(handler: ErrorHandler): void {
    this.fallbackHandlers.push(handler);
  }

  private setupGlobalHandlers(): void {
    if (typeof window !== 'undefined') {
      // Browser environment
      window.addEventListener('error', (event) => {
        this.handle(new SystemError(
          event.message,
          event.error,
          this.getMetadata(),
          {
            ...this.getContext(),
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        ));
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.handle(new SystemError(
          'Unhandled Promise Rejection',
          new Error(String(event.reason)),
          this.getMetadata(),
          this.getContext()
        ));
      });
    } else if (typeof process !== 'undefined') {
      // Node.js environment
      process.on('uncaughtException', (error) => {
        this.handle(new SystemError(
          'Uncaught Exception',
          error,
          this.getMetadata(),
          this.getContext()
        ));
        // Exit process after logging
        process.exit(1);
      });

      process.on('unhandledRejection', (reason, promise) => {
        this.handle(new SystemError(
          'Unhandled Promise Rejection',
          new Error(String(reason)),
          this.getMetadata(),
          this.getContext()
        ));
      });
    }
  }

  private normalizeError(error: Error | BaseError): BaseError {
    if (error instanceof BaseError) {
      return error;
    }

    // Try to categorize the error
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return new NetworkError(error.message, undefined, undefined, error);
    } else if (message.includes('validation') || message.includes('invalid')) {
      return new ValidationError(error.message, []);
    } else if (message.includes('unauthorized') || message.includes('401')) {
      return new AuthenticationError(error.message);
    } else if (message.includes('forbidden') || message.includes('403')) {
      return new AuthorizationError(error.message);
    } else {
      return new SystemError(error.message, error);
    }
  }

  private handleBySeverity(error: BaseError): void {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        // Just log, no user notification needed
        break;
      case ErrorSeverity.MEDIUM:
        // Notify user with a warning
        this.notifyUser(error, 'warning');
        break;
      case ErrorSeverity.HIGH:
        // Notify user with an error
        this.notifyUser(error, 'error');
        break;
      case ErrorSeverity.CRITICAL:
        // Notify user and potentially restart/reload
        this.notifyUser(error, 'critical');
        this.handleCriticalError(error);
        break;
    }
  }

  private notifyUser(error: BaseError, level: 'warning' | 'error' | 'critical'): void {
    // Platform-specific notification
    if (typeof window !== 'undefined') {
      // Browser notification (you might want to use a toast library)
      console.error(`[${level.toUpperCase()}] ${error.message}`);
    } else {
      // Server-side notification
      console.error(`[${level.toUpperCase()}] ${error.message}`);
    }
  }

  private handleCriticalError(error: BaseError): void {
    // Platform-specific critical error handling
    if (typeof window !== 'undefined') {
      // Optionally reload the page after a delay
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    }
  }

  private getMetadata(): ErrorMetadata {
    return {
      timestamp: new Date(),
      platform: this.getPlatform()
    };
  }

  private getContext(): ErrorContext {
    if (typeof window !== 'undefined') {
      return {
        userAgent: window.navigator.userAgent,
        url: window.location.href
      };
    }
    
    return {};
  }

  private getPlatform(): 'web' | 'ios' | 'android' | undefined {
    if (typeof window !== 'undefined') {
      return 'web';
    }
    // Add React Native detection here
    return undefined;
  }
}

/**
 * API error handler for HTTP responses
 */
export class ApiErrorHandler implements ErrorHandler {
  private logger: ErrorLogger;

  constructor(logger?: ErrorLogger) {
    this.logger = logger || ErrorLogger.getInstance();
  }

  public async handle(error: Error | BaseError): Promise<void> {
    this.logger.logError(error);

    if (error instanceof NetworkError) {
      await this.handleNetworkError(error);
    } else if (error instanceof ValidationError) {
      await this.handleValidationError(error);
    } else if (error instanceof AuthenticationError) {
      await this.handleAuthenticationError(error);
    } else if (error instanceof AuthorizationError) {
      await this.handleAuthorizationError(error);
    } else {
      await this.handleGenericError(error);
    }
  }

  public canHandle(error: Error | BaseError): boolean {
    return error instanceof NetworkError ||
           error instanceof ValidationError ||
           error instanceof AuthenticationError ||
           error instanceof AuthorizationError;
  }

  public async handleResponse(response: Response): Promise<Response> {
    if (!response.ok) {
      const error = await this.createErrorFromResponse(response);
      await this.handle(error);
      throw error;
    }
    
    return response;
  }

  private async createErrorFromResponse(response: Response): Promise<BaseError> {
    let errorData: ApiErrorResponse | null = null;
    
    try {
      errorData = await response.json() as ApiErrorResponse;
    } catch {
      // Response might not be JSON
    }

    const message = errorData?.error?.message || response.statusText;
    const context: ErrorContext = {
      url: response.url,
      method: 'Unknown', // Would need to be passed in
      headers: Object.fromEntries(response.headers.entries())
    };

    switch (response.status) {
      case 400:
        return new ValidationError(message, [], undefined, context);
      case 401:
        return new AuthenticationError(message, errorData?.error?.code, undefined, context);
      case 403:
        return new AuthorizationError(message, undefined, undefined, undefined, context);
      case 404:
        return new NetworkError(message, 404, response.url, undefined, undefined, context);
      case 500:
      case 502:
      case 503:
      case 504:
        return new SystemError(message, undefined, undefined, context);
      default:
        return new NetworkError(message, response.status, response.url, undefined, undefined, context);
    }
  }

  private async handleNetworkError(error: NetworkError): Promise<void> {
    // Implement network-specific error handling
    if (error.statusCode === 404) {
      // Resource not found
    } else if (error.statusCode && error.statusCode >= 500) {
      // Server error - might want to retry
    }
  }

  private async handleValidationError(error: ValidationError): Promise<void> {
    // Validation errors are usually shown to the user
    // You might want to highlight form fields, etc.
  }

  private async handleAuthenticationError(error: AuthenticationError): Promise<void> {
    // Redirect to login or refresh token
    if (typeof window !== 'undefined') {
      // Browser - redirect to login
      window.location.href = '/login';
    }
  }

  private async handleAuthorizationError(error: AuthorizationError): Promise<void> {
    // Show unauthorized message
  }

  private async handleGenericError(error: Error | BaseError): Promise<void> {
    // Generic error handling
  }
}

/**
 * Validation error handler
 */
export class ValidationErrorHandler implements ErrorHandler {
  private logger: ErrorLogger;

  constructor(logger?: ErrorLogger) {
    this.logger = logger || ErrorLogger.getInstance();
  }

  public handle(error: Error | BaseError): void {
    if (!(error instanceof ValidationError)) {
      throw new Error('ValidationErrorHandler can only handle ValidationError instances');
    }

    this.logger.logError(error);

    // Group validation errors by field
    const errorsByField = this.groupErrorsByField(error.validationErrors);

    // Platform-specific handling
    if (typeof window !== 'undefined') {
      this.handleWebValidation(errorsByField);
    } else {
      this.handleServerValidation(errorsByField);
    }
  }

  public canHandle(error: Error | BaseError): boolean {
    return error instanceof ValidationError;
  }

  private groupErrorsByField(errors: ValidationError['validationErrors']): Map<string, string[]> {
    const grouped = new Map<string, string[]>();
    
    for (const error of errors) {
      if (!grouped.has(error.field)) {
        grouped.set(error.field, []);
      }
      grouped.get(error.field)!.push(error.message);
    }
    
    return grouped;
  }

  private handleWebValidation(errorsByField: Map<string, string[]>): void {
    // In a real app, you'd integrate with your form library
    errorsByField.forEach((messages, field) => {
      console.error(`Validation error for field ${field}:`, messages);
    });
  }

  private handleServerValidation(errorsByField: Map<string, string[]>): void {
    // Server-side validation handling
    const allErrors = Array.from(errorsByField.entries()).map(([field, messages]) => ({
      field,
      messages
    }));
    
    console.error('Validation errors:', allErrors);
  }
}

/**
 * Network error handler with retry logic
 */
export class NetworkErrorHandler implements ErrorHandler {
  private logger: ErrorLogger;
  private maxRetries: number;
  private retryDelay: number;

  constructor(
    maxRetries: number = 3,
    retryDelay: number = 1000,
    logger?: ErrorLogger
  ) {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.logger = logger || ErrorLogger.getInstance();
  }

  public async handle(error: Error | BaseError): Promise<void> {
    if (!(error instanceof NetworkError)) {
      throw new Error('NetworkErrorHandler can only handle NetworkError instances');
    }

    this.logger.logError(error);

    // Check if we should retry
    if (this.shouldRetry(error)) {
      // Retry logic would be implemented in the recovery module
      console.log(`Network error: ${error.message}. Consider retrying.`);
    } else {
      // Handle permanent failure
      this.handlePermanentFailure(error);
    }
  }

  public canHandle(error: Error | BaseError): boolean {
    return error instanceof NetworkError;
  }

  private shouldRetry(error: NetworkError): boolean {
    // Don't retry client errors (4xx)
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      return false;
    }
    
    // Retry server errors (5xx) and network failures
    return true;
  }

  private handlePermanentFailure(error: NetworkError): void {
    // Notify user of permanent failure
    if (typeof window !== 'undefined') {
      // Show offline message or error notification
      console.error('Network request failed permanently:', error.message);
    }
  }
}

/**
 * Cross-platform error handler factory
 */
export class ErrorHandlerFactory {
  private static handlers: Map<string, ErrorHandler> = new Map();

  static registerHandler(name: string, handler: ErrorHandler): void {
    this.handlers.set(name, handler);
  }

  static getHandler(name: string): ErrorHandler | undefined {
    return this.handlers.get(name);
  }

  static createDefaultHandlers(logger?: ErrorLogger): void {
    const globalHandler = new GlobalErrorHandler(logger);
    const apiHandler = new ApiErrorHandler(logger);
    const validationHandler = new ValidationErrorHandler(logger);
    const networkHandler = new NetworkErrorHandler(3, 1000, logger);

    this.registerHandler('global', globalHandler);
    this.registerHandler('api', apiHandler);
    this.registerHandler('validation', validationHandler);
    this.registerHandler('network', networkHandler);

    // Set up handler chain
    globalHandler.addFallbackHandler(apiHandler);
    globalHandler.addFallbackHandler(validationHandler);
    globalHandler.addFallbackHandler(networkHandler);
  }
}