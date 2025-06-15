// Main API exports - centralized access to all API utilities

// Core API client
export { ApiClient, createApiClient } from './client';
export { MockApiClient, createMockApiClient } from './mock';

// Types
export type {
  ApiClientConfig,
  RequestConfig,
  ApiResponse,
  ApiError,
  RequestInterceptor,
  ResponseInterceptor,
  AuthTokens,
  PaginationParams,
  SortParams,
  FilterParams,
  QueryParams,
  GraphQLRequest,
  GraphQLResponse,
  GraphQLError,
  MockResponse,
  MockEndpoint,
  HttpMethod,
  EndpointBuilder,
  ApiClientMethods,
  GraphQLClientMethods,
} from './types';

// Endpoint builders and utilities
export {
  endpoints,
  createVersionedEndpoints,
  createEndpointBuilder,
  replaceUrlParams,
  buildQueryString,
  graphql,
  upload,
  search,
  admin,
  utils,
} from './endpoints';

// Mock utilities
export {
  mockData,
  commonMocks,
  testScenarios,
  createTestScenario,
} from './mock';

// Re-export default from endpoints for convenience
export { default as endpointHelpers } from './endpoints';

// Convenience exports for common use cases
export const api = {
  // Client factories
  createClient: createApiClient,
  createMockClient: createMockApiClient,
  
  // Endpoint builders
  endpoints,
  createVersionedEndpoints,
  
  // Mock utilities
  mockData,
  commonMocks,
  testScenarios,
};

// Default export with all utilities
export default api;