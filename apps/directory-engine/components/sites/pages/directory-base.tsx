import type { SiteConfig, RouteContext, SiteStats } from '@/lib/types';
import { SearchForm } from '@/components/sites/search-form';
import { CategoriesSection } from '@/components/sites/sections/categories-section';
import { PopularCitiesSection } from '@/components/sites/sections/popular-cities-section';
import { TopBusinessesSection } from '@/components/sites/sections/top-businesses-section';
import { MapSection } from '@/components/sites/sections/map-section';
import { getCollectionPageSchema } from '@/lib/schemas';
import { buildDirectoryUrl } from '@/lib/utils';

interface DirectoryBasePageProps {
  site: SiteConfig;
  ctx: RouteContext;
  stats?: SiteStats;
}

export function DirectoryBasePage({ site, ctx }: DirectoryBasePageProps) {
  const basePath = site.vertical?.slug ?? '';
  const categoryTerm = site.vertical?.term_category ?? 'Category';
  const categoryTermLower = categoryTerm.toLowerCase();
  const businessTerm = site.vertical?.term_business ?? 'Businesss';
  const businessTermLower = businessTerm.toLowerCase();
  const businessesTerm = site.vertical?.term_businesses ?? 'Businesses';
  const businessesTermLower = businessesTerm.toLowerCase();

  const hasMultipleCities = ctx.cityList.length > 1;
  const hasMultipleCategories = ctx.categoryList.length > 1;
  const singleCity = !hasMultipleCities;
  const singleCategory = !hasMultipleCategories;

  const pagePath = buildDirectoryUrl({ basePath, singleCity, singleCategory });
  const pageUrl = `https://${site.domain}${pagePath}`;
  const pageTitle = `Browse ${businessesTerm}`;
  const pageDescription = `Find the best ${businessesTerm.toLowerCase()} in our directory.`;

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getCollectionPageSchema(pageTitle, pageDescription, pageUrl)
          ),
        }}
      />
      {/* Header */}
      <div className="bg-muted/30 py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Browse {businessesTerm}
          </h1>
          <p className="text-muted-foreground mb-6">
            {hasMultipleCategories && hasMultipleCities
              ? `Search by ${categoryTermLower} or location to find the right ${businessTermLower} for you.`
              : hasMultipleCategories
                ? `Browse by ${categoryTermLower} to find the right ${businessTermLower} for you.`
                : hasMultipleCities
                  ? `Browse by location to find ${businessesTermLower} near you.`
                  : `Find the best ${businessesTermLower} in our directory.`}
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
        title={`Top Rated ${businessesTerm}`}
        description={`Highest rated ${businessesTermLower} in our directory`}
      />

      {/* Browse Sections */}
      {hasMultipleCategories && (
        <CategoriesSection
          className="bg-muted/90 pb-0 scroll-mt-16"
          categories={ctx.categoryList}
          basePath={basePath}
          title={`Browse by ${categoryTermLower}`}
          description={`Find ${businessesTermLower} by specialty`}
          limit={999}
          showViewAll={false}
        />
      )}

      {hasMultipleCities && (
        <PopularCitiesSection
          className="bg-muted/90 scroll-mt-16"
          cities={ctx.cityList}
          basePath={basePath}
          title="Browse by Location"
          description={`Find ${businessesTermLower} in your city`}
          limit={999}
        />
      )}

      <MapSection
        siteId={site.id}
        basePath={basePath}
        description={`Explore ${businessesTermLower} in your area`}
        ctx={ctx}
        title={`Find ${businessesTerm} Near You`}
      />
    </div>
  );
}
