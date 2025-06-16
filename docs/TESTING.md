# Testing Guide

This guide covers the comprehensive testing setup for the Starter Template monorepo, including unit tests, integration tests, component tests, and end-to-end tests.

## 🧪 Testing Stack

### Core Testing Technologies
- **Vitest** - Fast unit test runner for packages and web app
- **React Testing Library** - Component testing utilities
- **Playwright** - End-to-end testing for web application
- **Jest** - React Native testing with jest-expo
- **Testing Library React Native** - Component testing for mobile

### Test Types
1. **Unit Tests** - Individual functions and utilities
2. **Component Tests** - React/React Native component behavior
3. **Integration Tests** - API clients and database utilities
4. **E2E Tests** - Full application workflows

## 📁 Test Structure

```
starter-template/
├── test-utils/                 # Shared testing utilities
│   ├── index.ts               # Main exports
│   ├── render.tsx             # Custom render functions
│   ├── mocks.ts               # Mock implementations
│   ├── helpers.ts             # Test helper functions
│   └── setup.ts               # Environment setup
├── apps/
│   ├── web/
│   │   ├── src/__tests__/     # Web app unit tests
│   │   ├── e2e/               # Playwright E2E tests
│   │   └── playwright.config.ts
│   └── mobile/
│       ├── src/__tests__/     # Mobile app tests
│       ├── jest.config.js     # Jest configuration
│       └── jest.setup.ts      # Jest setup
├── packages/
│   ├── ui/src/__tests__/      # Component library tests
│   ├── shared/src/__tests__/  # Shared utilities tests
│   └── database/src/__tests__/ # Database tests
├── vitest.config.ts           # Root Vitest config
└── vitest.setup.ts            # Global test setup
```

## 🚀 Running Tests

### All Tests
```bash
# Run all tests across the monorepo
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

### Package-Specific Tests
```bash
# Test shared packages only
pnpm test:packages

# Test web app only
pnpm test:web

# Test mobile app only
pnpm test:mobile

# Run E2E tests
pnpm test:e2e
```

### Individual Package Tests
```bash
# Test specific package
cd packages/shared && pnpm test
cd packages/ui && pnpm test
cd packages/database && pnpm test

# Test specific app
cd apps/web && pnpm test
cd apps/mobile && pnpm test
```

## 🔧 Configuration

### Vitest Configuration
The root `vitest.config.ts` provides shared configuration for all packages:

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

### Jest Configuration (React Native)
Mobile app uses Jest with expo preset:

```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*)'
  ],
};
```

### Playwright Configuration
E2E tests configured for multiple browsers:

```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
});
```

## 📝 Writing Tests

### Unit Tests (Vitest)
```typescript
import { describe, it, expect, vi } from 'vitest';
import { formatDate, isValidEmail } from '../utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2023-01-01T12:00:00Z');
    const formatted = formatDate(date);
    expect(formatted).toMatch(/Jan.*1.*2023/);
  });
});

