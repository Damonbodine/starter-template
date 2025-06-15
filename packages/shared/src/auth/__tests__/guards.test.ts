/**
 * Authentication Guards Tests
 */

import {
  isAuthenticated,
  isGuest,
  isVerified,
  requireRole,
  requirePermission,
  combineGuards,
  combineGuardsOr,
  createGuardWithRedirect,
  checkRouteAccess,
} from '../guards';
import { User } from '../types';

describe('Auth Guards', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    emailVerified: true,
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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const unverifiedUser: User = {
    ...mockUser,
    emailVerified: false,
  };

  describe('isAuthenticated', () => {
    it('should return true for authenticated user', () => {
      expect(isAuthenticated(mockUser)).toBe(true);
    });

    it('should return false for null user', () => {
      expect(isAuthenticated(null)).toBe(false);
    });
  });

  describe('isGuest', () => {
    it('should return true for null user', () => {
      expect(isGuest(null)).toBe(true);
    });

    it('should return false for authenticated user', () => {
      expect(isGuest(mockUser)).toBe(false);
    });
  });

  describe('isVerified', () => {
    it('should return true for verified user', () => {
      expect(isVerified(mockUser)).toBe(true);
    });

    it('should return false for unverified user', () => {
      expect(isVerified(unverifiedUser)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(isVerified(null)).toBe(false);
    });
  });

  describe('requireRole', () => {
    it('should return true when user has required role', () => {
      const guard = requireRole('admin');
      expect(guard(mockUser)).toBe(true);
    });

    it('should return false when user lacks required role', () => {
      const guard = requireRole('superadmin');
      expect(guard(mockUser)).toBe(false);
    });

    it('should return false for null user', () => {
      const guard = requireRole('admin');
      expect(guard(null)).toBe(false);
    });
  });

  describe('requirePermission', () => {
    it('should return true when user has required permission', () => {
      const guard = requirePermission('user', 'write');
      expect(guard(mockUser)).toBe(true);
    });

    it('should return false when user lacks required permission', () => {
      const guard = requirePermission('admin', 'delete');
      expect(guard(mockUser)).toBe(false);
    });

    it('should return false for null user', () => {
      const guard = requirePermission('user', 'read');
      expect(guard(null)).toBe(false);
    });
  });

  describe('combineGuards', () => {
    it('should return true when all guards pass', () => {
      const guard = combineGuards(isAuthenticated, isVerified);
      expect(guard(mockUser)).toBe(true);
    });

    it('should return false when any guard fails', () => {
      const guard = combineGuards(isAuthenticated, requireRole('superadmin'));
      expect(guard(mockUser)).toBe(false);
    });
  });

  describe('combineGuardsOr', () => {
    it('should return true when any guard passes', () => {
      const guard = combineGuardsOr(requireRole('superadmin'), requireRole('admin'));
      expect(guard(mockUser)).toBe(true);
    });

    it('should return false when all guards fail', () => {
      const guard = combineGuardsOr(requireRole('superadmin'), requireRole('moderator'));
      expect(guard(mockUser)).toBe(false);
    });
  });

  describe('createGuardWithRedirect', () => {
    it('should return allowed when guard passes', () => {
      const guard = createGuardWithRedirect(isAuthenticated, '/login');
      const result = guard(mockUser);
      
      expect(result.allowed).toBe(true);
      expect(result.redirect).toBeUndefined();
    });

    it('should return redirect when guard fails', () => {
      const guard = createGuardWithRedirect(isAuthenticated, '/login', 'Please login');
      const result = guard(null);
      
      expect(result.allowed).toBe(false);
      expect(result.redirect).toBe('/login');
      expect(result.message).toBe('Please login');
    });
  });

  describe('checkRouteAccess', () => {
    it('should allow access when all requirements are met', () => {
      const config = {
        path: '/admin',
        requireAuth: true,
        requireVerified: true,
        roles: ['admin'],
      };
      
      const result = checkRouteAccess(mockUser, config);
      expect(result.allowed).toBe(true);
    });

    it('should deny access when requirements are not met', () => {
      const config = {
        path: '/admin',
        requireAuth: true,
        roles: ['superadmin'],
        redirectPath: '/unauthorized',
      };
      
      const result = checkRouteAccess(mockUser, config);
      expect(result.allowed).toBe(false);
      expect(result.redirect).toBe('/unauthorized');
    });

    it('should deny access for null user when auth required', () => {
      const config = {
        path: '/dashboard',
        requireAuth: true,
      };
      
      const result = checkRouteAccess(null, config);
      expect(result.allowed).toBe(false);
      expect(result.redirect).toBe('/unauthorized');
    });
  });
});