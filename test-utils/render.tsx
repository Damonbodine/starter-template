/**
 * Custom Render Utilities
 * Enhanced render functions for testing React components
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock providers for testing
interface TestProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

function TestProviders({ children, queryClient }: TestProvidersProps) {
  const testQueryClient = queryClient || new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  wrapper?: React.ComponentType<any>;
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { queryClient: QueryClient } {
  const { queryClient: customQueryClient, wrapper, ...renderOptions } = options;
  
  const queryClient = customQueryClient || new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => {
    const content = (
      <TestProviders queryClient={queryClient}>
        {children}
      </TestProviders>
    );

    if (wrapper) {
      const CustomWrapper = wrapper;
      return <CustomWrapper>{content}</CustomWrapper>;
    }

    return content;
  };

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result,
    queryClient,
  };
}

// Utility for testing async components
export async function renderWithProvidersAsync(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): Promise<RenderResult & { queryClient: QueryClient }> {
  const result = renderWithProviders(ui, options);
  
  // Wait for any pending updates
  await new Promise(resolve => setTimeout(resolve, 0));
  
  return result;
}

// Utility for testing components with user interactions
export function createUserEventWithProviders(options: CustomRenderOptions = {}) {
  return {
    render: (ui: ReactElement) => renderWithProviders(ui, options),
    user: require('@testing-library/user-event').default.setup(),
  };
}

// Mock authentication context
interface MockAuthContextValue {
  user?: any;
  isLoading?: boolean;
  isAuthenticated?: boolean;
  signIn?: () => Promise<void>;
  signOut?: () => Promise<void>;
}

export function createMockAuthProvider(authValue: MockAuthContextValue = {}) {
  const defaultAuthValue = {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    signIn: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    ...authValue,
  };

  return function MockAuthProvider({ children }: { children: ReactNode }) {
    // In a real implementation, this would use your auth context
    // For now, we'll just render children
    return <>{children}</>;
  };
}

// Utility for testing with mock authentication
export function renderWithAuth(
  ui: ReactElement,
  authValue: MockAuthContextValue = {},
  options: CustomRenderOptions = {}
) {
  const MockAuthProvider = createMockAuthProvider(authValue);
  
  return renderWithProviders(ui, {
    ...options,
    wrapper: MockAuthProvider,
  });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { vi } from 'vitest';