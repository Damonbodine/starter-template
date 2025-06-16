/**
 * Test Mocks
 * Mock implementations for testing
 */

import { vi } from 'vitest';

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    setAuth: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    or: vi.fn().mockReturnThis(),
    and: vi.fn().mockReturnThis(),
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      download: vi.fn(),
      remove: vi.fn(),
      list: vi.fn(),
      getPublicUrl: vi.fn(),
    })),
  },
  realtime: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  },
};

// Mock tRPC client
export const mockTRPCClient = {
  user: {
    getCurrentProfile: {
      useQuery: vi.fn(),
      useMutation: vi.fn(),
    },
    getProfile: {
      useQuery: vi.fn(),
      useMutation: vi.fn(),
    },
    updateCurrentProfile: {
      useMutation: vi.fn(),
    },
    searchProfiles: {
      useQuery: vi.fn(),
    },
  },
};

// Mock API client
export const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  setAuthToken: vi.fn(),
  clearAuthToken: vi.fn(),
  uploadFile: vi.fn(),
};

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

// Mock profile data
export const mockProfile = {
  user_id: 'test-user-id',
  ...mockUser,
  bio: 'Test bio',
  location: 'Test City',
  website: 'https://example.com',
  preferences: {
    theme: 'light',
    notifications: true,
  },
};

// Mock API responses
export const mockApiResponse = <T>(data: T) => ({
  data,
  message: 'Success',
  timestamp: new Date().toISOString(),
});

export const mockPaginatedResponse = <T>(data: T[], page = 1, limit = 20, total = data.length) => ({
  data,
  message: 'Success',
  timestamp: new Date().toISOString(),
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPreviousPage: page > 1,
  },
});

// Mock error response
export const mockErrorResponse = (message = 'Test error', code = 'TEST_ERROR') => ({
  code,
  message,
  timestamp: new Date().toISOString(),
});

// Mock fetch responses
export const mockFetchSuccess = <T>(data: T) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response);
};

export const mockFetchError = (status = 500, message = 'Internal Server Error') => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText: message,
    json: () => Promise.resolve({ error: message }),
    text: () => Promise.resolve(JSON.stringify({ error: message })),
  } as Response);
};

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: Object.keys(store).length,
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
};

// Mock console methods
export const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Mock timers
export const mockTimers = () => {
  vi.useFakeTimers();
  return {
    advanceTimersByTime: vi.advanceTimersByTime,
    runAllTimers: vi.runAllTimers,
    clearAllTimers: vi.clearAllTimers,
    useRealTimers: vi.useRealTimers,
  };
};

// Mock intersection observer
export const mockIntersectionObserver = () => {
  const mockObserver = {
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  };

  global.IntersectionObserver = vi.fn(() => mockObserver) as any;
  
  return mockObserver;
};

// Mock resize observer
export const mockResizeObserver = () => {
  const mockObserver = {
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  };

  global.ResizeObserver = vi.fn(() => mockObserver) as any;
  
  return mockObserver;
};

// Mock media query
export const mockMediaQuery = (matches = false) => {
  const mockMQ = {
    matches,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  window.matchMedia = vi.fn(() => mockMQ);
  
  return mockMQ;
};