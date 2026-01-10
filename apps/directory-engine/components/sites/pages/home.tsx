import type { SiteConfig, RouteContext } from '@/lib/types';
import { Hero } from '@/components/sites/hero';
import { CategoriesSection } from '@/components/sites/sections/categories-section';
import { PopularCitiesSection } from '@/components/sites/sections/popular-cities-section';
import { TopBusinessesSection } from '@/components/sites/sections/top-businesses-section';
import { MapSection } from '@/components/sites/sections/map-section';

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
  const businessTermSingular = site.vertical?.term_business ?? 'Business';

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

      <TopBusinessesSection
        siteId={site.id}
        basePath={basePath}
        ctx={ctx}
        title={`Top Rated ${businessTermSingular}s`}
        description={`Highest rated ${businessTerm} in our directory`}
      />

      <MapSection
        siteId={site.id}
        basePath={basePath}
        ctx={ctx}
        title={`Find ${businessTermSingular}s Near You`}
      />
    </div>
  );
}
