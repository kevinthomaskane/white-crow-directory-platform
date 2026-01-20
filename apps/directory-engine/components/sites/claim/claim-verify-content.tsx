'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { CompleteSignupForm } from '@/components/sites/claim/complete-signup-form';
import { LoadingSpinner } from '@/components/sites/loading-spinner';
import { claimBusinessAsUser } from '@/actions/claim-business';

type SiteBusinessData = {
  id: string;
  is_claimed: boolean;
  verification_email: string | null;
  business: {
    id: string;
    name: string;
  };
};

type ClaimVerifyContentProps = {
  siteBusiness: SiteBusinessData;
  businessUrl: string;
};

export function ClaimVerifyContent({
  siteBusiness,
  businessUrl,
}: ClaimVerifyContentProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const business = siteBusiness.business;

  console.log(businessUrl);
  // Fetch profile once user is available
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    supabase
      .from('profiles')
      .select('has_password')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setHasPassword(data?.has_password ?? false);
      });
  }, [user]);

  // Auto-claim if user has password
  useEffect(() => {
    if (hasPassword === true && !isClaiming && !claimError) {
      setIsClaiming(true);
      claimBusinessAsUser({ siteBusinessId: siteBusiness.id }).then(
        (result) => {
          if (result.ok) {
            router.push(businessUrl);
          } else {
            setClaimError(result.error);
            setIsClaiming(false);
          }
        }
      );
    }
  }, [
    hasPassword,
    siteBusiness.id,
    businessUrl,
    router,
    isClaiming,
    claimError,
  ]);

  // Loading state while auth is initializing
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // No user - session expired
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Session expired</h1>
          <p className="text-muted-foreground">
            Your verification session has expired. Please try claiming the
            business again.
          </p>
        </div>
      </div>
    );
  }

  // Loading profile or claiming
  if (hasPassword === null || isClaiming) {
    return (
      <LoadingSpinner
        message={isClaiming ? 'Claiming business...' : 'Loading...'}
      />
    );
  }

  // Claim failed
  if (claimError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Claim failed</h1>
          <p className="text-muted-foreground">{claimError}</p>
        </div>
      </div>
    );
  }

  // User doesn&apos;t have a password - show complete signup form
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <CompleteSignupForm
          siteBusinessId={siteBusiness.id}
          businessName={business.name}
          email={user.email ?? ''}
          businessUrl={businessUrl}
        />
      </div>
    </div>
  );
}
