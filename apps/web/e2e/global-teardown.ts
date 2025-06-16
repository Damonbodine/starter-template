/**
 * Playwright Global Teardown
 * Cleanup that runs after all tests
 */

import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up after E2E tests...');

  try {
    // Clean up any global resources
    // This is where you would clean up test data,
    // reset database state, etc.
    
    console.log('✅ Global teardown complete');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw here as it would fail the entire test suite
  }
}

export default globalTeardown;