import type { SiteConfig, RouteContext } from '@/lib/types';
import { Hero } from '@/components/sites/hero';

interface HomePageProps {
  site: SiteConfig;
  ctx: RouteContext;
  stats?: {
    businessCount?: number;
    categoryCount?: number;
    cityCount?: number;
  };
}

export function HomePage({ site, ctx, stats }: HomePageProps) {
  return (
    <div className="space-y-12">
      <Hero site={site} ctx={ctx} stats={stats} />

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
