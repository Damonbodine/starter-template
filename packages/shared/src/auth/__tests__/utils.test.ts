/**
 * Authentication Utils Tests
 */

import {
  decodeToken,
  isTokenExpired,
  validateEmail,
  validatePassword,
  hasPermission,
  hasRole,
  generateDeviceId,
  maskSensitiveData,
} from '../utils';
import { User } from '../types';

describe('Auth Utils', () => {
  describe('decodeToken', () => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.Lh5PkGn3YniZOy_ZWz5_0VsXW6FjE8eEYVa6FQTQL5E';

    it('should decode valid JWT token', () => {
      const result = decodeToken(validToken);
      expect(result).toEqual({
        sub: '1234567890',
        name: 'John Doe',
        iat: 1516239022,
        exp: 9999999999,
      });
    });

    it('should return null for invalid token', () => {
      expect(decodeToken('invalid')).toBeNull();
      expect(decodeToken('a.b')).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for non-expired token', () => {
      const futureToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.abc';
      expect(isTokenExpired(futureToken)).toBe(false);
    });

    it('should return true for expired token', () => {
      const pastToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyMzkwMjJ9.abc';
      expect(isTokenExpired(pastToken)).toBe(true);
    });

    it('should return true for invalid token', () => {
      expect(isTokenExpired('invalid')).toBe(true);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('name.lastname@subdomain.domain.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for weak password', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('hasPermission', () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      displayName: 'Test User',
      roles: [
        {
          id: 'admin',
          name: 'admin',
          permissions: [
            { id: 'admin:read', name: 'Admin Read', resource: 'admin', action: 'read' }
          ]
        }
      ],
      permissions: [
        { id: 'user:write', name: 'User Write', resource: 'user', action: 'write' }
      ],
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return true for direct permission', () => {
      expect(hasPermission(mockUser, 'user', 'write')).toBe(true);
    });

    it('should return true for role permission', () => {
      expect(hasPermission(mockUser, 'admin', 'read')).toBe(true);
    });

    it('should return false for non-existent permission', () => {
      expect(hasPermission(mockUser, 'admin', 'delete')).toBe(false);
    });

    it('should return false for null user', () => {
      expect(hasPermission(null, 'user', 'read')).toBe(false);
    });
  });

  describe('hasRole', () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      displayName: 'Test User',
      roles: [
        { id: 'admin', name: 'admin', permissions: [] }
      ],
      permissions: [],
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return true for existing role', () => {
      expect(hasRole(mockUser, 'admin')).toBe(true);
    });

    it('should return false for non-existent role', () => {
      expect(hasRole(mockUser, 'user')).toBe(false);
    });

    it('should return false for null user', () => {
      expect(hasRole(null, 'admin')).toBe(false);
    });
  });

  describe('generateDeviceId', () => {
    it('should generate unique device IDs', () => {
      const id1 = generateDeviceId();
      const id2 = generateDeviceId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask password fields', () => {
      const data = { username: 'user', password: 'secret' };
      const result = maskSensitiveData(data);
      
      expect(result.username).toBe('user');
      expect(result.password).toBe('***');
    });

    it('should mask token fields', () => {
      const data = { accessToken: 'abc123', refreshToken: 'def456' };
      const result = maskSensitiveData(data);
      
      expect(result.accessToken).toBe('***');
      expect(result.refreshToken).toBe('***');
    });

    it('should handle nested objects', () => {
      const data = {
        user: { id: 1, token: 'secret' },
        config: { apiKey: 'hidden' }
      };
      const result = maskSensitiveData(data);
      
      expect(result.user.id).toBe(1);
      expect(result.user.token).toBe('***');
    });

    it('should handle arrays', () => {
      const data = [{ password: 'secret' }, { token: 'hidden' }];
      const result = maskSensitiveData(data);
      
      expect(result[0].password).toBe('***');
      expect(result[1].token).toBe('***');
    });
  });
});