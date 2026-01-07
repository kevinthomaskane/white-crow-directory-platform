import type { SiteConfig, RouteContext } from '@/lib/types';
import { Hero } from '@/components/sites/hero';
import { CategoriesSection } from '@/components/sites/sections/categories-section';
import { PopularCitiesSection } from '@/components/sites/sections/popular-cities-section';

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
  const basePath = site.vertical?.slug ?? '';
  const categoryTerm = site.vertical?.term_categories ?? 'Categories';
  const businessTerm = site.vertical?.term_businesses?.toLowerCase() ?? 'businesses';

  return (
    <div className="space-y-16">
      <Hero site={site} ctx={ctx} stats={stats} />

      <CategoriesSection
        categories={ctx.categoryList}
        basePath={basePath}
        title={`Browse ${categoryTerm}`}
        description={`Find ${businessTerm} by specialty`}
      />

      <PopularCitiesSection
        siteId={site.id}
        basePath={basePath}
        title="Popular Cities"
        description={`Browse ${businessTerm} by location`}
        totalCities={ctx.cityList.length}
      />

      <PlaceholderSection title="Top Listings" />
    </div>
  );
}

function PlaceholderSection({ title }: { title: string }) {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight mb-6">{title}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6">
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="mt-3 h-3 w-full rounded bg-muted" />
              <div className="mt-2 h-3 w-2/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
