/**
 * Playwright Test Fixtures
 * Custom fixtures for E2E tests
 */

import { test as base, expect } from '@playwright/test';
import { Page } from '@playwright/test';

// Define test fixtures
type TestFixtures = {
  authenticatedPage: Page;
  apiUtils: {
    createTestUser: () => Promise<any>;
    deleteTestUser: (userId: string) => Promise<void>;
    createTestData: () => Promise<any>;
    cleanupTestData: () => Promise<void>;
  };
  pageUtils: {
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    waitForPageLoad: () => Promise<void>;
    takeScreenshot: (name: string) => Promise<void>;
  };
};

// Extend base test with custom fixtures
export const test = base.extend<TestFixtures>({
  // Authenticated page fixture
  authenticatedPage: async ({ page, pageUtils }, use) => {
    // Set up authentication
    await pageUtils.login('test@example.com', 'password');
    await use(page);
    // Cleanup
    await pageUtils.logout();
  },

  // API utilities fixture
  apiUtils: async ({}, use) => {
    const utils = {
      createTestUser: async () => {
        // Create a test user via API
        const response = await fetch('/api/test/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `test-${Date.now()}@example.com`,
            password: 'testpassword',
            full_name: 'Test User',
          }),
        });
        return response.json();
      },

      deleteTestUser: async (userId: string) => {
        // Delete test user via API
        await fetch(`/api/test/users/${userId}`, {
          method: 'DELETE',
        });
      },

      createTestData: async () => {
        // Create test data via API
        const response = await fetch('/api/test/data', {
          method: 'POST',
        });
        return response.json();
      },

      cleanupTestData: async () => {
        // Clean up test data via API
        await fetch('/api/test/cleanup', {
          method: 'POST',
        });
      },
    };

    await use(utils);

    // Cleanup after test
    await utils.cleanupTestData();
  },

  // Page utilities fixture
  pageUtils: async ({ page }, use) => {
    const utils = {
      login: async (email: string, password: string) => {
        await page.goto('/login');
        await page.fill('[data-testid="email-input"]', email);
        await page.fill('[data-testid="password-input"]', password);
        await page.click('[data-testid="login-button"]');
        await page.waitForURL('/dashboard');
      },

      logout: async () => {
        await page.click('[data-testid="user-menu"]');
        await page.click('[data-testid="logout-button"]');
        await page.waitForURL('/');
      },

      waitForPageLoad: async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('[data-testid="page-loaded"]', { timeout: 10000 });
      },

      takeScreenshot: async (name: string) => {
        await page.screenshot({ 
          path: `test-results/screenshots/${name}.png`,
          fullPage: true 
        });
      },
    };

    await use(utils);
  },
});

export { expect } from '@playwright/test';