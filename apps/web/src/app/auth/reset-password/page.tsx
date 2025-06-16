/**
 * Reset Password Page
 */

import { ResetPasswordForm } from '../../../components/auth/reset-password-form';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <ResetPasswordForm />
    </div>
  );
}