/**
 * Email Verification Component
 * Displays email verification status and resend functionality
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@starter-template/ui/components/button';
import { Alert, AlertDescription } from '@starter-template/ui/components/alert';
import { Icons } from '@starter-template/ui/components/icons';
import { useAuth } from '../../lib/auth/context';

interface VerifyEmailProps {
  className?: string;
}

export function VerifyEmail({ className }: VerifyEmailProps) {
  const auth = useAuth();
  
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResendVerification = async () => {
    if (!auth.user?.email) {
      setError('No email address found');
      return;
    }

    setError(null);
    setIsResending(true);
    setResendSuccess(false);

    try {
      const { error } = await auth.signInWithMagicLink({
        email: auth.user.email,
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        setError(error.message);
      } else {
        setResendSuccess(true);
      }
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto space-y-6 ${className}`}>
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Icons.mail className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="text-muted-foreground mt-2">
          We've sent a verification link to{' '}
          {auth.user?.email && (
            <span className="font-medium">{auth.user.email}</span>
          )}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {resendSuccess && (
        <Alert>
          <Icons.check className="h-4 w-4" />
          <AlertDescription>
            Verification email sent successfully! Check your inbox.
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <Icons.info className="h-4 w-4" />
        <AlertDescription>
          Click the link in the email to verify your account. If you don't see the email, check your spam folder.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <Button
          onClick={handleResendVerification}
          variant="outline"
          className="w-full"
          disabled={isResending}
        >
          {isResending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Resend verification email
        </Button>

        <div className="flex items-center justify-between text-sm">
          <Link href="/auth/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
          
          <button
            onClick={() => auth.signOut()}
            className="text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        <p>
          Need help? Contact{' '}
          <a href="mailto:support@example.com" className="text-primary hover:underline">
            support@example.com
          </a>
        </p>
      </div>
    </div>
  );
}