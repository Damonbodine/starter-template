/**
 * Legacy constants file - now re-exports from constants directory
 * @deprecated Use imports from './constants/' directory instead
 */

// Re-export all constants from the new organized structure
export * from './constants';

// Legacy exports for backward compatibility
export const APP_NAME = 'Starter Template';

export const API_ENDPOINTS = {
  users: '/api/users',
  auth: '/api/auth',
} as const;

export const COLORS = {
  primary: '#007bff',
  secondary: '#6c757d',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
} as const;

export const BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;