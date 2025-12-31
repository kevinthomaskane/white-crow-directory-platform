import type { SiteConfig } from '@/lib/types';

interface DirectoryCityPageProps {
  site: SiteConfig;
  city: string;
}

export function DirectoryCityPage({ site, city }: DirectoryCityPageProps) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground capitalize">
          {(site.vertical?.slug ?? '').replace(/-/g, ' ')} &rsaquo; {site.state?.code ?? ''}
        </p>
        <h1 className="text-3xl font-bold tracking-tight capitalize">
          {(site.vertical?.slug ?? '').replace(/-/g, ' ')} in {city.replace(/-/g, ' ')}, {site.state?.code ?? ''}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse listings in {city.replace(/-/g, ' ')}, {site.state?.code ?? ''} by category.
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {/* TODO: Fetch and display categories */}
          <PlaceholderChip />
          <PlaceholderChip />
          <PlaceholderChip />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Results</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* TODO: Fetch and display businesses */}
          <PlaceholderCard />
          <PlaceholderCard />
          <PlaceholderCard />
        </div>
      </section>
    </div>
  );
}

function PlaceholderChip() {
  return <div className="h-8 w-24 rounded-full bg-muted" />;
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
