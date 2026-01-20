'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { ResetPasswordForm } from '@/components/sites/auth/reset-password-form';
import { LoadingSpinner } from '@/components/sites/loading-spinner';

export function ResetPasswordContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="flex py-32 items-center justify-center">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Invalid or expired link
            </h1>
            <p className="text-sm text-muted-foreground">
              This password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block text-sm text-primary hover:underline"
            >
              Request new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex py-32 items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Set new password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
