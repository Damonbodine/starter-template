/**
 * Signup Form Component
 * Handles user registration with email/password and OAuth providers
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@starter-template/ui/components/button';
import { Input } from '@starter-template/ui/components/input';
import { Label } from '@starter-template/ui/components/label';
import { Checkbox } from '@starter-template/ui/components/checkbox';
import { Alert, AlertDescription } from '@starter-template/ui/components/alert';
import { Icons } from '@starter-template/ui/components/icons';
import { useAuth } from '../../lib/auth/context';
import { isValidEmail, validatePassword } from '@starter-template/database/auth';

interface SignupFormProps {
  redirectTo?: string;
  className?: string;
}

export function SignupForm({ redirectTo = '/dashboard', className }: SignupFormProps) {
  const router = useRouter();
  const auth = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptMarketing: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    score: number;
    issues: string[];
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (error) setError(null);

    // Validate password on change
    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate input
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        return;
      }

      if (!isValidEmail(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.issues[0]);
        return;
      }

      if (!formData.acceptTerms) {
        setError('Please accept the terms and conditions');
        return;
      }

      // Attempt sign up
      const { error } = await auth.signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`,
        metadata: {
          marketing_opt_in: formData.acceptMarketing,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Show success message and redirect
      alert('Account created successfully! Please check your email to verify your account.');
      router.push('/auth/verify-email');
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
      setError('OAuth sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score <= 1) return 'Very Weak';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className={`w-full max-w-md mx-auto space-y-6 ${className}`}>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground">Get started with your free account</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
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
              placeholder="Create a password"
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
          
          {passwordValidation && formData.password && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getPasswordStrengthColor(passwordValidation.score)}`}
                    style={{ width: `${(passwordValidation.score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {getPasswordStrengthText(passwordValidation.score)}
                </span>
              </div>
              {passwordValidation.issues.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-1">
                  {passwordValidation.issues.map((issue, index) => (
                    <li key={index} className="flex items-center space-x-1">
                      <span className="text-red-500">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <Icons.eyeOff className="h-4 w-4" />
              ) : (
                <Icons.eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))
              }
              disabled={isLoading}
            />
            <Label htmlFor="acceptTerms" className="text-sm">
              I agree to the{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="acceptMarketing"
              name="acceptMarketing"
              checked={formData.acceptMarketing}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, acceptMarketing: checked as boolean }))
              }
              disabled={isLoading}
            />
            <Label htmlFor="acceptMarketing" className="text-sm">
              I would like to receive marketing emails and updates
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !formData.acceptTerms}
        >
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
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
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}