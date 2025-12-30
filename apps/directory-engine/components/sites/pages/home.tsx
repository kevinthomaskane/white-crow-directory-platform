import type { SiteConfig, RouteContext } from '@/lib/routing';
import { SearchForm } from '@/components/sites/search-form';

interface HomePageProps {
  site: SiteConfig;
  ctx: RouteContext;
}

export function HomePage({ site, ctx }: HomePageProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to {site.name}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse our directory of listings.
        </p>
      </div>

      <SearchForm
        basePath={site.basePath}
        categories={ctx.categoryList}
        cities={ctx.cityList}
        className="mx-auto max-w-2xl"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PlaceholderCard title="Find by Category" />
        <PlaceholderCard title="Find by Location" />
        <PlaceholderCard title="Featured Listings" />
      </div>
    </div>
  );
}

function PlaceholderCard({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="font-medium">{title}</h3>
      <div className="mt-3 h-3 w-full rounded bg-muted" />
      <div className="mt-2 h-3 w-2/3 rounded bg-muted" />
    </div>
  );
}
