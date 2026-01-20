import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { ClaimVerifyContent } from '@/components/sites/claim/claim-verify-content';
import { LoadingSpinner } from '@/components/sites/loading-spinner';

interface PageProps {
  searchParams: Promise<{ siteBusinessId?: string; businessUrl?: string }>;
}

async function ClaimVerifyLoader({
  siteBusinessId,
  businessUrl,
}: {
  siteBusinessId: string;
  businessUrl: string;
}) {
  const supabase = await createClient();

  const { data: siteBusiness } = await supabase
    .from('site_businesses')
    .select(
      `
      id,
      is_claimed,
      verification_email,
      business:businesses!inner(id, name)
    `
    )
    .eq('id', siteBusinessId)
    .single();

  if (!siteBusiness) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Business not found</h1>
          <p className="text-muted-foreground">
            The business you&apos;re trying to claim could not be found.
          </p>
        </div>
      </div>
    );
  }

  if (siteBusiness.is_claimed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Already claimed</h1>
          <p className="text-muted-foreground">
            This business has already been claimed.
          </p>
        </div>
      </div>
    );
  }

  const business = siteBusiness.business as { id: string; name: string };

  return (
    <ClaimVerifyContent
      siteBusiness={{
        id: siteBusiness.id,
        is_claimed: siteBusiness.is_claimed ?? false,
        verification_email: siteBusiness.verification_email,
        business,
      }}
      businessUrl={businessUrl}
    />
  );
}

export default async function ClaimVerifyPage({ searchParams }: PageProps) {
  const { siteBusinessId, businessUrl } = await searchParams;

  if (!siteBusinessId || !businessUrl) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Invalid link</h1>
          <p className="text-muted-foreground">
            This verification link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ClaimVerifyLoader
        siteBusinessId={siteBusinessId}
        businessUrl={businessUrl}
      />
    </Suspense>
  );
}
