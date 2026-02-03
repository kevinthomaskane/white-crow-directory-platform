import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { UpdateEmailForm } from '@/components/sites/profile/update-email-form';
import { Button } from '@/components/ui/button';
import { getSiteConfig } from '@/lib/data/site';

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const site = await getSiteConfig();

  if (!site) {
    return notFound();
  }
  // Fetch user's claimed businesses
  const { data: claimedBusinesses } = await supabase
    .from('site_businesses')
    .select(
      `
      id,
      claimed_at,
      plan,
      site_id,
      business:businesses!inner(
        id,
        name
      )
    `
    )
    .eq('claimed_by', user.id)
    .eq('site_id', site.id)
    .eq('is_claimed', true);

  const displayName =
    (user.user_metadata?.display_name as string) ||
    user.email?.split('@')[0] ||
    'User';

  return (
    <div className="bg-muted/30 py-16">
      <div className="mx-auto max-w-6xl px-4 space-y-12">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Account</h1>
          <p className="text-muted-foreground">Welcome back, {displayName}</p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium">Account Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage your account information
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-medium mb-4">Email Address</h3>
            <UpdateEmailForm currentEmail={user.email ?? ''} />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium">Your Claimed Businesses</h2>
            <p className="text-sm text-muted-foreground">
              Businesses you own and manage
            </p>
          </div>

          {claimedBusinesses && claimedBusinesses.length > 0 ? (
            <div className="grid gap-4">
              {claimedBusinesses.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{item.business.name}</h3>
                      {item.plan && (
                        <span className="text-xs font-medium text-premium-foreground bg-premium px-2 py-0.5 rounded-full">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Claimed on{' '}
                      {new Date(item.claimed_at!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/profile/listings/${item.id}`}>
                        Manage Listing
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                You haven&apos;t claimed any businesses yet.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Find your business listing and click &quot;Claim This
                Business&quot; to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
