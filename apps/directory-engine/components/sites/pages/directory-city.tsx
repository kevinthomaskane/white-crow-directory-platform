import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { SiteConfig, RouteContext, CityData } from '@/lib/types';
import { getBusinessesByCity, getFeaturedBusinesses } from '@/lib/data/site';
import { SearchForm } from '@/components/sites/search-form';
import { BusinessListings } from '@/components/sites/business-listings';
import { BusinessListingsSkeleton } from '@/components/sites/business-listings-skeleton';
import { FilterChips, type FilterChip } from '@/components/sites/filter-chips';
import {
  getBreadcrumbListSchema,
  getCollectionPageSchema,
  getItemListSchema,
} from '@/lib/schemas';
import { buildDirectoryUrl } from '@/lib/utils';

interface DirectoryCityPageProps {
  site: SiteConfig;
  ctx: RouteContext;
  city: CityData;
  page?: number;
}

const ITEMS_PER_PAGE = 12;

export function DirectoryCityPage({
  site,
  ctx,
  city,
  page = 1,
}: DirectoryCityPageProps) {
  const basePath = site.vertical?.slug ?? '';
  const businessesTerm = site.vertical?.term_businesses ?? 'Businesses';
  const businessesTermLower = businessesTerm.toLowerCase();
  const categoryTerm = site.vertical?.term_category ?? 'Category';
  const categoryTermLower = categoryTerm.toLowerCase();

  const singleCity = ctx.cityList.length === 1;
  const singleCategory = ctx.categoryList.length === 1;

  const pagePath = buildDirectoryUrl({
    basePath,
    citySlug: city.slug,
    singleCity,
    singleCategory,
  });
  const pageUrl = `https://${site.domain}${pagePath}`;
  const pageTitle = `${businessesTerm ?? 'Directory'} in ${city.name}, ${site.state?.code ?? ''}`;
  const pageDescription = `Browse ${businessesTermLower} in ${city.name}.`;

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbListSchema([
              {
                name: businessesTerm ?? 'Directory',
                url: `https://${site.domain}/${basePath}`,
              },
              {
                name: city.name,
                url: pageUrl,
              },
            ])
          ),
        }}
      />
      {/* Header */}
      <div className="bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href={`/${basePath}`} className="hover:text-foreground">
              {businessesTerm ?? 'Directory'}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{city.name}</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {businessesTerm ?? 'Directory'} in {city.name},{' '}
            {site.state?.code ?? ''}
          </h1>
          <p className="text-muted-foreground mb-6">
            Browse {businessesTermLower} in {city.name}.
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
            Results in {city.name}
          </h2>

          {/* Category Filter Chips */}
          {ctx.categoryList.length > 1 && (
            <FilterChips
              label={`Refine by ${categoryTermLower ?? 'category'}:`}
              chips={ctx.categoryList
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(
                  (cat): FilterChip => ({
                    label: cat.name,
                    href: `/${basePath}/${cat.slug}/${city.slug}`,
                  })
                )}
              className="mb-8"
            />
          )}

          <Suspense fallback={<BusinessListingsSkeleton />}>
            <CityBusinessListings
              siteId={site.id}
              domain={site.domain}
              basePath={basePath}
              ctx={ctx}
              citySlug={city.slug}
              businessesTerm={businessesTerm}
              page={page}
              loadMoreLabel={`Load More ${businessesTerm}`}
              emptyMessage={`No ${businessesTermLower} found in ${city.name}.`}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

interface CityBusinessListingsProps {
  siteId: string;
  domain: string;
  basePath: string;
  businessesTerm: string;
  ctx: RouteContext;
  citySlug: string;
  page: number;
  loadMoreLabel: string;
  emptyMessage: string;
}

async function CityBusinessListings({
  siteId,
  domain,
  basePath,
  ctx,
  businessesTerm,
  citySlug,
  page,
  loadMoreLabel,
  emptyMessage,
}: CityBusinessListingsProps) {
  const singleCity = ctx.cityList.length === 1;
  const singleCategory = ctx.categoryList.length === 1;

  const totalToFetch = page * ITEMS_PER_PAGE;
  const [featuredBusinesses, { businesses, total, hasMore }] =
    await Promise.all([
      getFeaturedBusinesses(siteId, ctx.categoryList, { citySlug }),
      getBusinessesByCity(siteId, ctx.categoryList, citySlug, 1, totalToFetch),
    ]);

  // Build ItemList schema for businesses
  const itemListItems = [...featuredBusinesses, ...businesses].map(
    (business) => {
      const businessUrl = buildDirectoryUrl({
        basePath,
        categorySlug: business.category?.slug,
        citySlug,
        businessId: business.id,
        singleCity,
        singleCategory,
      });

      return {
        '@type': 'ListItem',
        name: business.name,
        url: `https://${domain}${businessUrl}`,
      };
    }
  );

  const cityName = ctx.cityList.find((c) => c.slug === citySlug)?.name ?? '';
  const itemListSchema = getItemListSchema(
    `${businessesTerm} in ${cityName}`,
    `Browse ${businessesTerm.toLowerCase()} in ${cityName}`,
    itemListItems
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />
      <BusinessListings
        featuredBusinesses={featuredBusinesses}
        initialBusinesses={businesses}
        initialTotal={total}
        initialHasMore={hasMore}
        initialPage={page}
        basePath={basePath}
        ctx={ctx}
        citySlug={citySlug}
        loadMoreLabel={loadMoreLabel}
        emptyMessage={emptyMessage}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </>
  );
}
