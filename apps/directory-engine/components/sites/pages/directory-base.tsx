import type { SiteConfig } from '@/lib/types';

interface DirectoryBasePageProps {
  site: SiteConfig;
}

export function DirectoryBasePage({ site }: DirectoryBasePageProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight capitalize">
          {(site.vertical?.slug ?? '').replace(/-/g, ' ')}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Search by category or location to find what you&apos;re looking for.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold mb-4">Popular Categories</h2>
          <div className="space-y-2">
            {/* TODO: Fetch and display categories */}
            <PlaceholderItem />
            <PlaceholderItem />
            <PlaceholderItem />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Popular Cities</h2>
          <div className="space-y-2">
            {/* TODO: Fetch and display cities */}
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