describe('isValidEmail', () => {
  it('should validate email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });
});
```

### Component Tests (React Testing Library)
```typescript
import React from 'react';
import { renderWithProviders, simulateUserEvent } from '../../../test-utils';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with default props', () => {
    const { getByRole } = renderWithProviders(
      <Button>Click me</Button>
    );

    expect(getByRole('button')).toBeInTheDocument();
    expect(getByRole('button')).toHaveTextContent('Click me');
  });

  it('should handle click events', async () => {
    const onPress = vi.fn();
    const { getByRole } = renderWithProviders(
      <Button onPress={onPress}>Click me</Button>
    );

    await simulateUserEvent.click(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### React Native Component Tests
```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button (React Native)', () => {
  it('should render correctly', () => {
    const { getByText } = render(
      <Button title="Press me" onPress={() => {}} />
    );
    
    expect(getByText('Press me')).toBeTruthy();
  });
});
```

### E2E Tests (Playwright)
```typescript
import { test, expect } from './fixtures';

test.describe('Authentication', () => {
  test('should allow user to sign in', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Database Tests
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseClient } from '../client';
import { mockSupabaseClient } from '../../../test-utils';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

describe('Supabase Client', () => {
  it('should handle authentication', async () => {
    const client = createSupabaseClient();
    
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-id', email: 'test@example.com' } },
      error: null,
    });

    const { data, error } = await client.auth.getUser();
    
    expect(error).toBeNull();
    expect(data.user).toEqual({
      id: 'test-id',
      email: 'test@example.com',
    });
  });
});
```

## 🛠️ Test Utilities

### Custom Render Functions
The `test-utils` package provides enhanced render functions:

```typescript
import { renderWithProviders } from '../../../test-utils';

// Renders component with all necessary providers
const { getByRole, queryClient } = renderWithProviders(<MyComponent />);

// Render with custom query client
const customQueryClient = new QueryClient({...});
renderWithProviders(<MyComponent />, { queryClient: customQueryClient });

// Render with authentication
renderWithAuth(<MyComponent />, { user: mockUser });
```

### Mock Utilities
Pre-configured mocks for common services:

```typescript
import { 
  mockSupabaseClient,
  mockTRPCClient,
  mockApiClient,
  mockUser,
  mockProfile,
  mockApiResponse,
  mockFetchSuccess,
  mockFetchError
} from '../../../test-utils';

// Use in tests
mockSupabaseClient.auth.getUser.mockResolvedValue({
  data: { user: mockUser },
  error: null,
});

mockFetchSuccess(mockApiResponse(mockProfile));
```

### Test Helpers
Helper functions for common testing patterns:

```typescript
import { 
  TestDataBuilder,
  simulateUserEvent,
  createTestFile,
  measurePerformance,
  waitForAsync
} from '../../../test-utils';

// Generate test data
const users = TestDataBuilder.users(5);
const profile = TestDataBuilder.profile({ role: 'admin' });

// Simulate user interactions
await simulateUserEvent.click(button);
await simulateUserEvent.type(input, 'test text');

// File testing
const file = createTestFile('test.txt', 'content');
await simulateUserEvent.upload(fileInput, file);

// Performance testing
const duration = await measurePerformance(async () => {
  await heavyOperation();
});
```

## 🎯 Testing Patterns

### Testing Hooks
```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

test('useAuth should return user data', () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: AuthProvider,
  });

  expect(result.current.user).toBeNull();
  expect(result.current.isLoading).toBe(true);
});
```

### Testing API Calls
```typescript
import { mockApiCall } from '../../../test-utils';

test('should fetch user data', async () => {
  mockApiCall('GET', '/api/users/me', { id: '1', name: 'Test User' });

  const user = await apiClient.getCurrentUser();
  
  expect(user).toEqual({ id: '1', name: 'Test User' });
});
```

### Testing Forms
```typescript
test('should submit form with valid data', async () => {
  const onSubmit = vi.fn();
  const { getByLabelText, getByRole } = renderWithProviders(
    <ContactForm onSubmit={onSubmit} />
  );

  await simulateUserEvent.type(getByLabelText(/name/i), 'John Doe');
  await simulateUserEvent.type(getByLabelText(/email/i), 'john@example.com');
  await simulateUserEvent.click(getByRole('button', { name: /submit/i }));

  expect(onSubmit).toHaveBeenCalledWith({
    name: 'John Doe',
    email: 'john@example.com',
  });
});
```

### Testing Async Operations
```typescript
test('should handle loading states', async () => {
  const { getByText, queryByText } = renderWithProviders(<UserList />);

  // Initially loading
  expect(getByText(/loading/i)).toBeInTheDocument();

  // Wait for data to load
  await waitFor(() => {
    expect(queryByText(/loading/i)).not.toBeInTheDocument();
    expect(getByText('John Doe')).toBeInTheDocument();
  });
});
```

## 🔍 Debugging Tests

### Vitest Debugging
```bash
# Run tests in debug mode
pnpm test --reporter=verbose

# Run specific test file
pnpm test packages/shared/src/__tests__/utils.test.ts

# Run tests matching pattern
pnpm test --grep="validation"

# Run tests with UI for debugging
pnpm test:ui
```

### Playwright Debugging
```bash
# Run tests in headed mode
pnpm test:e2e --headed

# Run tests with UI mode
pnpm test:e2e --ui

# Run tests with debug mode
pnpm test:e2e --debug

# Generate test code
npx playwright codegen localhost:3000
```

### React Native Debugging
```bash
# Run tests with verbose output
cd apps/mobile && pnpm test --verbose

# Run specific test file
cd apps/mobile && pnpm test src/__tests__/App.test.tsx

# Update snapshots
cd apps/mobile && pnpm test --updateSnapshot
```

## 📊 Coverage Reports

### Generating Coverage
```bash
# Generate coverage for all tests
pnpm test:coverage

# View coverage report
open coverage/index.html

# Generate coverage for specific package
cd packages/shared && pnpm test --coverage
```

### Coverage Thresholds
Minimum coverage requirements:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## 🏗️ CI/CD Integration

### GitHub Actions
Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### Test Jobs
1. **Code Quality** - Linting and formatting
2. **Unit Tests** - Package and web app tests
3. **Mobile Tests** - React Native tests
4. **E2E Tests** - Playwright tests
5. **Security Audit** - Dependency scanning

### Caching
- pnpm dependencies cached
- Playwright browsers cached
- Test results cached for Turborepo

## 🔧 Troubleshooting

### Common Issues

#### Vitest Issues
```bash
# Clear Vitest cache
npx vitest --run --reporter=verbose --clearCache

# Check for conflicting Jest config
rm jest.config.js  # if exists and not needed
```

#### Playwright Issues
```bash
# Reinstall browsers
npx playwright install

# Update browser versions
npx playwright install --force
```

#### React Native Testing Issues
```bash
# Clear Metro cache
cd apps/mobile && npx expo start --clear

# Reset React Native cache
cd apps/mobile && npm start -- --reset-cache
```

### Test Performance
- Use `describe.concurrent` for parallel test execution
- Mock heavy operations and API calls
- Use `vi.hoisted()` for setup that needs to run before imports
- Avoid creating real DOM elements when testing utilities

## 📚 Best Practices

### Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)
- Keep tests focused and isolated

### Mock Management
- Use the shared mock utilities
- Mock at the appropriate level (module vs function)
- Reset mocks between tests
- Prefer real implementations when possible

### Assertions
- Use specific matchers (`toHaveTextContent` vs `toMatch`)
- Test user behavior, not implementation details
- Avoid testing library internals
- Test error states and edge cases

### Performance
- Avoid unnecessary re-renders in component tests
- Use `vi.mock()` for expensive operations
- Batch DOM queries when possible
- Use `cleanup` functions to prevent memory leaks

## 📖 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)

---

This testing setup provides comprehensive coverage across the entire monorepo while maintaining consistency and ease of use. The shared utilities and configurations ensure that tests are reliable, maintainable, and easy to write.