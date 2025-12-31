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
import { ArrowLeft, Globe, MapPin, Layers, Building2 } from 'lucide-react';
import { SyncSearchButton } from '@/components/admin/sync-search-button';
import { SiteAssetsForm } from '@/components/admin/site-assets-form';

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

  const categories = site.site_categories?.map((sc) => sc.category) || [];
  const cities = site.site_cities?.map((sc) => sc.city) || [];
  const businessCount =
    (site.site_businesses as unknown as { count: number }[])?.[0]?.count || 0;

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
            <div className="text-2xl font-bold">
              {(site.vertical as { name: string })?.name}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">State</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(site.state as { name: string; code: string })?.name}
            </div>
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
              Business categories included in this site.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cities</CardTitle>
            <CardDescription>Cities covered by this site.</CardDescription>
          </CardHeader>
          <CardContent>
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
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {businessCount} businesses will be indexed.
          </p>
          <SyncSearchButton siteId={site.id} />
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
    </div>
  );
}
