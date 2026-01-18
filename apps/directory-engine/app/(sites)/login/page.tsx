import Link from 'next/link';
import { LoginForm } from '@/components/sites/auth/login-form';
import { getSiteConfig } from '@/lib/data/site';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const siteConfig = await getSiteConfig();

  if (!siteConfig) {
    redirect('/');
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your credentials to sign in
          </p>
        </div>
        <LoginForm siteId={siteConfig.id} />
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
