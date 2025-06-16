/**
 * Signup Page
 */

import { SignupForm } from '../../../components/auth/signup-form';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <SignupForm />
    </div>
  );
}