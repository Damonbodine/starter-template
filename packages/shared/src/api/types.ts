// API-specific types and interfaces

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableLogging?: boolean;
  defaultHeaders?: Record<string, string>;
  interceptors?: {
    request?: RequestInterceptor[];
    response?: ResponseInterceptor[];
  };
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  retryAttempts?: number;
  skipAuth?: boolean;
  skipRetry?: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
  isNetworkError?: boolean;
  isTimeout?: boolean;
  originalError?: Error;
}

export interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onError?: (error: Error) => Promise<never>;
}

export interface ResponseInterceptor {
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
  onError?: (error: ApiError) => Promise<never>;
}

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface QueryParams extends PaginationParams, SortParams, FilterParams {}

// GraphQL specific types
export interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, any>;
  }>;
}

export interface GraphQLError extends ApiError {
  graphQLErrors?: GraphQLResponse['errors'];
}

// Mock API types
export interface MockResponse<T = any> {
  data: T;
  delay?: number;
  status?: number;
  headers?: Record<string, string>;
}

export interface MockEndpoint {
  method: string;
  path: string | RegExp;
  response: MockResponse | ((req: any) => MockResponse | Promise<MockResponse>);
}

// Utility types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface EndpointBuilder {
  (params?: Record<string, any>): string;
}

export interface ApiClientMethods {
  get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  request<T = any>(config: RequestConfig & { url: string }): Promise<ApiResponse<T>>;
}

export interface GraphQLClientMethods {
  query<T = any>(request: GraphQLRequest, config?: RequestConfig): Promise<T>;
  mutate<T = any>(request: GraphQLRequest, config?: RequestConfig): Promise<T>;
}