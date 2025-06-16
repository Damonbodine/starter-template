/**
 * Authentication E2E Tests
 * End-to-end tests for authentication flows
 */

import { test, expect } from './fixtures';

test.describe('Authentication', () => {
  test('should allow user to sign up', async ({ page, pageUtils }) => {
    await page.goto('/signup');
    
    // Fill signup form
    await page.fill('[data-testid="email-input"]', 'newuser@example.com');
    await page.fill('[data-testid="password-input"]', 'securepassword');
    await page.fill('[data-testid="confirm-password-input"]', 'securepassword');
    await page.fill('[data-testid="full-name-input"]', 'New User');
    
    // Submit form
    await page.click('[data-testid="signup-button"]');
    
    // Should redirect to verification page or dashboard
    await expect(page).toHaveURL(/\/(verify|dashboard)/);
  });

  test('should allow user to sign in', async ({ page, pageUtils }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Should show user menu
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });

  test('should allow user to sign out', async ({ authenticatedPage, pageUtils }) => {
    // User is already authenticated via fixture
    
    // Click user menu
    await authenticatedPage.click('[data-testid="user-menu"]');
    
    // Click logout
    await authenticatedPage.click('[data-testid="logout-button"]');
    
    // Should redirect to home page
    await expect(authenticatedPage).toHaveURL('/');
    
    // Should not show user menu
    await expect(authenticatedPage.locator('[data-testid="user-menu"]')).not.toBeVisible();
  });

  test('should protect authenticated routes', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should handle forgot password flow', async ({ page }) => {
    await page.goto('/login');
    
    // Click forgot password link
    await page.click('[data-testid="forgot-password-link"]');
    
    // Should go to forgot password page
    await expect(page).toHaveURL('/forgot-password');
    
    // Fill email
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    
    // Submit form
    await page.click('[data-testid="reset-password-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should handle OAuth login', async ({ page }) => {
    await page.goto('/login');
    
    // Click Google OAuth button
    await page.click('[data-testid="google-oauth-button"]');
    
    // Should redirect to OAuth provider (we'll mock this in real tests)
    // For now, just check that the button exists and is clickable
    await expect(page.locator('[data-testid="google-oauth-button"]')).toBeEnabled();
  });
});