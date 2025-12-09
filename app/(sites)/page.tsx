import { headers } from 'next/headers';

export default async function SiteHomePage() {
  const headersList = await headers();
  const site = headersList.get('x-site') || '';

  // TODO: Fetch listings from database filtered by site config
  // const siteConfig = await getSiteConfig(site)
  // const listings = await getListings(siteConfig.filters)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome
        </h2>
        <p className="mt-1 text-muted-foreground">
          Browse our directory of listings.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted p-6">
        <p className="text-sm text-muted-foreground">
          Site identifier:{' '}
          <code className="font-mono text-foreground">{site}</code>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Listings will be fetched based on this site&apos;s configuration.
        </p>
      </div>

      {/* TODO: ListingGrid component */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PlaceholderCard />
        <PlaceholderCard />
        <PlaceholderCard />
      </div>
    </div>
  );
}

function PlaceholderCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="mt-3 h-3 w-full rounded bg-muted" />
      <div className="mt-2 h-3 w-2/3 rounded bg-muted" />
    </div>
  );
}
