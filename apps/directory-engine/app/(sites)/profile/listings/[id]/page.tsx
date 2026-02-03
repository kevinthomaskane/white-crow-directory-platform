import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { BusinessEditForm } from '@/components/sites/account-listings/business-edit-form';
import { BusinessPremiumSection } from '@/components/sites/account-listings/business-premium-section';
import { BusinessMediaSection } from '@/components/sites/account-listings/business-media-section';
import { BadgeEmbedSection } from '@/components/sites/account-listings/badge-embed-section';
import type { BusinessHours } from '@/lib/types';
import { getRouteContext, getSiteConfig } from '@/lib/data/site';
import { buildDirectoryUrl, slugify } from '@/lib/utils';

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

  const site = await getSiteConfig();
  if (!site) {
    return notFound();
  }
  const ctx = await getRouteContext(site);

  const { data: siteBusiness } = await supabase
    .from('site_businesses')
    .select(
      `
      id,
      claimed_at,
      plan,
      description,
      main_photo,
      site_id,
      site:sites!inner(
        id,
        name,
        domain
      ),
      business:businesses!inner(
        id,
        name,
        phone,
        website,
        formatted_address,
        hours,
        main_photo_name,
        city
      ),
      media:site_business_media(
        id,
        type,
        file_path,
        embed_url,
        alt_text,
        sort_order
      )
    `
    )
    .eq('id', id)
    .eq('site_id', site.id)
    .eq('claimed_by', user.id)
    .order('sort_order', {
      referencedTable: 'site_business_media',
      ascending: true,
    })
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

        {siteBusiness.plan && (
          <BadgeEmbedSection
            siteBusinessId={siteBusiness.id}
            siteDomain={siteBusiness.site.domain}
            siteName={siteBusiness.site.name}
            businessUrl={buildDirectoryUrl({
              basePath: site.vertical?.slug ?? '',
              categorySlug: ctx.categoryList[0]?.slug,
              citySlug: siteBusiness.business.city
                ? slugify(siteBusiness.business.city)
                : ctx.cityList[0]?.slug,
              businessId: siteBusiness.business.id,
              singleCity: ctx.cityList.length === 1,
              singleCategory: ctx.categoryList.length === 1,
            })}
          />
        )}

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-medium mb-6">
            Edit Business Information
          </h2>
          <BusinessEditForm
            siteBusinessId={siteBusiness.id}
            defaultValues={{
              name: siteBusiness.business.name,
              website: siteBusiness.business.website,
              phone: siteBusiness.business.phone,
              formatted_address: siteBusiness.business.formatted_address,
              hours: siteBusiness.business.hours as BusinessHours | null,
            }}
          />
        </div>

        <BusinessPremiumSection
          siteBusinessId={siteBusiness.id}
          siteDomain={siteBusiness.site.domain}
          plan={siteBusiness.plan}
          initialDescription={siteBusiness.description}
          initialMainPhoto={
            siteBusiness.main_photo ?? siteBusiness.business.main_photo_name
          }
        />

        <BusinessMediaSection
          siteBusinessId={siteBusiness.id}
          siteDomain={siteBusiness.site.domain}
          plan={siteBusiness.plan}
          initialMedia={siteBusiness.media.filter(
            (m): m is typeof m & { file_path: string } =>
              m.type === 'image' && m.file_path !== null
          )}
          initialVideo={
            siteBusiness.media.find(
              (m): m is typeof m & { embed_url: string } =>
                m.type === 'video' && m.embed_url !== null
            ) ?? null
          }
        />
      </div>
    </div>
  );
}
