// Mock API client for testing and development

import {
  ApiClientConfig,
  RequestConfig,
  ApiResponse,
  ApiError,
  MockResponse,
  MockEndpoint,
  GraphQLRequest,
  GraphQLResponse,
  ApiClientMethods,
  GraphQLClientMethods,
} from './types';

export class MockApiClient implements ApiClientMethods, GraphQLClientMethods {
  private mockEndpoints: MockEndpoint[] = [];
  private config: ApiClientConfig;
  private requestHistory: Array<{ config: RequestConfig & { url: string }; timestamp: Date }> = [];

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  // Mock configuration methods
  addMock(endpoint: MockEndpoint): void {
    this.mockEndpoints.push(endpoint);
  }

  addMocks(endpoints: MockEndpoint[]): void {
    this.mockEndpoints.push(...endpoints);
  }

  clearMocks(): void {
    this.mockEndpoints = [];
  }

  getRequestHistory(): Array<{ config: RequestConfig & { url: string }; timestamp: Date }> {
    return [...this.requestHistory];
  }

  clearRequestHistory(): void {
    this.requestHistory = [];
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
    // Record request in history
    this.requestHistory.push({
      config: { ...config },
      timestamp: new Date(),
    });

    const method = config.method || 'GET';
    const url = this.buildFullUrl(config.url);

    // Find matching mock endpoint
    const mockEndpoint = this.findMatchingEndpoint(method, url);
    
    if (!mockEndpoint) {
      throw this.createMockError(`No mock found for ${method} ${url}`, 404);
    }

    // Get mock response
    const mockResponse = await this.getMockResponse(mockEndpoint, config);

    // Simulate network delay
    if (mockResponse.delay && mockResponse.delay > 0) {
      await this.delay(mockResponse.delay);
    }

    // Check for error status
    if (mockResponse.status && mockResponse.status >= 400) {
      throw this.createMockError(
        `Mock error response: ${mockResponse.status}`,
        mockResponse.status,
        mockResponse.data
      );
    }

    const response: ApiResponse<T> = {
      data: mockResponse.data,
      status: mockResponse.status || 200,
      statusText: this.getStatusText(mockResponse.status || 200),
      headers: mockResponse.headers || {},
    };

    if (this.config.enableLogging) {
      this.logMockResponse(method, url, response);
    }

    return response;
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
  private findMatchingEndpoint(method: string, url: string): MockEndpoint | undefined {
    return this.mockEndpoints.find(endpoint => {
      const methodMatches = endpoint.method.toLowerCase() === method.toLowerCase();
      
      if (typeof endpoint.path === 'string') {
        return methodMatches && url.includes(endpoint.path);
      } else {
        // RegExp path
        return methodMatches && endpoint.path.test(url);
      }
    });
  }

  private async getMockResponse(endpoint: MockEndpoint, config: RequestConfig): Promise<MockResponse> {
    if (typeof endpoint.response === 'function') {
      return await endpoint.response(config);
    }
    return endpoint.response;
  }

  private buildFullUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    return `${this.config.baseURL}${url}`;
  }

  private createMockError(message: string, status?: number, details?: any): ApiError {
    return {
      message,
      status,
      details,
      originalError: new Error(message),
    };
  }

  private processGraphQLResponse<T>(response: GraphQLResponse<T>): T {
    if (response.errors && response.errors.length > 0) {
      const error: ApiError = {
        message: response.errors[0].message,
        details: response.errors,
      };
      throw error;
    }

    if (!response.data) {
      throw new Error('GraphQL response contains no data');
    }

    return response.data;
  }

  private getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error',
    };
    return statusTexts[status] || 'Unknown';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private logMockResponse<T>(method: string, url: string, response: ApiResponse<T>): void {
    console.group(`🎭 Mock API Response: ${method} ${url}`);
    console.log('Status:', response.status, response.statusText);
    console.log('Data:', response.data);
    console.groupEnd();
  }
}

