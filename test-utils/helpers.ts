/**
 * Test Helpers
 * Utility functions for testing
 */

import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';

// Wait for async operations
export const waitForAsync = async (timeout = 1000) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

// Wait for element to appear with custom timeout
export const waitForElement = async (callback: () => void, timeout = 5000) => {
  return waitFor(callback, { timeout });
};

// Create mock function with specific return value
export const createMockFunction = <T extends (...args: any[]) => any>(
  returnValue?: ReturnType<T>
) => {
  return vi.fn().mockReturnValue(returnValue);
};

// Create mock async function with specific resolved value
export const createMockAsyncFunction = <T extends (...args: any[]) => Promise<any>>(
  resolvedValue?: Awaited<ReturnType<T>>
) => {
  return vi.fn().mockResolvedValue(resolvedValue);
};

// Create mock async function that rejects
export const createMockRejectedFunction = <T extends (...args: any[]) => Promise<any>>(
  rejectedValue?: any
) => {
  return vi.fn().mockRejectedValue(rejectedValue);
};

// Generate test data
export const generateTestUser = (overrides: Partial<any> = {}) => ({
  id: `user-${Math.random().toString(36).substr(2, 9)}`,
  email: `test-${Math.random().toString(36).substr(2, 5)}@example.com`,
  full_name: `Test User ${Math.random().toString(36).substr(2, 5)}`,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const generateTestProfile = (overrides: Partial<any> = {}) => ({
  ...generateTestUser(),
  bio: 'Test bio',
  location: 'Test City',
  website: 'https://example.com',
  avatar_url: 'https://example.com/avatar.jpg',
  preferences: {
    theme: 'light',
    notifications: true,
  },
  ...overrides,
});

// Generate array of test data
export const generateTestArray = <T>(
  generator: (index: number) => T,
  count: number = 5
): T[] => {
  return Array.from({ length: count }, (_, index) => generator(index));
};

// Test data builders
export const TestDataBuilder = {
  user: (overrides: Partial<any> = {}) => generateTestUser(overrides),
  profile: (overrides: Partial<any> = {}) => generateTestProfile(overrides),
  users: (count: number = 5) => generateTestArray(generateTestUser, count),
  profiles: (count: number = 5) => generateTestArray(generateTestProfile, count),
};

// Simulate user events
export const simulateUserEvent = {
  click: async (element: Element) => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const user = userEvent.setup();
    return user.click(element);
  },
  
  type: async (element: Element, text: string) => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const user = userEvent.setup();
    return user.type(element, text);
  },
  
  clear: async (element: Element) => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const user = userEvent.setup();
    return user.clear(element);
  },
  
  selectOptions: async (element: Element, values: string | string[]) => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const user = userEvent.setup();
    return user.selectOptions(element, values);
  },
  
  upload: async (element: Element, file: File | File[]) => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const user = userEvent.setup();
    return user.upload(element, file);
  },
};

// File helpers for testing uploads
export const createTestFile = (
  name = 'test.txt',
  content = 'test content',
  type = 'text/plain'
): File => {
  return new File([content], name, { type });
};

export const createTestImageFile = (
  name = 'test.jpg',
  type = 'image/jpeg'
): File => {
  const buffer = new ArrayBuffer(1024);
  return new File([buffer], name, { type });
};

// Assertion helpers
export const expectElementToBeVisible = (element: Element) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToHaveText = (element: Element, text: string) => {
  expect(element).toHaveTextContent(text);
};

export const expectElementToHaveClass = (element: Element, className: string) => {
  expect(element).toHaveClass(className);
};

// API testing helpers
export const mockApiCall = <T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  response: T,
  status = 200
) => {
  global.fetch = vi.fn().mockImplementation((requestUrl, options) => {
    if (requestUrl.includes(url) && (!options || options.method === method)) {
      return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response)),
      } as Response);
    }
    return Promise.reject(new Error('Unexpected API call'));
  });
};

// Database testing helpers
export const mockDatabaseQuery = <T>(response: T) => {
  return {
    data: response,
    error: null,
    count: Array.isArray(response) ? response.length : 1,
  };
};

export const mockDatabaseError = (error: string) => {
  return {
    data: null,
    error: { message: error },
    count: 0,
  };
};

// Test environment helpers
export const isTestEnvironment = () => process.env.NODE_ENV === 'test';

export const skipInCI = (testFn: () => void) => {
  if (process.env.CI) {
    return vi.fn(); // Skip test in CI
  }
  return testFn;
};

// Performance testing helpers
export const measurePerformance = async (fn: () => Promise<void> | void) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

// Cleanup helpers
export const cleanupMocks = () => {
  vi.clearAllMocks();
  vi.clearAllTimers();
};

export const resetTestEnvironment = () => {
  cleanupMocks();
  // Reset any global state
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
    window.sessionStorage.clear();
  }
};