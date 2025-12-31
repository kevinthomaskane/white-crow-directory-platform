import type { SiteConfig } from '@/lib/types';

interface DirectoryStatePageProps {
  site: SiteConfig;
  state: string;
}

export function DirectoryStatePage({ site, state }: DirectoryStatePageProps) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground capitalize">
          {(site.vertical?.slug ?? '').replace(/-/g, ' ')}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          {(site.vertical?.slug ?? '').replace(/-/g, ' ')} in {state.toUpperCase()}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse listings in {state.toUpperCase()} by category or city.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <div className="space-y-2">
            {/* TODO: Fetch and display categories */}
            <PlaceholderItem />
            <PlaceholderItem />
            <PlaceholderItem />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Cities</h2>
          <div className="space-y-2">
            {/* TODO: Fetch and display cities in this state */}
            <PlaceholderItem />
            <PlaceholderItem />
            <PlaceholderItem />
          </div>
        </section>
      </div>
    </div>
  );
}

function PlaceholderItem() {
  return <div className="h-10 rounded bg-muted" />;
}
