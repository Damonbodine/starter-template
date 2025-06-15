/**
 * API Client Tests
 */

import { ApiClient, createApiClient } from '../client';
import { ApiError } from '../../errors/AppError';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = createApiClient({
      baseURL: 'https://api.example.com',
      timeout: 5000,
    });
    mockFetch.mockClear();
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.get('/users');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response);

      await client.get('/users', { params: { page: 1, limit: 10 } });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1&limit=10',
        expect.any(Object)
      );
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request', async () => {
      const postData = { name: 'John', email: 'john@example.com' };
      const mockResponse = { id: 1, ...postData };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.post('/users', postData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(postData),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error handling', () => {
    it('should throw ApiError for HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'User not found' }),
      } as Response);

      await expect(client.get('/users/999')).rejects.toThrow(ApiError);
    });

    it('should throw ApiError for network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.get('/users')).rejects.toThrow(ApiError);
    });
  });

  describe('Request interceptors', () => {
    it('should apply request interceptors', async () => {
      client.interceptors.request.push((config) => ({
        ...config,
        headers: {
          ...config.headers,
          'X-Custom-Header': 'test-value',
        },
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response);

      await client.get('/users');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'test-value',
          }),
        })
      );
    });
  });

  describe('Response interceptors', () => {
    it('should apply response interceptors', async () => {
      client.interceptors.response.push((response) => ({
        ...response,
        data: { ...response.data, intercepted: true },
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ original: true }),
      } as Response);

      const result = await client.get('/users');
      
      expect(result).toEqual({
        original: true,
        intercepted: true,
      });
    });
  });

  describe('Authentication', () => {
    it('should include Authorization header when token provided', async () => {
      client.setAuthToken('bearer-token-123');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response);

      await client.get('/users');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer bearer-token-123',
          }),
        })
      );
    });

    it('should clear Authorization header when token cleared', async () => {
      client.setAuthToken('bearer-token-123');
      client.clearAuthToken();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response);

      await client.get('/users');
      
      const callArgs = mockFetch.mock.calls[0][1] as RequestInit;
      const headers = callArgs.headers as Record<string, string>;
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe('Retry mechanism', () => {
    it('should retry failed requests', async () => {
      // First call fails, second call succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true }),
        } as Response);

      const result = await client.get('/users');
      
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true });
    });

    it('should respect maximum retry attempts', async () => {
      // All calls fail
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(client.get('/users')).rejects.toThrow();
      
      // Should try initial + 3 retries = 4 total
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });
  });
});