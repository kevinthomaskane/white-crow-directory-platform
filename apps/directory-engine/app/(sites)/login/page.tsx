import { LoginForm } from '@/components/sites/auth/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex py-32 items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account. Forgot your password?{' '}
            <Link
              href="/forgot-password"
              className="text-sm underline text-accent-foreground hover:text-foreground"
            >
              Click here.
            </Link>
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account? To create one, find your business listing
          and click &quot;Claim This Business&quot;
        </p>
        <p></p>
      </div>
    </div>
  );
}
