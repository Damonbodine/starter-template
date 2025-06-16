/**
 * Shared Utils Tests
 * Unit tests for shared utility functions
 */

import { describe, it, expect, vi } from 'vitest';
import { formatDate, isValidEmail, debounce, throttle } from '../utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2023-01-01T12:00:00Z');
    const formatted = formatDate(date);
    expect(formatted).toMatch(/Jan.*1.*2023/);
  });

  it('should handle invalid date', () => {
    const result = formatDate(new Date('invalid'));
    expect(result).toBe('Invalid Date');
  });
});

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('debounce', () => {
  it('should debounce function calls', async () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(fn).not.toHaveBeenCalled();

    await new Promise(resolve => setTimeout(resolve, 150));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to debounced function', async () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 50);

    debouncedFn('arg1', 'arg2');

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('throttle', () => {
  it('should throttle function calls', async () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(fn).toHaveBeenCalledTimes(1);

    await new Promise(resolve => setTimeout(resolve, 150));
    
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});