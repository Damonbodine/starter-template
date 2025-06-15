# @starter-template/shared

Shared utilities, types, and constants for the starter template monorepo. This package provides cross-platform functionality that can be used across web and mobile applications.

## Features

- 📱 **Cross-platform**: Works on React, React Native, and Node.js
- 🔒 **Authentication**: Comprehensive auth utilities with guards and permissions
- 🔧 **Type-safe**: Full TypeScript support with strict typing
- 📡 **API Client**: Configurable HTTP client with interceptors and retry logic
- 🛡️ **Error Handling**: Structured error types and handling utilities
- 🧪 **Well Tested**: Comprehensive test coverage with Jest

## Installation

```bash
# Install the package
pnpm add @starter-template/shared

# Install peer dependencies
pnpm add zod date-fns
```

## Quick Start

```typescript
import {
  // Types
  ApiResponse,
  User,
  LoadingState,

  // Utilities
  formatDate,
  isValidEmail,
  debounce,

  // API Client
  createApiClient,

  // Auth
  isAuthenticated,
  hasRole,
  validatePassword,

  // Constants
  API_ENDPOINTS,
  COLORS,
} from '@starter-template/shared';

// Create API client
const apiClient = createApiClient({
  baseURL: process.env.API_URL,
  timeout: 10000,
});

// Use auth guards
const canAccess = isAuthenticated(user) && hasRole(user, 'admin');

// Format dates
const formattedDate = formatDate(new Date(), { 
  dateStyle: 'medium' 
});
```

## API Reference

### Types

Common TypeScript interfaces and types used across the application:

```typescript
// API Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  roles: UserRole[];
  permissions: Permission[];
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Loading States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
```

### Utility Functions

#### Date Utilities

```typescript
import { formatDate, getRelativeTime, addDays } from '@starter-template/shared';

// Format dates with locale support
formatDate(new Date(), { dateStyle: 'full' });
// → "Wednesday, June 15, 2023"

// Get relative time
getRelativeTime(new Date(Date.now() - 5 * 60 * 1000));
// → "5 minutes ago"

// Date arithmetic
const futureDate = addDays(new Date(), 7);
```

#### Validation Utilities

```typescript
import { isValidEmail, validatePassword, isValidPhone } from '@starter-template/shared';

// Email validation
isValidEmail('user@example.com'); // → true

// Password validation
const result = validatePassword('MyPassword123!');
// → { isValid: true, errors: [] }

// Phone validation
isValidPhone('+1234567890'); // → true
```

#### Array and Object Utilities

```typescript
import { unique, deepMerge, pick, omit } from '@starter-template/shared';

// Remove duplicates
unique([1, 2, 2, 3]); // → [1, 2, 3]

// Deep merge objects
deepMerge(obj1, obj2);

// Pick/omit object properties
pick(user, ['id', 'email']);
omit(user, ['password', 'secret']);
```

#### Performance Utilities

```typescript
import { debounce, throttle, memoize } from '@starter-template/shared';

// Debounce function calls
const debouncedSearch = debounce(searchFunction, 300);

// Throttle function calls
const throttledScroll = throttle(scrollHandler, 100);

// Memoize expensive calculations
const memoizedCalculation = memoize(expensiveFunction);
```

### Authentication

#### Auth Guards

```typescript
import {
  isAuthenticated,
  requireRole,
  requirePermission,
  combineGuards,
} from '@starter-template/shared';

// Basic authentication check
const isLoggedIn = isAuthenticated(user);

// Role-based access
const isAdmin = requireRole('admin')(user);

// Permission-based access
const canEdit = requirePermission('posts', 'edit')(user);

// Combine multiple guards
const canAccess = combineGuards(
  isAuthenticated,
  requireRole('admin'),
  requirePermission('users', 'manage')
)(user);
```

#### Route Protection

```typescript
import { checkRouteAccess, routeGuards } from '@starter-template/shared';

// Check route access
const result = checkRouteAccess(user, {
  path: '/admin',
  requireAuth: true,
  requireVerified: true,
  roles: ['admin', 'moderator'],
  redirectPath: '/unauthorized',
});

if (!result.allowed) {
  // Redirect to result.redirect
}

// Pre-built guards
const loginGuard = routeGuards.authenticated;
const adminGuard = routeGuards.admin;
```

#### Token Management

