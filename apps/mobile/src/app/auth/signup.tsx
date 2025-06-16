/**
 * Signup Screen for Mobile
 */

import React from 'react';
import { SafeAreaView } from 'react-native';
import { SignupForm } from '../../components/auth/SignupForm';

export default function SignupScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <SignupForm />
    </SafeAreaView>
  );
}