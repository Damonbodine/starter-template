/**
 * Login Screen for Mobile
 */

import React from 'react';
import { SafeAreaView } from 'react-native';
import { LoginForm } from '../../components/auth/LoginForm';

export default function LoginScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <LoginForm />
    </SafeAreaView>
  );
}