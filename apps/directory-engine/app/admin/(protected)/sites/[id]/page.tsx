import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Globe,
  MapPin,
  Layers,
  Building2,
  FileText,
} from 'lucide-react';
import { SyncSearchButton } from '@/components/admin/sync-search-button';
import { SubmissionActions } from '@/components/admin/submission-actions';
import { RefreshBusinessesButton } from '@/components/admin/refresh-businesses-button';
import { SiteAssetsForm } from '@/components/admin/site-assets-form';
import { AddSiteCategoriesForm } from '@/components/admin/add-site-categories-form';
import { AddSiteCitiesForm } from '@/components/admin/add-site-cities-form';
import { SyncBusinessesToSearchJobMeta } from '@white-crow/shared';

interface SiteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SiteDetailPage({ params }: SiteDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: site, error } = await supabase
    .from('sites')
    .select(
      `
      id,
      name,
      domain,
      hero_path,
      logo_path,
      favicon_path,
      created_at,
      updated_at,
      vertical:verticals(id, name, slug),
      state:states(id, name, code),
      site_categories(category:categories(id, name)),
      site_cities(city:cities(id, name)),
      site_businesses(count)
    `
    )
    .eq('id', id)
    .single();

  if (error || !site) {
    notFound();
  }

  const vertical = site.vertical as { id: string; name: string; slug: string };
  const state = site.state as { id: string; name: string; code: string };
  const categories = site.site_categories?.map((sc) => sc.category) || [];
  const cities = site.site_cities?.map((sc) => sc.city) || [];
  const categoryIds = categories.map((c) => (c as { id: string }).id);
  const cityIds = cities.map((c) => (c as { id: string }).id);
  const businessCount =
    (site.site_businesses as unknown as { count: number }[])?.[0]?.count || 0;

  // Get the last sync job for this site
  const { data: lastSyncJob } = await supabase
    .from('jobs')
    .select('id, status, progress, meta, error, finished_at, created_at')
    .eq('job_type', 'sync_businesses_to_search')
    .eq('payload->>siteId', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Get business submissions for this site
  const { data: submissions } = await supabase
    .from('business_submissions')
    .select(
      `
      id,
      business_name,
      business_email,
      business_website,
      status,
      submitted_at,
      category:categories(name),
      city:cities(name)
    `
    )
    .eq('site_id', id)
    .eq('status', 'pending')
    .order('submitted_at', { ascending: false });

  const searchIndexIsSynced =
    lastSyncJob?.status === 'completed' &&
    (lastSyncJob?.meta as SyncBusinessesToSearchJobMeta).synced_businesses ===
      businessCount;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/sites">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{site.name}</h1>
          <p className="mt-1 text-muted-foreground">
            Manage site configuration and search indexing.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vertical</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vertical?.name}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">State</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state?.name}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Businesses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Business categories included in this site. Adding new categories
              will associate existing businesses from the database that match
              those categories. To fetch new businesses from Google Places, use
              the Add Businesses page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={(cat as { id: string }).id}
                    className="rounded-full bg-secondary px-3 py-1 text-sm"
                  >
                    {(cat as { name: string }).name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No categories configured.
              </p>
            )}
            <div className="border-t pt-4">
              <p className="mb-2 text-sm font-medium">Add Categories</p>
              <AddSiteCategoriesForm
                siteId={site.id}
                verticalId={vertical.id}
                existingCategoryIds={categoryIds}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cities</CardTitle>
            <CardDescription>
              Cities covered by this site. Adding new cities will associate
              existing businesses from the database located in those cities. To
              fetch new businesses from Google Places, use the Add Businesses
              page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {cities.slice(0, 20).map((city) => (
                  <span
                    key={(city as { id: string }).id}
                    className="rounded-full bg-secondary px-3 py-1 text-sm"
                  >
                    {(city as { name: string }).name}
                  </span>
                ))}
                {cities.length > 20 && (
                  <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                    +{cities.length - 20} more
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No cities configured.
              </p>
            )}
            <div className="border-t pt-4">
              <p className="mb-2 text-sm font-medium">Add Cities</p>
              <AddSiteCitiesForm
                siteId={site.id}
                stateId={state.id}
                existingCityIds={cityIds}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Index</CardTitle>
          <CardDescription>
            Sync businesses to the search index for instant search results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lastSyncJob ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    lastSyncJob.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : lastSyncJob.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : lastSyncJob.status === 'processing'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {lastSyncJob.status}
                </span>
                <span className="text-sm text-muted-foreground">
                  {lastSyncJob.finished_at
                    ? `Finished ${new Date(lastSyncJob.finished_at).toLocaleDateString()} at ${new Date(lastSyncJob.finished_at).toLocaleTimeString()}`
                    : `Started ${new Date(lastSyncJob.created_at).toLocaleDateString()} at ${new Date(lastSyncJob.created_at).toLocaleTimeString()}`}
                </span>
              </div>
              {lastSyncJob.status === 'completed' && lastSyncJob.meta && (
                <p className="text-sm text-muted-foreground">
                  {(lastSyncJob.meta as SyncBusinessesToSearchJobMeta)
                    .synced_businesses ?? 0}{' '}
                  businesses indexed
                </p>
              )}
              {lastSyncJob.status === 'failed' && lastSyncJob.error && (
                <p className="text-sm text-red-600">{lastSyncJob.error}</p>
              )}
              {lastSyncJob.status === 'processing' && (
                <p className="text-sm text-muted-foreground">
                  Progress: {lastSyncJob.progress}%
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No previous sync. {businessCount} businesses will be indexed.
            </p>
          )}
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              {searchIndexIsSynced
                ? `Resync ${businessCount} businesses.`
                : `Index ${businessCount} businesses.`}
            </p>
            <SyncSearchButton siteId={site.id} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Data</CardTitle>
          <CardDescription>
            Refresh business data from Google Places to get latest ratings,
            reviews, hours, and contact info.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {businessCount} businesses will be refreshed.
          </p>
          <RefreshBusinessesButton
            siteId={site.id}
            businessCount={businessCount}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Site Assets</CardTitle>
          <CardDescription>
            Upload branding assets for this site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SiteAssetsForm
            siteId={site.id}
            siteDomain={site.domain}
            currentHeroPath={site.hero_path}
            currentLogoPath={site.logo_path}
            currentFaviconPath={site.favicon_path}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Submissions</CardTitle>
          <CardDescription>
            Review businesses submitted for inclusion in this directory. Upon
            approval, the business will be enriched with data from Google
            Places, and an email will notify the submitter to claim their
            listing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions && submissions.length > 0 ? (
            <ul className="space-y-3">
              {submissions.map((submission) => (
                <li
                  key={submission.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {submission.business_name}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          submission.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : submission.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {(submission.category as { name: string } | null)?.name} ·{' '}
                      {(submission.city as { name: string } | null)?.name}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {submission.business_email}
                      {submission.business_website && (
                        <> · {submission.business_website}</>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Submitted{' '}
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                  {submission.status === 'pending' && (
                    <SubmissionActions submissionId={submission.id} />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No business submissions yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
