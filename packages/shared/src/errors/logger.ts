import { BaseError, ErrorSeverity, ErrorMetadata } from './types';

/**
 * Log levels for the logger
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

/**
 * Log entry interface
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  error?: BaseError | Error;
  metadata?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  remoteApiKey?: string;
  batchSize?: number;
  flushInterval?: number;
  formatters?: LogFormatter[];
  filters?: LogFilter[];
}

/**
 * Log formatter interface
 */
export interface LogFormatter {
  format(entry: LogEntry): string;
}

/**
 * Log filter interface
 */
export interface LogFilter {
  shouldLog(entry: LogEntry): boolean;
}

/**
 * Remote log transport interface
 */
export interface RemoteLogTransport {
  send(entries: LogEntry[]): Promise<void>;
}

/**
 * Default console formatter
 */
export class ConsoleFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level];
    const message = entry.message;
    
    let formatted = `[${timestamp}] [${level}] ${message}`;
    
    if (entry.error) {
      formatted += `\nError: ${entry.error.message}`;
      if (entry.error.stack) {
        formatted += `\nStack: ${entry.error.stack}`;
      }
    }
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      formatted += `\nMetadata: ${JSON.stringify(entry.metadata, null, 2)}`;
    }
    
    return formatted;
  }
}

/**
 * JSON formatter for structured logging
 */
export class JSONFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    return JSON.stringify({
      level: LogLevel[entry.level],
      message: entry.message,
      timestamp: entry.timestamp.toISOString(),
      error: entry.error ? this.formatError(entry.error) : undefined,
      metadata: entry.metadata,
      context: entry.context
    });
  }

  private formatError(error: Error | BaseError): Record<string, unknown> {
    if (error instanceof BaseError) {
      return error.toJSON();
    }
    
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }
}

/**
 * Cross-platform error logger
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout | number;
  private remoteTransport?: RemoteLogTransport;

  private constructor(config: LoggerConfig) {
    this.config = config;
    this.setupFlushTimer();
    
    if (config.enableRemote && config.remoteEndpoint) {
      this.remoteTransport = new DefaultRemoteTransport(
        config.remoteEndpoint,
        config.remoteApiKey
      );
    }
  }

  public static getInstance(config?: LoggerConfig): ErrorLogger {
    if (!ErrorLogger.instance && config) {
      ErrorLogger.instance = new ErrorLogger(config);
    } else if (!ErrorLogger.instance) {
      // Default configuration
      ErrorLogger.instance = new ErrorLogger({
        minLevel: LogLevel.INFO,
        enableConsole: true,
        enableRemote: false,
        batchSize: 100,
        flushInterval: 5000,
        formatters: [new ConsoleFormatter()],
        filters: []
      });
    }
    
    return ErrorLogger.instance;
  }

  public updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.flushTimer) {
      clearInterval(this.flushTimer as number);
    }
    
    this.setupFlushTimer();
  }

  public debug(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, undefined, metadata);
  }

  public info(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, undefined, metadata);
  }

  public warn(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, error, metadata);
  }

  public error(message: string, error: Error | BaseError, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, error, metadata);
  }

  public fatal(message: string, error: Error | BaseError, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.FATAL, message, error, metadata);
  }

  public logError(error: Error | BaseError): void {
    const level = this.getLogLevelFromError(error);
    const message = error.message;
    const metadata = error instanceof BaseError ? error.metadata : undefined;
    
    this.log(level, message, error, metadata as Record<string, unknown>);
  }

  private log(
    level: LogLevel,
    message: string,
    error?: Error | BaseError,
    metadata?: Record<string, unknown>
  ): void {
    if (level < this.config.minLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      error,
      metadata,
      context: this.getContext()
    };

    // Apply filters
    const shouldLog = this.config.filters?.every(filter => filter.shouldLog(entry)) ?? true;
    if (!shouldLog) {
      return;
    }

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Remote logging
    if (this.config.enableRemote) {
      this.addToBuffer(entry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const formatter = this.config.formatters?.[0] || new ConsoleFormatter();
    const formatted = formatter.format(entry);

    switch (entry.level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formatted);
        break;
    }
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);

    if (this.logBuffer.length >= (this.config.batchSize || 100)) {
      this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.logBuffer.length === 0 || !this.remoteTransport) {
      return;
    }

    const entries = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await this.remoteTransport.send(entries);
    } catch (error) {
      // Re-add entries to buffer on failure
      this.logBuffer.unshift(...entries);
      console.error('Failed to send logs to remote:', error);
    }
  }

  private setupFlushTimer(): void {
    if (this.config.enableRemote && this.config.flushInterval) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.config.flushInterval);
    }
  }

  private getLogLevelFromError(error: Error | BaseError): LogLevel {
    if (!(error instanceof BaseError)) {
      return LogLevel.ERROR;
    }

    switch (error.severity) {
      case ErrorSeverity.LOW:
        return LogLevel.WARN;
      case ErrorSeverity.MEDIUM:
        return LogLevel.ERROR;
      case ErrorSeverity.HIGH:
        return LogLevel.ERROR;
      case ErrorSeverity.CRITICAL:
        return LogLevel.FATAL;
      default:
        return LogLevel.ERROR;
    }
  }

  private getContext(): Record<string, unknown> {
    // Platform-specific context
    if (typeof window !== 'undefined') {
      // Web context
      return {
        platform: 'web',
        userAgent: window.navigator.userAgent,
        url: window.location.href,
        screenResolution: `${window.screen.width}x${window.screen.height}`
      };
    } else if (typeof global !== 'undefined' && global.process) {
      // Node.js context
      return {
        platform: 'node',
        nodeVersion: process.version,
        pid: process.pid,
        memory: process.memoryUsage()
      };
    }
    
    return { platform: 'unknown' };
  }

  public async forceFlush(): Promise<void> {
    await this.flush();
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer as number);
    }
    
    this.flush();
  }
}

/**
 * Default remote transport implementation
 */
class DefaultRemoteTransport implements RemoteLogTransport {
  constructor(
    private endpoint: string,
    private apiKey?: string
  ) {}

  async send(entries: LogEntry[]): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ logs: entries })
    });

    if (!response.ok) {
      throw new Error(`Failed to send logs: ${response.statusText}`);
    }
  }
}

/**
 * Error formatting utilities
 */
export class ErrorFormatter {
  static formatForUser(error: Error | BaseError): string {
    if (error instanceof BaseError) {
      // User-friendly messages based on category
      switch (error.category) {
        case 'network':
          return 'A network error occurred. Please check your connection and try again.';
        case 'validation':
          return error.message; // Validation errors are usually user-friendly
        case 'authentication':
          return 'Authentication failed. Please log in again.';
        case 'authorization':
          return 'You do not have permission to perform this action.';
        default:
          return 'An unexpected error occurred. Please try again later.';
      }
    }
    
    return 'An unexpected error occurred. Please try again later.';
  }

  static formatForDeveloper(error: Error | BaseError): string {
    if (error instanceof BaseError) {
      return JSON.stringify(error.toJSON(), null, 2);
    }
    
    return `${error.name}: ${error.message}\n${error.stack}`;
  }
}