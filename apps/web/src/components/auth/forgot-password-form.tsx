/**
 * Forgot Password Form Component
 * Handles password reset requests
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@starter-template/ui/components/button';
import { Input } from '@starter-template/ui/components/input';
import { Label } from '@starter-template/ui/components/label';
import { Alert, AlertDescription } from '@starter-template/ui/components/alert';
import { Icons } from '@starter-template/ui/components/icons';
import { useAuth } from '../../lib/auth/context';
import { isValidEmail } from '@starter-template/database/auth';

interface ForgotPasswordFormProps {
  className?: string;
}

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const auth = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate input
      if (!email) {
        setError('Please enter your email address');
        return;
      }

      if (!isValidEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Send password reset email
      const { error } = await auth.resetPassword({
        email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`w-full max-w-md mx-auto space-y-6 ${className}`}>
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Icons.check className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-muted-foreground mt-2">
            We've sent a password reset link to{' '}
            <span className="font-medium">{email}</span>
          </p>
        </div>

        <Alert>
          <Icons.info className="h-4 w-4" />
          <AlertDescription>
            The link will expire in 15 minutes. If you don't see the email, check your spam folder.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Button
            onClick={() => {
              setSuccess(false);
              setEmail('');
            }}
            variant="outline"
            className="w-full"
          >
            Try another email
          </Button>

          <div className="text-center text-sm">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto space-y-6 ${className}`}>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
            required
            autoFocus
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Send Reset Link
        </Button>
      </form>

      <div className="text-center text-sm">
        Remember your password?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}