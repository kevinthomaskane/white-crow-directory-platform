import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CompleteSignupForm } from '@/components/sites/claim/complete-signup-form';
import { claimBusinessAsUser } from '@/actions/claim-business';

interface PageProps {
  searchParams: Promise<{ siteBusinessId?: string }>;
}

export default async function ClaimVerifyPage({ searchParams }: PageProps) {
  const { siteBusinessId } = await searchParams;

  if (!siteBusinessId) {
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

  const supabase = await createClient();

  // Check if user is authenticated (via magic link)
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
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

  // Fetch profile to check has_password
  const { data: profile } = await supabase
    .from('profiles')
    .select('has_password')
    .eq('id', user.id)
    .single();

  // Fetch business details
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

  // If user already has a password, complete the claim directly
  if (profile?.has_password) {
    const result = await claimBusinessAsUser({ siteBusinessId });

    if (result.ok) {
      redirect(`/business/${business.id}`);
    }

    // If claim failed, show error
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Claim failed</h1>
          <p className="text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  // User doesn't have a password - show complete signup form
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <CompleteSignupForm
          siteBusinessId={siteBusinessId}
          businessName={business.name}
          email={user.email ?? ''}
        />
      </div>
    </div>
  );
}
