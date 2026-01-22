import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { BusinessEditForm } from '@/components/sites/account-listings/business-edit-form';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ManageListingPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: siteBusiness } = await supabase
    .from('site_businesses')
    .select(
      `
      id,
      claimed_at,
      plan,
      business:businesses!inner(
        id,
        name,
        description,
        phone,
        website,
        formatted_address,
        hours
      )
    `
    )
    .eq('id', id)
    .eq('claimed_by', user.id)
    .single();

  if (!siteBusiness) {
    notFound();
  }

  return (
    <div className="bg-muted/30 py-16">
      <div className="mx-auto max-w-6xl space-y-8 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Manage Listing
            </h1>
            <p className="text-muted-foreground">
              {siteBusiness.business.name}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/profile">Back to Profile</Link>
          </Button>
        </div>

        {siteBusiness.plan ? (
          <div className="rounded-lg border bg-card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-2">Current Plan</h2>
              <p className="text-muted-foreground capitalize">
                {siteBusiness.plan}
              </p>
            </div>
            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground">
                Premium listing management form coming soon.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href={`/profile/listings/${id}/subscription`}>
                  Manage Subscription
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-medium mb-6">Edit Business Information</h2>
            <BusinessEditForm
              siteBusinessId={siteBusiness.id}
              defaultValues={{
                name: siteBusiness.business.name,
                website: siteBusiness.business.website,
                phone: siteBusiness.business.phone,
                formatted_address: siteBusiness.business.formatted_address,
                hours: siteBusiness.business.hours as { weekday_text?: string[] } | null,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
