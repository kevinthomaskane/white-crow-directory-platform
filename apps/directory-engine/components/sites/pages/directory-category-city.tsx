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
import {
  getBreadcrumbListSchema,
  getCollectionPageSchema,
  getItemListSchema,
} from '@/lib/schemas';
import { buildDirectoryUrl } from '@/lib/utils';

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
  const businessesTerm = site.vertical?.term_businesses ?? 'Businesses';
  const businessesTermLower = businessesTerm.toLowerCase();

  const singleCity = ctx.cityList.length === 1;
  const singleCategory = ctx.categoryList.length === 1;

  const pagePath = buildDirectoryUrl({
    basePath,
    categorySlug: category.slug,
    citySlug: city.slug,
    singleCity,
    singleCategory,
  });
  const pageUrl = `https://${site.domain}${pagePath}`;
  const pageTitle = `${category.name} in ${city.name}, ${site.state?.code ?? ''}`;
  const pageDescription = `Browse ${businessesTermLower} for ${category.name.toLowerCase()} in ${city.name}.`;

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
              ...(ctx.categoryList.length > 1
                ? [
                    {
                      name: category.name,
                      url: `https://${site.domain}/${basePath}/${category.slug}`,
                    },
                  ]
                : []),
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
            Browse {businessesTermLower} for {category.name.toLowerCase()} in{' '}
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
              domain={site.domain}
              basePath={basePath}
              ctx={ctx}
              categorySlug={category.slug}
              citySlug={city.slug}
              page={page}
              loadMoreLabel={`Load More ${businessesTerm}`}
              emptyMessage={`No ${businessesTermLower} found for ${category.name.toLowerCase()} in ${city.name}.`}
              businessesTerm={businessesTerm}
              businessesTermLower={businessesTermLower}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

interface CategoryCityBusinessListingsProps {
  siteId: string;
  domain: string;
  basePath: string;
  ctx: RouteContext;
  categorySlug: string;
  citySlug: string;
  page: number;
  loadMoreLabel: string;
  emptyMessage: string;
  businessesTerm: string;
  businessesTermLower: string;
}

async function CategoryCityBusinessListings({
  siteId,
  domain,
  basePath,
  ctx,
  categorySlug,
  citySlug,
  page,
  loadMoreLabel,
  emptyMessage,
  businessesTerm,
  businessesTermLower,
}: CategoryCityBusinessListingsProps) {
  const singleCity = ctx.cityList.length === 1;
  const singleCategory = ctx.categoryList.length === 1;

  const totalToFetch = page * ITEMS_PER_PAGE;
  const [featuredBusinesses, { businesses, total, hasMore }] =
    await Promise.all([
      getFeaturedBusinesses(siteId, ctx.categoryList, {
        categorySlug,
        citySlug,
      }),
      getBusinessesByCategoryAndCity(
        siteId,
        categorySlug,
        citySlug,
        1,
        totalToFetch
      ),
    ]);

  // Build ItemList schema for businesses
  const itemListItems = [...featuredBusinesses, ...businesses].map(
    (business) => {
      const businessUrl = buildDirectoryUrl({
        basePath,
        categorySlug,
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

  const categoryName =
    ctx.categoryList.find((c) => c.slug === categorySlug)?.name ?? '';
  const cityName = ctx.cityList.find((c) => c.slug === citySlug)?.name ?? '';
  const itemListSchema = getItemListSchema(
    `${businessesTerm} in ${cityName}`,
    `Browse ${businessesTermLower} for ${categoryName.toLowerCase()} in ${cityName}`,
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
        categorySlug={categorySlug}
        citySlug={citySlug}
        loadMoreLabel={loadMoreLabel}
        emptyMessage={emptyMessage}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </>
  );
}
