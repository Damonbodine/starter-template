/**
 * Navigation E2E Tests
 * End-to-end tests for application navigation
 */

import { test, expect } from './fixtures';

test.describe('Navigation', () => {
  test('should navigate through main pages', async ({ page }) => {
    // Start at home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Starter Template/);
    
    // Check home page content
    await expect(page.locator('h1')).toContainText(/Welcome/i);
    
    // Navigate to about page (if it exists)
    const aboutLink = page.locator('a[href="/about"]');
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL('/about');
    }
    
    // Navigate to login page
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    
    // Navigate to signup page
    await page.goto('/signup');
    await expect(page).toHaveURL('/signup');
    await expect(page.locator('[data-testid="signup-form"]')).toBeVisible();
  });

  test('should show responsive navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test desktop navigation
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
    
    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile menu should be hidden initially
    await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
    
    // Click mobile menu button
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Mobile menu should be visible
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('should navigate in authenticated area', async ({ authenticatedPage }) => {
    // Start at dashboard
    await expect(authenticatedPage).toHaveURL('/dashboard');
    
    // Navigate to profile
    await authenticatedPage.click('[data-testid="profile-link"]');
    await expect(authenticatedPage).toHaveURL('/profile');
    
    // Navigate to settings
    await authenticatedPage.click('[data-testid="settings-link"]');
    await expect(authenticatedPage).toHaveURL('/settings');
    
    // Navigate back to dashboard
    await authenticatedPage.click('[data-testid="dashboard-link"]');
    await expect(authenticatedPage).toHaveURL('/dashboard');
  });

  test('should handle 404 page', async ({ page }) => {
    await page.goto('/nonexistent-page');
    
    // Should show 404 page
    await expect(page.locator('[data-testid="404-page"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText(/404|Not Found/i);
    
    // Should have link back to home
    await page.click('[data-testid="home-link"]');
    await expect(page).toHaveURL('/');
  });

  test('should handle breadcrumbs', async ({ authenticatedPage }) => {
    // Navigate to a nested page
    await authenticatedPage.goto('/dashboard/settings/profile');
    
    // Check breadcrumbs
    await expect(authenticatedPage.locator('[data-testid="breadcrumbs"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="breadcrumb-dashboard"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="breadcrumb-settings"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="breadcrumb-profile"]')).toBeVisible();
    
    // Click on dashboard breadcrumb
    await authenticatedPage.click('[data-testid="breadcrumb-dashboard"]');
    await expect(authenticatedPage).toHaveURL('/dashboard');
  });
});