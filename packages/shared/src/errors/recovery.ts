import {
  BaseError,
  NetworkError,
  ExternalServiceError,
  DatabaseError,
  ErrorRecoveryStrategy,
  ErrorSeverity
} from './types';
import { ErrorLogger } from './logger';

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: Array<new (...args: any[]) => BaseError>;
  retryableStatusCodes?: number[];
  onRetry?: (error: BaseError, attempt: number) => void | Promise<void>;
}

/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
  halfOpenMaxAttempts: number;
  onStateChange?: (oldState: CircuitState, newState: CircuitState) => void;
}

/**
 * Retry mechanism with exponential backoff
 */
export class RetryMechanism implements ErrorRecoveryStrategy {
  private config: RetryConfig;
  private logger: ErrorLogger;

  constructor(config: Partial<RetryConfig> = {}, logger?: ErrorLogger) {
    this.config = {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      retryableErrors: [NetworkError, ExternalServiceError, DatabaseError],
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      ...config
    };
    this.logger = logger || ErrorLogger.getInstance();
  }

  public canRecover(error: BaseError): boolean {
    // Check if error type is retryable
    const isRetryableType = this.config.retryableErrors?.some(
      ErrorClass => error instanceof ErrorClass
    ) ?? false;

    // Check if status code is retryable (for network errors)
    if (error instanceof NetworkError && error.statusCode) {
      const isRetryableStatus = this.config.retryableStatusCodes?.includes(
        error.statusCode
      ) ?? false;
      return isRetryableType || isRetryableStatus;
    }

    return isRetryableType;
  }

  public async recover(error: BaseError): Promise<void> {
    throw new Error('Use executeWithRetry method instead');
  }

  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    let lastError: BaseError | undefined;
    
    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        this.logger.debug(`Attempting operation (${attempt}/${this.config.maxAttempts})`, {
          context,
          attempt
        });
        
        return await operation();
      } catch (error) {
        lastError = this.normalizeError(error as Error);
        
        if (!this.canRecover(lastError) || attempt === this.config.maxAttempts) {
          this.logger.error(`Operation failed after ${attempt} attempts`, lastError, {
            context,
            attempt,
            maxAttempts: this.config.maxAttempts
          });
          throw lastError;
        }

        const delay = this.calculateDelay(attempt);
        
        this.logger.warn(`Operation failed, retrying in ${delay}ms`, lastError, {
          context,
          attempt,
          nextDelay: delay
        });

        if (this.config.onRetry) {
          await this.config.onRetry(lastError, attempt);
        }

        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  private calculateDelay(attempt: number): number {
    const exponentialDelay = this.config.initialDelay * 
      Math.pow(this.config.backoffMultiplier, attempt - 1);
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.3 * exponentialDelay;
    
    return Math.min(
      exponentialDelay + jitter,
      this.config.maxDelay
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private normalizeError(error: Error): BaseError {
    if (error instanceof BaseError) {
      return error;
    }
    
    // Try to determine error type from the original error
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return new NetworkError(error.message, undefined, undefined, error);
    }
    
    return new ExternalServiceError(error.message, 'unknown', undefined, error);
  }
}

/**
 * Fallback strategy for graceful degradation
 */
export class FallbackStrategy<T> implements ErrorRecoveryStrategy {
  private fallbacks: Array<() => Promise<T>>;
  private logger: ErrorLogger;

  constructor(fallbacks: Array<() => Promise<T>>, logger?: ErrorLogger) {
    this.fallbacks = fallbacks;
    this.logger = logger || ErrorLogger.getInstance();
  }

  public canRecover(error: BaseError): boolean {
    return this.fallbacks.length > 0;
  }

  public async recover(error: BaseError): Promise<void> {
    throw new Error('Use executeWithFallback method instead');
  }

  public async executeWithFallback(
    primary: () => Promise<T>,
    context?: string
  ): Promise<T> {
    const operations = [primary, ...this.fallbacks];
    let lastError: BaseError | undefined;

    for (let i = 0; i < operations.length; i++) {
      try {
        this.logger.debug(`Attempting operation ${i + 1}/${operations.length}`, {
          context,
          operationIndex: i,
          isPrimary: i === 0
        });
        
        return await operations[i]();
      } catch (error) {
        lastError = this.normalizeError(error as Error);
        
        this.logger.warn(
          `Operation ${i + 1} failed, ${i < operations.length - 1 ? 'trying fallback' : 'no more fallbacks'}`,
          lastError,
          {
            context,
            operationIndex: i,
            remainingFallbacks: operations.length - i - 1
          }
        );

        if (i === operations.length - 1) {
          throw lastError;
        }
      }
    }

    throw lastError!;
  }

  private normalizeError(error: Error): BaseError {
    if (error instanceof BaseError) {
      return error;
    }
    
    return new ExternalServiceError(error.message, 'unknown', undefined, error);
  }
}

/**
 * Circuit breaker pattern implementation
 */
export class CircuitBreaker implements ErrorRecoveryStrategy {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime?: Date;
  private successCount: number = 0;
  private config: CircuitBreakerConfig;
  private logger: ErrorLogger;
  private resetTimer?: NodeJS.Timeout | number;

  constructor(config: Partial<CircuitBreakerConfig> = {}, logger?: ErrorLogger) {
    this.config = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      halfOpenMaxAttempts: 3,
      ...config
    };
    this.logger = logger || ErrorLogger.getInstance();
  }

  public canRecover(error: BaseError): boolean {
    return this.state !== CircuitState.OPEN;
  }

  public async recover(error: BaseError): Promise<void> {
    this.recordFailure(error);
  }

  public async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>,
    context?: string
  ): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        this.logger.warn('Circuit breaker is OPEN, using fallback', undefined, {
          context,
          state: this.state,
          failureCount: this.failureCount
        });
        
        if (fallback) {
          return fallback();
        }
        
        throw new Error('Circuit breaker is OPEN and no fallback provided');
      }
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      const baseError = this.normalizeError(error as Error);
      this.recordFailure(baseError);
      
      if (this.state === CircuitState.OPEN && fallback) {
        return fallback();
      }
      
      throw baseError;
    }
  }

  private recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      if (this.successCount >= this.config.halfOpenMaxAttempts) {
        this.transitionTo(CircuitState.CLOSED);
      }
    }
    
    if (this.state === CircuitState.CLOSED) {
      this.failureCount = 0;
    }
  }

  private recordFailure(error: BaseError): void {
    this.lastFailureTime = new Date();
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN);
      return;
    }
    
    this.failureCount++;
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
    }
    
    this.logger.warn('Circuit breaker recorded failure', error, {
      state: this.state,
      failureCount: this.failureCount,
      threshold: this.config.failureThreshold
    });
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) {
      return true;
    }
    
    const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
    return timeSinceLastFailure >= this.config.resetTimeout;
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    
    this.logger.info(`Circuit breaker state transition: ${oldState} -> ${newState}`, {
      oldState,
      newState,
      failureCount: this.failureCount
    });
    
    if (newState === CircuitState.CLOSED) {
      this.failureCount = 0;
      this.successCount = 0;
    } else if (newState === CircuitState.HALF_OPEN) {
      this.successCount = 0;
    }
    
    if (this.config.onStateChange) {
      this.config.onStateChange(oldState, newState);
    }
    
    // Set up automatic reset timer when entering OPEN state
    if (newState === CircuitState.OPEN) {
      if (this.resetTimer) {
        clearTimeout(this.resetTimer as number);
      }
      
      this.resetTimer = setTimeout(() => {
        if (this.state === CircuitState.OPEN) {
          this.transitionTo(CircuitState.HALF_OPEN);
        }
      }, this.config.resetTimeout);
    }
  }

  private normalizeError(error: Error): BaseError {
    if (error instanceof BaseError) {
      return error;
    }
    
    return new ExternalServiceError(error.message, 'unknown', undefined, error);
  }

  public getState(): CircuitState {
    return this.state;
  }

  public getStats(): {
    state: CircuitState;
    failureCount: number;
    lastFailureTime?: Date;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }

  public reset(): void {
    this.transitionTo(CircuitState.CLOSED);
    
    if (this.resetTimer) {
      clearTimeout(this.resetTimer as number);
      this.resetTimer = undefined;
    }
  }
}

