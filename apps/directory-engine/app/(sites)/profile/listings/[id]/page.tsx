import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { BusinessEditForm } from '@/components/sites/account-listings/business-edit-form';
import type { SiteBusinessOverrides } from '@/lib/types';

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
      overrides,
      site:sites!inner(
        domain
      ),
      business:businesses!inner(
        id,
        name,
        description,
        phone,
        website,
        formatted_address,
        hours,
        editorial_summary,
        main_photo_name
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

        {siteBusiness.plan && (
          <div className="rounded-lg border bg-card p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">Current Plan</h2>
              <p className="text-muted-foreground capitalize">
                {siteBusiness.plan}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/profile/listings/${id}/subscription`}>
                Manage Subscription
              </Link>
            </Button>
          </div>
        )}

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-medium mb-6">Edit Business Information</h2>
          {(() => {
            const overrides = siteBusiness.overrides as SiteBusinessOverrides | null;
            return (
              <BusinessEditForm
                siteBusinessId={siteBusiness.id}
                siteDomain={siteBusiness.site.domain}
                plan={siteBusiness.plan}
                defaultValues={{
                  name: overrides?.name ?? siteBusiness.business.name,
                  website: overrides?.website ?? siteBusiness.business.website,
                  phone: overrides?.phone ?? siteBusiness.business.phone,
                  formatted_address: overrides?.formatted_address ?? siteBusiness.business.formatted_address,
                  hours: (overrides?.hours ?? siteBusiness.business.hours) as { weekday_text?: string[] } | null,
                  editorial_summary: overrides?.editorial_summary ?? siteBusiness.business.editorial_summary,
                  main_photo_name: overrides?.main_photo_name ?? siteBusiness.business.main_photo_name,
                }}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
}
