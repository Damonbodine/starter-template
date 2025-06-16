/**
 * Auth Callback Page
 * Handles OAuth and magic link redirects
 */

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth/context';
import { Icons } from '@starter-template/ui/components/icons';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Wait for auth to initialize
      if (auth.isLoading) return;

      // Get redirect URL from query params
      const redirectTo = searchParams.get('redirect') || '/dashboard';

      if (auth.isAuthenticated) {
        // User is authenticated, redirect to intended destination
        router.replace(redirectTo);
      } else {
        // Authentication failed or user not authenticated
        router.replace('/auth/login?error=auth_callback_failed');
      }
    };

    handleAuthCallback();
  }, [auth.isAuthenticated, auth.isLoading, router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Icons.spinner className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}