/**
 * Login Form Component for Mobile
 * Handles user authentication with email/password and OAuth providers
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@starter-template/database/auth';
import { isValidEmail } from '@starter-template/database/auth';
import { styles } from '../../styles/auth';

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo = '/(tabs)' }: LoginFormProps) {
  const router = useRouter();
  const auth = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Validate input
      if (!formData.email || !formData.password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      if (!isValidEmail(formData.email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      // Attempt sign in
      const { error } = await auth.signIn({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        Alert.alert('Sign In Failed', error.message);
        return;
      }

      // Navigate on success
      router.replace(redirectTo as any);
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'facebook' | 'apple') => {
    setIsLoading(true);

    try {
      const { error } = await auth.signInWithOAuth({
        provider,
        redirectTo: redirectTo,
      });

      if (error) {
        Alert.alert('OAuth Sign In Failed', error.message);
      }
    } catch (err) {
      Alert.alert('Error', 'OAuth sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!formData.email) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    if (!isValidEmail(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await auth.signInWithMagicLink({
        email: formData.email,
        redirectTo: redirectTo,
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Magic Link Sent', 'Check your email for the login link.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <Text style={styles.eyeButtonText}>
                {showPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.forgotPasswordContainer}>
          <Link href="/auth/forgot-password" style={styles.forgotPasswordLink}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </Link>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, isLoading && styles.disabledButton]}
          onPress={handleMagicLink}
          disabled={isLoading || !formData.email}
        >
          {isLoading ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <Text style={styles.secondaryButtonText}>Send Magic Link</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.oauthContainer}>
        <TouchableOpacity
          style={styles.oauthButton}
          onPress={() => handleOAuthSignIn('google')}
          disabled={isLoading}
        >
          <Text style={styles.oauthButtonText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.oauthButton}
          onPress={() => handleOAuthSignIn('apple')}
          disabled={isLoading}
        >
          <Text style={styles.oauthButtonText}>Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.oauthButton}
          onPress={() => handleOAuthSignIn('github')}
          disabled={isLoading}
        >
          <Text style={styles.oauthButtonText}>GitHub</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <Link href="/auth/signup" style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Sign up</Text>
          </Link>
        </Text>
      </View>
    </View>
  );
}