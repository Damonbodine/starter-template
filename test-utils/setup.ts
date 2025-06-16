/**
 * Test Setup Utilities
 * Functions to set up test environments
 */

import { vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { mockSupabaseClient } from './mocks';

// Setup test environment
export const setupTestEnvironment = () => {
  // Mock environment variables
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
  
  // Mock global objects
  setupGlobalMocks();
  
  return {
    cleanup: cleanupTestEnvironment,
  };
};

// Setup global mocks
export const setupGlobalMocks = () => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  })) as any;

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  })) as any;

  // Mock URL.createObjectURL
  global.URL.createObjectURL = vi.fn(() => 'mocked-url');
  global.URL.revokeObjectURL = vi.fn();

  // Mock fetch
  global.fetch = vi.fn();
};

// Setup React Query for testing
export const setupReactQuery = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  });

  return queryClient;
};

// Setup Supabase mocks
export const setupSupabaseMocks = () => {
  // Mock createClient function
  vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockSupabaseClient),
  }));

  return mockSupabaseClient;
};

// Setup Next.js mocks
export const setupNextjsMocks = () => {
  // Mock next/router
  vi.mock('next/router', () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
      route: '/',
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
    }),
  }));

  // Mock next/navigation
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
  }));

  // Mock next/image
  vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: any) => {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={alt} {...props} />;
    },
  }));

  // Mock next/link
  vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: any) => {
      return <a href={href} {...props}>{children}</a>;
    },
  }));
};

// Setup React Native mocks
export const setupReactNativeMocks = () => {
  // Mock react-native modules
  vi.mock('react-native', async () => {
    const RN = await vi.importActual('react-native');
    return {
      ...RN,
      Alert: {
        alert: vi.fn(),
      },
      Dimensions: {
        get: vi.fn(() => ({ width: 375, height: 812 })),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      Platform: {
        OS: 'ios',
        select: vi.fn((obj) => obj.ios),
      },
      StatusBar: {
        setBarStyle: vi.fn(),
        setBackgroundColor: vi.fn(),
      },
    };
  });

  // Mock AsyncStorage
  vi.mock('@react-native-async-storage/async-storage', () => ({
    default: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      getAllKeys: vi.fn(),
      multiGet: vi.fn(),
      multiSet: vi.fn(),
      multiRemove: vi.fn(),
    },
  }));

  // Mock Expo modules
  vi.mock('expo-constants', () => ({
    default: {
      expoConfig: {
        extra: {
          supabaseUrl: 'https://test.supabase.co',
          supabaseAnonKey: 'test-key',
        },
      },
    },
  }));
};

// Setup authentication mocks
export const setupAuthMocks = (user: any = null) => {
  const authMocks = {
    useAuth: vi.fn(() => ({
      user,
      isLoading: false,
      isAuthenticated: !!user,
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
    })),
    useAuthGuard: vi.fn(() => ({
      canAccess: true,
      isLoading: false,
      user,
    })),
  };

  return authMocks;
};

// Setup tRPC mocks
export const setupTRPCMocks = () => {
  const trpcMocks = {
    user: {
      getCurrentProfile: {
        useQuery: vi.fn(),
        useMutation: vi.fn(),
      },
      getProfile: {
        useQuery: vi.fn(),
      },
      updateCurrentProfile: {
        useMutation: vi.fn(),
      },
      searchProfiles: {
        useQuery: vi.fn(),
      },
    },
  };

  vi.mock('@/lib/trpc/client', () => ({
    trpc: trpcMocks,
  }));

  return trpcMocks;
};

// Cleanup test environment
export const cleanupTestEnvironment = () => {
  vi.clearAllMocks();
  vi.clearAllTimers();
  vi.restoreAllMocks();
  
  // Clear storage
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
    window.sessionStorage.clear();
  }
};