import type { SiteConfig } from '@/lib/routing';

interface DirectoryBusinessPageProps {
  site: SiteConfig;
  category: string;
  city: string;
  state: string;
  businessId: string;
}

export function DirectoryBusinessPage({
  site,
  category,
  city,
  state,
  businessId,
}: DirectoryBusinessPageProps) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground capitalize">
          {site.basePath.replace(/-/g, ' ')} &rsaquo; {category.replace(/-/g, ' ')} &rsaquo;{' '}
          {city.replace(/-/g, ' ')}, {state.toUpperCase()}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          {/* TODO: Fetch business name */}
          Business Profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          Business ID: {businessId}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            {/* TODO: Fetch and display business details */}
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            {/* TODO: Fetch and display reviews */}
            <div className="space-y-4">
              <PlaceholderReview />
              <PlaceholderReview />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Contact</h2>
            {/* TODO: Fetch and display contact info */}
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Hours</h2>
            {/* TODO: Fetch and display hours */}
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function PlaceholderReview() {
  return (
    <div className="border-b border-border pb-4 last:border-0">
      <div className="h-4 w-1/4 rounded bg-muted" />
      <div className="mt-2 h-3 w-full rounded bg-muted" />
      <div className="mt-1 h-3 w-2/3 rounded bg-muted" />
    </div>
  );
}
