/**
 * Next.js Middleware for Authentication
 * Handles route protection and authentication checks
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/admin',
];

// Routes that require specific roles
const roleProtectedRoutes: Record<string, string[]> = {
  '/admin': ['admin', 'super_admin'],
  '/dashboard/admin': ['admin', 'super_admin'],
  '/dashboard/users': ['admin', 'super_admin', 'moderator'],
  '/dashboard/content': ['admin', 'super_admin', 'moderator'],
};

// Routes that should redirect authenticated users
const guestOnlyRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    // Create Supabase client with request context
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      }
    );

    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();

    const isAuthenticated = !error && !!session?.user;
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isGuestOnlyRoute = guestOnlyRoutes.some(route => pathname.startsWith(route));
    const isRoleProtectedRoute = Object.keys(roleProtectedRoutes).some(route => 
      pathname.startsWith(route)
    );

    // Redirect authenticated users away from guest-only routes
    if (isAuthenticated && isGuestOnlyRoute) {
      const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Redirect unauthenticated users from protected routes
    if (!isAuthenticated && isProtectedRoute) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access for authenticated users
    if (isAuthenticated && isRoleProtectedRoute) {
      // Get user profile with role information
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session!.user.id)
        .single();

      const userRole = profile?.role;
      const requiredRoles = Object.entries(roleProtectedRoutes).find(([route]) => 
        pathname.startsWith(route)
      )?.[1];

      if (requiredRoles && (!userRole || !requiredRoles.includes(userRole))) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Add security headers
    const response = NextResponse.next();
    
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;"
    );

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, allow the request to proceed but log the issue
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};