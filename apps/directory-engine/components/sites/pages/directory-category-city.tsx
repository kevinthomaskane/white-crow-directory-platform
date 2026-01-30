import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type {
  SiteConfig,
  RouteContext,
  CategoryData,
  CityData,
} from '@/lib/types';
import {
  getBusinessesByCategoryAndCity,
  getFeaturedBusinesses,
} from '@/lib/data/site';
import { SearchForm } from '@/components/sites/search-form';
import { BusinessListings } from '@/components/sites/business-listings';
import { BusinessListingsSkeleton } from '@/components/sites/business-listings-skeleton';

interface DirectoryCategoryCityPageProps {
  site: SiteConfig;
  ctx: RouteContext;
  category: CategoryData;
  city: CityData;
  page?: number;
}

const ITEMS_PER_PAGE = 12;

export function DirectoryCategoryCityPage({
  site,
  ctx,
  category,
  city,
  page = 1,
}: DirectoryCategoryCityPageProps) {
  const basePath = site.vertical?.slug ?? '';
  const businessTerm =
    site.vertical?.term_businesses?.toLowerCase() ?? 'businesses';
  const businessTermSingular = site.vertical?.term_business ?? 'Business';

  return (
    <div>
      {/* Header */}
      <div className="bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href={`/${basePath}`} className="hover:text-foreground">
              {site.vertical?.term_businesses ?? 'Directory'}
            </Link>
            {ctx.categoryList.length > 1 && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link
                  href={`/${basePath}/${category.slug}`}
                  className="hover:text-foreground"
                >
                  {category.name}
                </Link>
              </>
            )}
            {ctx.cityList.length > 1 && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">{city.name}</span>
              </>
            )}
          </nav>

          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {category.name} in {city.name}, {site.state?.code ?? ''}
          </h1>
          <p className="text-muted-foreground mb-6">
            Browse {businessTerm} for {category.name.toLowerCase()} in{' '}
            {city.name}.
          </p>

          {/* Search Form */}
          <SearchForm
            basePath={basePath}
            categories={ctx.categoryList}
            cities={ctx.cityList}
            className="max-w-3xl"
          />
        </div>
      </div>

      {/* Business Listings */}
      <div className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {category.name} in {city.name}
          </h2>

          <Suspense fallback={<BusinessListingsSkeleton />}>
            <CategoryCityBusinessListings
              siteId={site.id}
              basePath={basePath}
              ctx={ctx}
              categorySlug={category.slug}
              citySlug={city.slug}
              page={page}
              loadMoreLabel={`Load More ${businessTermSingular}s`}
              emptyMessage={`No ${businessTerm} found for ${category.name.toLowerCase()} in ${city.name}.`}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

interface CategoryCityBusinessListingsProps {
  siteId: string;
  basePath: string;
  ctx: RouteContext;
  categorySlug: string;
  citySlug: string;
  page: number;
  loadMoreLabel: string;
  emptyMessage: string;
}

async function CategoryCityBusinessListings({
  siteId,
  basePath,
  ctx,
  categorySlug,
  citySlug,
  page,
  loadMoreLabel,
  emptyMessage,
}: CategoryCityBusinessListingsProps) {
  const totalToFetch = page * ITEMS_PER_PAGE;
  const [featuredBusinesses, { businesses, total, hasMore }] =
    await Promise.all([
      getFeaturedBusinesses(siteId, { categorySlug, citySlug }),
      getBusinessesByCategoryAndCity(
        siteId,
        categorySlug,
        citySlug,
        1,
        totalToFetch
      ),
    ]);

  console.log('Featured Businesses:', featuredBusinesses);
  return (
    <BusinessListings
      featuredBusinesses={featuredBusinesses}
      initialBusinesses={businesses}
      initialTotal={total}
      initialHasMore={hasMore}
      initialPage={page}
      basePath={basePath}
      ctx={ctx}
      categorySlug={categorySlug}
      citySlug={citySlug}
      loadMoreLabel={loadMoreLabel}
      emptyMessage={emptyMessage}
      itemsPerPage={ITEMS_PER_PAGE}
    />
  );
}
