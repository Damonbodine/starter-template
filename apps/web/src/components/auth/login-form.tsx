/**
 * Login Form Component
 * Handles user authentication with email/password and OAuth providers
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@starter-template/ui/components/button';
import { Input } from '@starter-template/ui/components/input';
import { Label } from '@starter-template/ui/components/label';
import { Alert, AlertDescription } from '@starter-template/ui/components/alert';
import { Icons } from '@starter-template/ui/components/icons';
import { useAuth } from '../../lib/auth/context';
import { isValidEmail } from '@starter-template/database/auth';

interface LoginFormProps {
  redirectTo?: string;
  className?: string;
}

export function LoginForm({ redirectTo = '/dashboard', className }: LoginFormProps) {
  const router = useRouter();
  const auth = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate input
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }

      if (!isValidEmail(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Attempt sign in
      const { error } = await auth.signIn({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Redirect on success
      router.push(redirectTo);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'facebook') => {
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await auth.signInWithOAuth({
        provider,
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('OAuth sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const { error } = await auth.signInWithMagicLink({
        email: formData.email,
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      });

      if (error) {
        setError(error.message);
      } else {
        setError(null);
        // Show success message
        alert('Magic link sent! Check your email for the login link.');
      }
    } catch (err) {
      setError('Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto space-y-6 ${className}`}>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to your account</p>
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
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <Icons.eyeOff className="h-4 w-4" />
              ) : (
                <Icons.eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleMagicLink}
          disabled={isLoading || !formData.email}
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Send Magic Link
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn('google')}
          disabled={isLoading}
          className="w-full"
        >
          <Icons.google className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn('github')}
          disabled={isLoading}
          className="w-full"
        >
          <Icons.gitHub className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn('facebook')}
          disabled={isLoading}
          className="w-full"
        >
          <Icons.facebook className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center text-sm">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}