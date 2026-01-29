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
import { FeaturedBusinessesSection } from '@/components/sites/sections/featured-businesses-section';

interface DirectoryCategoryCityPageProps {
  site: SiteConfig;
  ctx: RouteContext;
  category: CategoryData;
  city: CityData;
  page?: number;
}

const ITEMS_PER_PAGE = 12;

export async function DirectoryCategoryCityPage({
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

  // Fetch featured businesses and regular listings in parallel
  const totalToFetch = page * ITEMS_PER_PAGE;
  const [featuredBusinesses, { businesses, total, hasMore }] =
    await Promise.all([
      getFeaturedBusinesses(site.id, {
        categorySlug: category.slug,
        citySlug: city.slug,
      }),
      getBusinessesByCategoryAndCity(
        site.id,
        category.slug,
        city.slug,
        1,
        totalToFetch
      ),
    ]);

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
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/${basePath}/${category.slug}`}
              className="hover:text-foreground"
            >
              {category.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{city.name}</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {category.name} in {city.name}, {site.state?.code ?? ''}
          </h1>
          <p className="text-muted-foreground mb-6">
            Browse {total.toLocaleString()} {businessTerm} for{' '}
            {category.name.toLowerCase()} in {city.name}.
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

      <FeaturedBusinessesSection
        businesses={featuredBusinesses}
        title={`Featured ${category.name} in ${city.name}`}
        basePath={basePath}
        ctx={ctx}
        categorySlug={category.slug}
        citySlug={city.slug}
      />

      {/* Business Listings */}
      <div className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {category.name} in {city.name}
          </h2>

          <BusinessListings
            initialBusinesses={businesses}
            initialTotal={total}
            initialHasMore={hasMore}
            initialPage={page}
            basePath={basePath}
            ctx={ctx}
            categorySlug={category.slug}
            citySlug={city.slug}
            loadMoreLabel={`Load More ${businessTermSingular}s`}
            emptyMessage={`No ${businessTerm} found for ${category.name.toLowerCase()} in ${city.name}.`}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>
    </div>
  );
}
