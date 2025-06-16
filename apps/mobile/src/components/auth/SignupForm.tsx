/**
 * Signup Form Component for Mobile
 * Handles user registration with email/password and OAuth providers
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@starter-template/database/auth';
import { isValidEmail, validatePassword } from '@starter-template/database/auth';
import { styles } from '../../styles/auth';

interface SignupFormProps {
  redirectTo?: string;
}

export function SignupForm({ redirectTo = '/(tabs)' }: SignupFormProps) {
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Validate input
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      if (!isValidEmail(formData.email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        Alert.alert('Weak Password', passwordValidation.issues[0]);
        return;
      }

      if (!formData.acceptTerms) {
        Alert.alert('Error', 'Please accept the terms and conditions');
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
        Alert.alert('Sign Up Failed', error.message);
        return;
      }

      // Show success message and navigate
      Alert.alert(
        'Account Created',
        'Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/verify-email' as any),
          },
        ]
      );
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
        Alert.alert('OAuth Sign Up Failed', error.message);
      }
    } catch (err) {
      Alert.alert('Error', 'OAuth sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>Get started with your free account</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.nameContainer}>
          <View style={styles.nameInput}>
            <Text style={styles.label}>First name</Text>
            <TextInput
              style={styles.input}
              placeholder="John"
              value={formData.firstName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>
          <View style={styles.nameInput}>
            <Text style={styles.label}>Last name</Text>
            <TextInput
              style={styles.input}
              placeholder="Doe"
              value={formData.lastName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="john@example.com"
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
              placeholder="Create a password"
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              <Text style={styles.eyeButtonText}>
                {showConfirmPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <Text style={styles.errorText}>Passwords do not match</Text>
          )}
        </View>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setFormData(prev => ({ ...prev, acceptTerms: !prev.acceptTerms }))}
            disabled={isLoading}
          >
            <View style={[styles.checkboxBox, formData.acceptTerms && styles.checkboxChecked]}>
              {formData.acceptTerms && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              I agree to the Terms of Service and Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setFormData(prev => ({ ...prev, acceptMarketing: !prev.acceptMarketing }))}
            disabled={isLoading}
          >
            <View style={[styles.checkboxBox, formData.acceptMarketing && styles.checkboxChecked]}>
              {formData.acceptMarketing && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              I would like to receive marketing emails and updates
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            (isLoading || !formData.acceptTerms) && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={isLoading || !formData.acceptTerms}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Create Account</Text>
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
          Already have an account?{' '}
          <Link href="/auth/login" style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Sign in</Text>
          </Link>
        </Text>
      </View>
    </ScrollView>
  );
}