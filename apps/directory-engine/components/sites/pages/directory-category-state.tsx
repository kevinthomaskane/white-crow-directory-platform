import type { SiteConfig } from '@/lib/routing';

interface DirectoryCategoryStatePageProps {
  site: SiteConfig;
  category: string;
  state: string;
}

export function DirectoryCategoryStatePage({
  site,
  category,
  state,
}: DirectoryCategoryStatePageProps) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground capitalize">
          {site.basePath.replace(/-/g, ' ')} &rsaquo; {category.replace(/-/g, ' ')}
        </p>
        <h1 className="text-3xl font-bold tracking-tight capitalize">
          {category.replace(/-/g, ' ')} in {state.toUpperCase()}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse {category.replace(/-/g, ' ')} listings in {state.toUpperCase()}.
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Filter by City</h2>
        <div className="flex flex-wrap gap-2">
          {/* TODO: Fetch and display cities in this state */}
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
