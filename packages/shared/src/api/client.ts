// Base API client with comprehensive features for web and mobile platforms

import {
  ApiClientConfig,
  RequestConfig,
  ApiResponse,
  ApiError,
  AuthTokens,
  GraphQLRequest,
  GraphQLResponse,
  GraphQLError,
  ApiClientMethods,
  GraphQLClientMethods,
} from './types';

export class ApiClient implements ApiClientMethods, GraphQLClientMethods {
  private config: Required<Omit<ApiClientConfig, 'interceptors'>> & Pick<ApiClientConfig, 'interceptors'>;
  private authTokens: AuthTokens = {};

  constructor(config: ApiClientConfig) {
    this.config = {
      baseURL: config.baseURL,
      timeout: config.timeout ?? 30000,
      retryAttempts: config.retryAttempts ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      enableLogging: config.enableLogging ?? false,
      defaultHeaders: {
        'Content-Type': 'application/json',
        ...config.defaultHeaders,
      },
      interceptors: config.interceptors,
    };
  }

  // Authentication methods
  setAuthTokens(tokens: AuthTokens): void {
    this.authTokens = { ...tokens };
  }

  getAuthTokens(): AuthTokens {
    return { ...this.authTokens };
  }

  clearAuthTokens(): void {
    this.authTokens = {};
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  async request<T = any>(config: RequestConfig & { url: string }): Promise<ApiResponse<T>> {
    const finalConfig = await this.buildRequestConfig(config);
    
    if (this.config.enableLogging) {
      this.logRequest(finalConfig);
    }

    let lastError: ApiError | null = null;
    const retryAttempts = config.skipRetry ? 0 : (config.retryAttempts ?? this.config.retryAttempts);

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        const response = await this.executeRequest<T>(finalConfig);
        
        if (this.config.enableLogging) {
          this.logResponse(response);
        }

        return await this.processResponse(response);
      } catch (error) {
        lastError = this.createApiError(error);
        
        if (this.config.enableLogging) {
          this.logError(lastError, attempt);
        }

        // Don't retry on certain errors
        if (this.shouldNotRetry(lastError) || attempt === retryAttempts) {
          break;
        }

        // Wait before retry
        await this.delay(this.config.retryDelay * Math.pow(2, attempt));
      }
    }

    throw lastError;
  }

  // GraphQL Methods
  async query<T = any>(request: GraphQLRequest, config?: RequestConfig): Promise<T> {
    const response = await this.post<GraphQLResponse<T>>('/graphql', request, config);
    return this.processGraphQLResponse(response.data);
  }

  async mutate<T = any>(request: GraphQLRequest, config?: RequestConfig): Promise<T> {
    const response = await this.post<GraphQLResponse<T>>('/graphql', request, config);
    return this.processGraphQLResponse(response.data);
  }

  // Private methods
  private async buildRequestConfig(config: RequestConfig & { url: string }): Promise<RequestConfig & { url: string }> {
    let finalConfig = { ...config };

    // Apply request interceptors
    if (this.config.interceptors?.request) {
      for (const interceptor of this.config.interceptors.request) {
        if (interceptor.onRequest) {
          finalConfig = await interceptor.onRequest(finalConfig);
        }
      }
    }

    // Build headers
    const headers = {
      ...this.config.defaultHeaders,
      ...finalConfig.headers,
    };

    // Add authentication header
    if (!finalConfig.skipAuth && this.authTokens.accessToken) {
      const tokenType = this.authTokens.tokenType || 'Bearer';
      headers.Authorization = `${tokenType} ${this.authTokens.accessToken}`;
    }

    // Build full URL
    const url = this.buildUrl(finalConfig.url, finalConfig.params);

    return {
      ...finalConfig,
      url,
      headers,
      timeout: finalConfig.timeout ?? this.config.timeout,
    };
  }

  private async executeRequest<T>(config: RequestConfig & { url: string }): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
      const fetchConfig: RequestInit = {
        method: config.method || 'GET',
        headers: config.headers,
        signal: controller.signal,
      };

      if (config.data && config.method !== 'GET') {
        if (config.data instanceof FormData) {
          fetchConfig.body = config.data;
          // Remove Content-Type header for FormData to let browser set it
          delete fetchConfig.headers?.['Content-Type'];
        } else if (typeof config.data === 'string') {
          fetchConfig.body = config.data;
        } else {
          fetchConfig.body = JSON.stringify(config.data);
        }
      }

      const response = await fetch(config.url, fetchConfig);
      clearTimeout(timeoutId);
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let data: T;
    const contentType = response.headers.get('content-type');

    try {
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = (await response.text()) as unknown as T;
      } else {
        data = (await response.blob()) as unknown as T;
      }
    } catch (error) {
      throw new Error(`Failed to parse response: ${error}`);
    }

    const apiResponse: ApiResponse<T> = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: this.parseHeaders(response.headers),
    };

    if (!response.ok) {
      throw this.createApiError(new Error(`HTTP ${response.status}: ${response.statusText}`), {
        status: response.status,
        response: apiResponse,
      });
    }

    // Apply response interceptors
    if (this.config.interceptors?.response) {
      let processedResponse = apiResponse;
      for (const interceptor of this.config.interceptors.response) {
        if (interceptor.onResponse) {
          processedResponse = await interceptor.onResponse(processedResponse);
        }
      }
      return processedResponse;
    }

    return apiResponse;
  }

  private processGraphQLResponse<T>(response: GraphQLResponse<T>): T {
    if (response.errors && response.errors.length > 0) {
      const error: GraphQLError = {
        message: response.errors[0].message,
        graphQLErrors: response.errors,
      };
      throw error;
    }

    if (!response.data) {
      throw new Error('GraphQL response contains no data');
    }

    return response.data;
  }

  private createApiError(error: any, context?: { status?: number; response?: any }): ApiError {
    const apiError: ApiError = {
      message: error.message || 'An unknown error occurred',
      originalError: error,
    };

    if (context?.status) {
      apiError.status = context.status;
    }

    if (error.name === 'AbortError') {
      apiError.isTimeout = true;
      apiError.message = 'Request timeout';
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      apiError.isNetworkError = true;
      apiError.message = 'Network error';
    }

    return apiError;
  }

  private shouldNotRetry(error: ApiError): boolean {
    // Don't retry on authentication errors, client errors (4xx), or certain network conditions
    if (error.status) {
      return error.status >= 400 && error.status < 500;
    }
    return false;
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    let url = path.startsWith('http') ? path : `${this.config.baseURL}${path}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    return url;
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Logging methods
  private logRequest(config: RequestConfig & { url: string }): void {
    console.group(`🔄 API Request: ${config.method} ${config.url}`);
    console.log('Headers:', config.headers);
    if (config.data) {
      console.log('Data:', config.data);
    }
    console.groupEnd();
  }

  private logResponse<T>(response: ApiResponse<T>): void {
    console.group(`✅ API Response: ${response.status} ${response.statusText}`);
    console.log('Headers:', response.headers);
    console.log('Data:', response.data);
    console.groupEnd();
  }

  private logError(error: ApiError, attempt: number): void {
    console.group(`❌ API Error (Attempt ${attempt + 1})`);
    console.error('Message:', error.message);
    console.error('Status:', error.status);
    console.error('Details:', error.details);
    console.groupEnd();
  }
}

// Factory function for creating API clients
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

// Default export
export default ApiClient;