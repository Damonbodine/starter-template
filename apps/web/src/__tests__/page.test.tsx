/**
 * Web App Page Tests
 * Tests for Next.js pages and components
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from 'test-utils';

// Mock Next.js modules
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

// Mock a simple page component
const HomePage = () => {
  return (
    <div data-testid="home-page">
      <h1>Welcome to Starter Template</h1>
      <p>A comprehensive monorepo starter template</p>
    </div>
  );
};

describe('Home Page', () => {
  it('should render home page content', () => {
    const { getByTestId, getByRole } = renderWithProviders(<HomePage />);
    
    expect(getByTestId('home-page')).toBeInTheDocument();
    expect(getByRole('heading', { level: 1 })).toHaveTextContent('Welcome to Starter Template');
  });

  it('should display description', () => {
    const { getByText } = renderWithProviders(<HomePage />);
    
    expect(getByText('A comprehensive monorepo starter template')).toBeInTheDocument();
  });
});