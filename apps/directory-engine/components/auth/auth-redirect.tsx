'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export function AuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient();
      const next = searchParams.get('next') ?? '/';

      // Check for error in URL (e.g., expired link)
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        setError(errorDescription || errorParam);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace(next);
      } else {
        setError('Unable to verify your email. Please try again.');
      }
    };

    handleAuthCallback();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-4 p-6">
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center">
            <h2 className="font-semibold text-destructive">
              Authentication Error
            </h2>
            <p className="mt-2 text-sm text-destructive">{error}</p>
          </div>
          <Link
            href="/signup"
            className="block text-center text-sm text-muted-foreground hover:underline"
          >
            Back to signup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Verifying your email...</p>
      </div>
    </div>
  );
}
