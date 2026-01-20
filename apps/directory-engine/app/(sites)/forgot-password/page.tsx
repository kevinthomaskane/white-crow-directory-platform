import { ForgotPasswordForm } from '@/components/sites/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <div className="flex py-32 items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Reset your password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a link to reset your
            password.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
