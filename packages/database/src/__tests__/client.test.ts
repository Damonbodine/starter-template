/**
 * Database Client Tests
 * Tests for Supabase client functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseClient } from '../client';
import { mockSupabaseClient } from 'test-utils';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create Supabase client with correct config', () => {
    const client = createSupabaseClient();
    expect(client).toBeDefined();
  });

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

  it('should handle database queries', async () => {
    const client = createSupabaseClient();
    const mockResponse = {
      data: [{ id: 1, name: 'Test' }],
      error: null,
    };

    mockSupabaseClient.from().select().mockResolvedValue(mockResponse);

    const { data, error } = await client
      .from('test_table')
      .select('*');

    expect(error).toBeNull();
    expect(data).toEqual([{ id: 1, name: 'Test' }]);
  });

  it('should handle database errors', async () => {
    const client = createSupabaseClient();
    const mockError = { message: 'Database error' };

    mockSupabaseClient.from().select().mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { data, error } = await client
      .from('test_table')
      .select('*');

    expect(data).toBeNull();
    expect(error).toEqual(mockError);
  });
});