// Predefined mock data generators
export const mockData = {
  user: (id: number = 1) => ({
    id,
    name: `User ${id}`,
    email: `user${id}@example.com`,
    avatar: `https://via.placeholder.com/150?text=User${id}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),

  users: (count: number = 10) => 
    Array.from({ length: count }, (_, i) => mockData.user(i + 1)),

  post: (id: number = 1, userId: number = 1) => ({
    id,
    title: `Post ${id}`,
    content: `This is the content of post ${id}`,
    userId,
    author: mockData.user(userId),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),

  posts: (count: number = 10) =>
    Array.from({ length: count }, (_, i) => mockData.post(i + 1, Math.floor(Math.random() * 5) + 1)),

  paginatedResponse: <T>(data: T[], page: number = 1, limit: number = 10) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = data.slice(start, end);
    
    return {
      data: items,
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit),
        hasNext: end < data.length,
        hasPrev: page > 1,
      },
    };
  },

  authResponse: (user = mockData.user()) => ({
    user,
    tokens: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
    },
  }),

  error: (message: string, code?: string) => ({
    error: {
      message,
      code: code || 'MOCK_ERROR',
      timestamp: new Date().toISOString(),
    },
  }),
};

// Common mock endpoints
export const commonMocks: MockEndpoint[] = [
  // Auth endpoints
  {
    method: 'POST',
    path: '/auth/login',
    response: { data: mockData.authResponse(), delay: 500 },
  },
  {
    method: 'POST',
    path: '/auth/register',
    response: { data: mockData.authResponse(), status: 201, delay: 800 },
  },
  {
    method: 'POST',
    path: '/auth/logout',
    response: { data: { success: true }, delay: 200 },
  },
  {
    method: 'GET',
    path: '/auth/me',
    response: { data: mockData.user(), delay: 300 },
  },

  // User endpoints
  {
    method: 'GET',
    path: /\/users$/,
    response: (req) => {
      const users = mockData.users(50);
      const page = parseInt(req.params?.page || '1');
      const limit = parseInt(req.params?.limit || '10');
      return {
        data: mockData.paginatedResponse(users, page, limit),
        delay: 400,
      };
    },
  },
  {
    method: 'GET',
    path: /\/users\/\d+$/,
    response: { data: mockData.user(), delay: 200 },
  },
  {
    method: 'POST',
    path: '/users',
    response: { data: mockData.user(), status: 201, delay: 600 },
  },
  {
    method: 'PUT',
    path: /\/users\/\d+$/,
    response: { data: mockData.user(), delay: 500 },
  },
  {
    method: 'DELETE',
    path: /\/users\/\d+$/,
    response: { data: { success: true }, status: 204, delay: 300 },
  },

  // Error scenarios
  {
    method: 'GET',
    path: '/error/500',
    response: {
      data: mockData.error('Internal Server Error'),
      status: 500,
      delay: 100,
    },
  },
  {
    method: 'GET',
    path: '/error/404',
    response: {
      data: mockData.error('Not Found'),
      status: 404,
      delay: 100,
    },
  },
];

// Factory function for creating mock API clients
export function createMockApiClient(config: ApiClientConfig, mocks?: MockEndpoint[]): MockApiClient {
  const client = new MockApiClient(config);
  
  if (mocks) {
    client.addMocks(mocks);
  } else {
    client.addMocks(commonMocks);
  }
  
  return client;
}

// Helper for creating test scenarios
export function createTestScenario(name: string, mocks: MockEndpoint[]): { name: string; mocks: MockEndpoint[] } {
  return { name, mocks };
}

// Predefined test scenarios
export const testScenarios = {
  happy: createTestScenario('Happy Path', commonMocks),
  
  slow: createTestScenario('Slow Network', 
    commonMocks.map(mock => ({
      ...mock,
      response: typeof mock.response === 'function' 
        ? async (req) => {
            const result = await mock.response(req);
            return { ...result, delay: (result.delay || 0) + 2000 };
          }
        : { ...mock.response, delay: (mock.response.delay || 0) + 2000 }
    }))
  ),
  
  errors: createTestScenario('Error Responses', [
    {
      method: 'GET',
      path: /\/users/,
      response: { data: mockData.error('Service Unavailable'), status: 503, delay: 100 },
    },
    {
      method: 'POST',
      path: /\/auth/,
      response: { data: mockData.error('Invalid credentials'), status: 401, delay: 200 },
    },
  ]),
};

export default MockApiClient;