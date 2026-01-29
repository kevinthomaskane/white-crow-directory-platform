import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { SiteConfig, RouteContext, CategoryData } from '@/lib/types';
import {
  getBusinessesByCategory,
  getFeaturedBusinesses,
} from '@/lib/data/site';
import { SearchForm } from '@/components/sites/search-form';
import { BusinessListings } from '@/components/sites/business-listings';
import { FeaturedBusinessesSection } from '@/components/sites/sections/featured-businesses-section';
import { FilterChips, type FilterChip } from '@/components/sites/filter-chips';

interface DirectoryCategoryPageProps {
  site: SiteConfig;
  ctx: RouteContext;
  category: CategoryData;
  page?: number;
}

const ITEMS_PER_PAGE = 12;

export async function DirectoryCategoryPage({
  site,
  ctx,
  category,
  page = 1,
}: DirectoryCategoryPageProps) {
  const basePath = site.vertical?.slug ?? '';
  const businessTerm =
    site.vertical?.term_businesses?.toLowerCase() ?? 'businesses';
  const businessTermSingular = site.vertical?.term_business ?? 'Business';

  const hasMultipleCities = ctx.cityList.length > 1;

  // Fetch featured businesses and regular listings in parallel
  const totalToFetch = page * ITEMS_PER_PAGE;
  const [featuredBusinesses, { businesses, total, hasMore }] =
    await Promise.all([
      getFeaturedBusinesses(site.id, { categorySlug: category.slug }),
      getBusinessesByCategory(site.id, category.slug, 1, totalToFetch),
    ]);

  return (
    <div>
      {/* Header */}
      <div className="bg-muted/30 py-16 px-4">
        <div className="mx-auto max-w-6xl px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href={`/${basePath}`} className="hover:text-foreground">
              {site.vertical?.term_businesses ?? 'Directory'}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{category.name}</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {category.name}
          </h1>
          <p className="text-muted-foreground mb-6">
            Browse {total.toLocaleString()} results for{' '}
            {category.name.toLowerCase()}{' '}
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

      <FeaturedBusinessesSection
        businesses={featuredBusinesses}
        title={`Featured ${category.name}`}
        basePath={basePath}
        ctx={ctx}
        categorySlug={category.slug}
      />

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

          <BusinessListings
            initialBusinesses={businesses}
            initialTotal={total}
            initialHasMore={hasMore}
            initialPage={page}
            basePath={basePath}
            ctx={ctx}
            categorySlug={category.slug}
            loadMoreLabel={`Load More ${businessTermSingular}s`}
            emptyMessage={`No ${businessTerm} found in this category.`}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>
    </div>
  );
}