```typescript
import {
  decodeToken,
  isTokenExpired,
  shouldRefreshToken,
  getUserFromToken,
} from '@starter-template/shared';

// Decode JWT (client-side only)
const payload = decodeToken(token);

// Check expiration
if (isTokenExpired(token)) {
  // Refresh token
}

// Check if refresh needed
if (shouldRefreshToken(token)) {
  // Refresh proactively
}

// Extract user from token
const user = getUserFromToken(token);
```

#### Storage Utilities

```typescript
import { AuthStorageService } from '@starter-template/shared';

// Cross-platform storage
const storage = new AuthStorageService();

// Store tokens
await storage.storeTokens({
  accessToken: 'abc123',
  refreshToken: 'def456',
});

// Get tokens
const tokens = await storage.getTokens();

// Clear storage
await storage.clearAll();
```

### API Client

```typescript
import { createApiClient, buildEndpoint } from '@starter-template/shared';

// Create client
const api = createApiClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
});

// Set authentication
api.setAuthToken('bearer-token');

// Add interceptors
api.interceptors.request.push((config) => ({
  ...config,
  headers: {
    ...config.headers,
    'X-Custom-Header': 'value',
  },
}));

// Make requests
const users = await api.get('/users', {
  params: { page: 1, limit: 10 }
});

const newUser = await api.post('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// Build dynamic endpoints
const endpoint = buildEndpoint('/users/:id/posts/:postId', {
  id: '123',
  postId: '456',
});
// → '/users/123/posts/456'
```

### Error Handling

```typescript
import {
  AppError,
  NetworkError,
  ValidationError,
  initializeErrorHandling,
  safeExecute,
} from '@starter-template/shared';

// Initialize global error handling
initializeErrorHandling({
  enableConsoleLogging: true,
  enableRemoteLogging: true,
  logEndpoint: '/api/logs',
});

// Safe execution with error handling
const [result, error] = await safeExecute(async () => {
  return await riskyOperation();
});

if (error) {
  console.error('Operation failed:', error.message);
} else {
  console.log('Success:', result);
}

// Custom error types
throw new ValidationError('Invalid email format', {
  field: 'email',
  value: 'invalid-email',
});

throw new NetworkError('Connection failed', {
  url: '/api/users',
  status: 500,
});
```

### Constants

```typescript
import {
  APP_METADATA,
  API_ENDPOINTS,
  COLORS,
  BREAKPOINTS,
  VALIDATION_LIMITS,
  ROUTES,
} from '@starter-template/shared';

// App configuration
console.log(APP_METADATA.name); // → "Starter Template"
console.log(APP_METADATA.version); // → "1.0.0"

// API endpoints
const loginUrl = API_ENDPOINTS.AUTH.LOGIN; // → "/auth/login"
const usersUrl = API_ENDPOINTS.USERS.LIST; // → "/users"

// Design tokens
const primaryColor = COLORS.PRIMARY; // → "#007bff"
const mobileBreakpoint = BREAKPOINTS.MOBILE; // → 768

// Validation limits
const maxNameLength = VALIDATION_LIMITS.USER.NAME.MAX; // → 50
```

## Platform Support

This package is designed to work across different platforms:

### React (Web)

```typescript
import { formatDate, createApiClient } from '@starter-template/shared';

// Uses browser APIs like localStorage and fetch
const api = createApiClient({ baseURL: process.env.NEXT_PUBLIC_API_URL });
```

### React Native

```typescript
import { formatDate, createApiClient } from '@starter-template/shared';

// Uses AsyncStorage and React Native's fetch
const api = createApiClient({ baseURL: process.env.EXPO_PUBLIC_API_URL });
```

### Node.js

```typescript
import { formatDate, createApiClient } from '@starter-template/shared';

// Uses appropriate Node.js APIs
const api = createApiClient({ 
  baseURL: process.env.API_URL,
  // Custom fetch implementation if needed
});
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type checking
pnpm type-check

# Linting
pnpm lint

# Build package
pnpm build
```

## Testing

The package includes comprehensive tests covering:

- Unit tests for all utility functions
- Authentication guard tests
- API client integration tests
- Cross-platform compatibility tests
- Type safety tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test auth/guards.test.ts

# Run tests with coverage
pnpm test:coverage
```

## License

MIT License - see LICENSE file for details.