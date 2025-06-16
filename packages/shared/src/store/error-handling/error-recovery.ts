/**
 * Error Recovery
 * Strategies and utilities for recovering from errors
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { toast } from '../zustand/ui-store';
import { errorTracker } from '../zustand/app-store';
import { isRetryableError } from './error-handlers';

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(
  attemptNumber: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const { baseDelay, maxDelay, backoffMultiplier, jitter } = config;
  
  let delay = baseDelay * Math.pow(backoffMultiplier, attemptNumber - 1);
  delay = Math.min(delay, maxDelay);
  
  if (jitter) {
    // Add ±25% jitter
    const jitterAmount = delay * 0.25;
    delay += (Math.random() * 2 - 1) * jitterAmount;
  }
  
  return Math.floor(delay);
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (attempt: number, error: any) => void
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt or if error is not retryable
      if (attempt === retryConfig.maxAttempts || !isRetryableError(error)) {
        throw error;
      }

      // Call retry callback
      onRetry?.(attempt, error);

      // Wait before retrying
      const delay = calculateRetryDelay(attempt, retryConfig);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Circuit breaker for preventing cascade failures
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold: number = 5,
    private timeout: number = 60000,
    private successThreshold: number = 3
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }

  reset(): void {
    this.failures = 0;
    this.state = 'closed';
    this.lastFailureTime = 0;
  }
}

/**
 * Hook for retry functionality
 */
export const useRetry = () => {
  const retryFunction = useCallback(async <T>(
    fn: () => Promise<T>,
    config?: Partial<RetryConfig>
  ): Promise<T> => {
    return retryWithBackoff(fn, config, (attempt, error) => {
      console.log(`Retry attempt ${attempt} after error:`, error);
    });
  }, []);

  return { retry: retryFunction };
};

/**
 * Hook for circuit breaker pattern
 */
export const useCircuitBreaker = (
  failureThreshold?: number,
  timeout?: number,
  successThreshold?: number
) => {
  const circuitBreakerRef = useRef<CircuitBreaker>();

  if (!circuitBreakerRef.current) {
    circuitBreakerRef.current = new CircuitBreaker(
      failureThreshold,
      timeout,
      successThreshold
    );
  }

  const execute = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    return circuitBreakerRef.current!.execute(fn);
  }, []);

  const getState = useCallback(() => {
    return circuitBreakerRef.current!.getState();
  }, []);

  const reset = useCallback(() => {
    circuitBreakerRef.current!.reset();
  }, []);

  return { execute, getState, reset };
};

/**
 * Recovery strategies for different error types
 */
export const recoveryStrategies = {
  /**
   * Network error recovery
   */
  network: {
    retry: async <T>(fn: () => Promise<T>): Promise<T> => {
      return retryWithBackoff(fn, {
        maxAttempts: 5,
        baseDelay: 1000,
        maxDelay: 10000,
      });
    },

    withFallback: async <T>(
      primaryFn: () => Promise<T>,
      fallbackFn: () => Promise<T>
    ): Promise<T> => {
      try {
        return await primaryFn();
      } catch (error) {
        if (isRetryableError(error)) {
          return await fallbackFn();
        }
        throw error;
      }
    },
  },

  /**
   * Authentication error recovery
   */
  auth: {
    refreshAndRetry: async <T>(
      fn: () => Promise<T>,
      refreshFn: () => Promise<void>
    ): Promise<T> => {
      try {
        return await fn();
      } catch (error) {
        // If authentication error, try to refresh and retry once
        if (error.status === 401) {
          await refreshFn();
          return await fn();
        }
        throw error;
      }
    },
  },

  /**
   * Cache error recovery
   */
  cache: {
    invalidateAndRetry: async <T>(
      fn: () => Promise<T>,
      queryKey: readonly unknown[]
    ): Promise<T> => {
      const queryClient = useQueryClient();
      
      try {
        return await fn();
      } catch (error) {
        // Invalidate cache and retry
        await queryClient.invalidateQueries({ queryKey });
        return await fn();
      }
    },
  },
};

/**
 * Hook for automatic error recovery
 */
export const useErrorRecovery = () => {
  const queryClient = useQueryClient();
  const { retry } = useRetry();

  const recoverFromError = useCallback(async <T>(
    error: any,
    originalFn: () => Promise<T>,
    options?: {
      maxRetries?: number;
      refreshToken?: () => Promise<void>;
      invalidateCache?: readonly unknown[];
      fallback?: () => Promise<T>;
    }
  ): Promise<T> => {
    const { maxRetries = 3, refreshToken, invalidateCache, fallback } = options || {};

    // Try different recovery strategies based on error type
    try {
      // Network errors - retry with backoff
      if (isRetryableError(error)) {
        return await retry(originalFn, { maxAttempts: maxRetries });
      }

      // Auth errors - refresh token and retry
      if (error.status === 401 && refreshToken) {
        await refreshToken();
        return await originalFn();
      }

      // Cache invalidation
      if (invalidateCache) {
        await queryClient.invalidateQueries({ queryKey: invalidateCache });
        return await originalFn();
      }

      // Fallback function
      if (fallback) {
        return await fallback();
      }

      // If no recovery strategy works, throw the original error
      throw error;
    } catch (recoveryError) {
      // Log both original and recovery errors
      errorTracker.captureError(error, { 
        context: 'original_error',
        recoveryAttempted: true 
      });
      errorTracker.captureError(recoveryError, { 
        context: 'recovery_error' 
      });
      
      throw recoveryError;
    }
  }, [retry, queryClient]);

  return { recoverFromError };
};

/**
 * Graceful degradation utilities
 */
export const gracefulDegradation = {
  /**
   * Execute with fallback data
   */
  withFallback: async <T>(
    primaryFn: () => Promise<T>,
    fallbackData: T,
    showWarning = true
  ): Promise<T> => {
    try {
      return await primaryFn();
    } catch (error) {
      if (showWarning) {
        toast.warning(
          'Using cached data',
          'Unable to fetch latest data, showing cached version'
        );
      }
      
      errorTracker.captureError(error, { 
        context: 'graceful_degradation',
        fallbackUsed: true 
      });
      
      return fallbackData;
    }
  },

  /**
   * Execute with reduced functionality
   */
  withReducedFeatures: async <T>(
    fullFeatureFn: () => Promise<T>,
    reducedFeatureFn: () => Promise<T>,
    showNotice = true
  ): Promise<T> => {
    try {
      return await fullFeatureFn();
    } catch (error) {
      if (showNotice) {
        toast.info(
          'Limited functionality',
          'Some features may be temporarily unavailable'
        );
      }
      
      return await reducedFeatureFn();
    }
  },

  /**
   * Execute with timeout and fallback
   */
  withTimeout: async <T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    fallbackData: T
  ): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs);
    });

    try {
      return await Promise.race([fn(), timeoutPromise]);
    } catch (error) {
      toast.warning(
        'Operation timed out',
        'Showing cached data instead'
      );
      
      return fallbackData;
    }
  },
};

/**
 * Hook for managing recovery attempts
 */
export const useRecoveryAttempts = (maxAttempts = 3) => {
  const attemptsRef = useRef(0);

  const canRetry = () => attemptsRef.current < maxAttempts;
  
  const incrementAttempts = () => {
    attemptsRef.current++;
  };
  
  const resetAttempts = () => {
    attemptsRef.current = 0;
  };

  const getAttempts = () => attemptsRef.current;

  return {
    canRetry,
    incrementAttempts,
    resetAttempts,
    getAttempts,
  };
};