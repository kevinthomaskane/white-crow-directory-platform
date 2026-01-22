import type { SiteConfig, RouteContext, SiteStats } from '@/lib/types';
import { SearchForm } from '@/components/sites/search-form';
import { CategoriesSection } from '@/components/sites/sections/categories-section';
import { PopularCitiesSection } from '@/components/sites/sections/popular-cities-section';
import { TopBusinessesSection } from '@/components/sites/sections/top-businesses-section';
import { MapSection } from '@/components/sites/sections/map-section';

interface DirectoryBasePageProps {
  site: SiteConfig;
  ctx: RouteContext;
  stats?: SiteStats;
}

export function DirectoryBasePage({ site, ctx }: DirectoryBasePageProps) {
  const basePath = site.vertical?.slug ?? '';
  const categoryTerm = site.vertical?.term_categories ?? 'Categories';
  const businessTerm =
    site.vertical?.term_businesses?.toLowerCase() ?? 'businesses';
  const businessTermSingular = site.vertical?.term_business ?? 'Business';

  const hasMultipleCities = ctx.cityList.length > 1;
  const hasMultipleCategories = ctx.categoryList.length > 1;

  return (
    <div>
      {/* Header */}
      <div className="bg-muted/30 py-16 px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Browse{' '}
            {businessTerm.charAt(0).toUpperCase() + businessTerm.slice(1)}
          </h1>
          <p className="text-muted-foreground mb-6">
            {hasMultipleCategories && hasMultipleCities
              ? `Search by ${categoryTerm.toLowerCase()} or location to find the right ${businessTermSingular.toLowerCase()} for you.`
              : hasMultipleCategories
                ? `Browse by ${categoryTerm.toLowerCase()} to find the right ${businessTermSingular.toLowerCase()} for you.`
                : hasMultipleCities
                  ? `Browse by location to find ${businessTerm} near you.`
                  : `Find the best ${businessTerm} in our directory.`}
          </p>

          {/* Search Form */}
          <SearchForm
            basePath={basePath}
            categories={ctx.categoryList}
            cities={ctx.cityList}
            className="max-w-3xl mx-auto"
          />
        </div>
      </div>
      <TopBusinessesSection
        siteId={site.id}
        basePath={basePath}
        ctx={ctx}
        title={`Top Rated ${businessTermSingular}s`}
        description={`Highest rated ${businessTerm} in our directory`}
      />

      {/* Browse Sections */}
      {hasMultipleCategories && (
        <CategoriesSection
          className="bg-muted/30 pb-0 scroll-mt-16"
          categories={ctx.categoryList}
          basePath={basePath}
          title={`Browse by ${categoryTerm}`}
          description={`Find ${businessTerm} by specialty`}
          limit={999}
          showViewAll={false}
        />
      )}

      {hasMultipleCities && (
        <PopularCitiesSection
          className="bg-muted/30 scroll-mt-16"
          siteId={site.id}
          basePath={basePath}
          title="Browse by Location"
          description={`Find ${businessTerm} in your city`}
          limit={999}
        />
      )}

      <MapSection
        siteId={site.id}
        basePath={basePath}
        ctx={ctx}
        title={`Find ${businessTermSingular}s Near You`}
      />
    </div>
  );
}
