import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { SiteConfig, RouteContext, CategoryData } from '@/lib/types';
import {
  getBusinessesByCategory,
  getFeaturedBusinesses,
} from '@/lib/data/site';
import { SearchForm } from '@/components/sites/search-form';
import { BusinessListings } from '@/components/sites/business-listings';
import { BusinessListingsSkeleton } from '@/components/sites/business-listings-skeleton';
import { FilterChips, type FilterChip } from '@/components/sites/filter-chips';
import {
  getBreadcrumbListSchema,
  getCollectionPageSchema,
  getItemListSchema,
} from '@/lib/schemas';
import { buildDirectoryUrl, slugify } from '@/lib/utils';

interface DirectoryCategoryPageProps {
  site: SiteConfig;
  ctx: RouteContext;
  category: CategoryData;
  page?: number;
}

const ITEMS_PER_PAGE = 12;

export function DirectoryCategoryPage({
  site,
  ctx,
  category,
  page = 1,
}: DirectoryCategoryPageProps) {
  const basePath = site.vertical?.slug ?? '';
  const businessesTerm = site.vertical?.term_businesses ?? 'Businesses';
  const businessesTermLower = businessesTerm.toLowerCase();

  const hasMultipleCities = ctx.cityList.length > 1;
  const singleCity = !hasMultipleCities;
  const singleCategory = ctx.categoryList.length === 1;

  const pagePath = buildDirectoryUrl({
    basePath,
    categorySlug: category.slug,
    singleCity,
    singleCategory,
  });
  const pageUrl = `https://${site.domain}${pagePath}`;
  const pageTitle = category.name;
  const pageDescription = `Browse results for ${category.name.toLowerCase()} ${businessesTermLower}${hasMultipleCities ? ' across all locations' : ''}.`;

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
                name: category.name,
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
            <span className="text-foreground">{category.name}</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {category.name}
          </h1>
          <p className="text-muted-foreground mb-6">
            Browse results for {category.name.toLowerCase()}
            {hasMultipleCities ? ' across all locations' : ''}.
          </p>

          {/* Search Form - pre-filled with category */}
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
            Results for {category.name}
          </h2>

          {/* City Filter Chips */}
          {hasMultipleCities && (
            <FilterChips
              label="Refine by city:"
              chips={ctx.cityList
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(
                  (city): FilterChip => ({
                    label: city.name,
                    href: `/${basePath}/${category.slug}/${city.slug}`,
                  })
                )}
              className="mb-8"
            />
          )}

          <Suspense fallback={<BusinessListingsSkeleton />}>
            <CategoryBusinessListings
              siteId={site.id}
              domain={site.domain}
              basePath={basePath}
              ctx={ctx}
              categorySlug={category.slug}
              page={page}
              loadMoreLabel={`Load More ${businessesTerm}`}
              businessesTerm={businessesTerm}
              businessesTermLower={businessesTermLower}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

interface CategoryBusinessListingsProps {
  siteId: string;
  domain: string;
  basePath: string;
  ctx: RouteContext;
  categorySlug: string;
  page: number;
  loadMoreLabel: string;
  businessesTerm: string;
  businessesTermLower: string;
}

async function CategoryBusinessListings({
  siteId,
  domain,
  basePath,
  ctx,
  categorySlug,
  page,
  loadMoreLabel,
  businessesTerm,
  businessesTermLower,
}: CategoryBusinessListingsProps) {
  const singleCity = ctx.cityList.length === 1;
  const singleCategory = ctx.categoryList.length === 1;

  const totalToFetch = page * ITEMS_PER_PAGE;
  const [featuredBusinesses, { businesses, total, hasMore }] =
    await Promise.all([
      getFeaturedBusinesses(siteId, ctx.categoryList, { categorySlug }),
      getBusinessesByCategory(siteId, categorySlug, 1, totalToFetch),
    ]);

  // Build ItemList schema for businesses
  const itemListItems = [...featuredBusinesses, ...businesses].map(
    (business) => {
      const citySlug = business.city ? slugify(business.city) : null;
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

  const itemListSchema = getItemListSchema(
    `${businessesTerm} listings`,
    `Browse ${businessesTermLower} in this category`,
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
        loadMoreLabel={loadMoreLabel}
        emptyMessage={`No ${businessesTermLower} found in this category.`}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </>
  );
}