/**
 * Composite recovery strategy that combines multiple strategies
 */
export class CompositeRecoveryStrategy implements ErrorRecoveryStrategy {
  private strategies: ErrorRecoveryStrategy[];
  private logger: ErrorLogger;

  constructor(strategies: ErrorRecoveryStrategy[], logger?: ErrorLogger) {
    this.strategies = strategies;
    this.logger = logger || ErrorLogger.getInstance();
  }

  public canRecover(error: BaseError): boolean {
    return this.strategies.some(strategy => strategy.canRecover(error));
  }

  public async recover(error: BaseError): Promise<void> {
    for (const strategy of this.strategies) {
      if (strategy.canRecover(error)) {
        try {
          await strategy.recover(error);
          return;
        } catch (recoveryError) {
          this.logger.warn(
            'Recovery strategy failed, trying next',
            recoveryError as Error,
            {
              originalError: error.toJSON(),
              strategyName: strategy.constructor.name
            }
          );
        }
      }
    }
    
    throw new Error('All recovery strategies failed');
  }
}

/**
 * Recovery strategy factory
 */
export class RecoveryStrategyFactory {
  static createRetryStrategy(config?: Partial<RetryConfig>): RetryMechanism {
    return new RetryMechanism(config);
  }

  static createFallbackStrategy<T>(
    fallbacks: Array<() => Promise<T>>
  ): FallbackStrategy<T> {
    return new FallbackStrategy(fallbacks);
  }

  static createCircuitBreaker(
    config?: Partial<CircuitBreakerConfig>
  ): CircuitBreaker {
    return new CircuitBreaker(config);
  }

  static createCompositeStrategy(
    strategies: ErrorRecoveryStrategy[]
  ): CompositeRecoveryStrategy {
    return new CompositeRecoveryStrategy(strategies);
  }

  static createDefaultStrategy(): CompositeRecoveryStrategy {
    return new CompositeRecoveryStrategy([
      new RetryMechanism(),
      new CircuitBreaker()
    ]);
  }
}