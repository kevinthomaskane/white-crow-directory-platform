import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { SiteConfig, RouteContext, CityData } from '@/lib/types';
import { getBusinessesByCity, getFeaturedBusinesses } from '@/lib/data/site';
import { SearchForm } from '@/components/sites/search-form';
import { BusinessListings } from '@/components/sites/business-listings';
import { FeaturedBusinessesSection } from '@/components/sites/sections/featured-businesses-section';
import { FilterChips, type FilterChip } from '@/components/sites/filter-chips';

interface DirectoryCityPageProps {
  site: SiteConfig;
  ctx: RouteContext;
  city: CityData;
  page?: number;
}

const ITEMS_PER_PAGE = 12;

export async function DirectoryCityPage({
  site,
  ctx,
  city,
  page = 1,
}: DirectoryCityPageProps) {
  const basePath = site.vertical?.slug ?? '';
  const businessTerm =
    site.vertical?.term_businesses?.toLowerCase() ?? 'businesses';
  const businessTermSingular = site.vertical?.term_business ?? 'Business';

  // Fetch featured businesses and regular listings in parallel
  const totalToFetch = page * ITEMS_PER_PAGE;
  const [featuredBusinesses, { businesses, total, hasMore }] =
    await Promise.all([
      getFeaturedBusinesses(site.id, { citySlug: city.slug }),
      getBusinessesByCity(site.id, city.slug, 1, totalToFetch),
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
            <span className="text-foreground">{city.name}</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {site.vertical?.term_businesses ?? 'Directory'} in {city.name},{' '}
            {site.state?.code ?? ''}
          </h1>
          <p className="text-muted-foreground mb-6">
            Browse {total.toLocaleString()} {businessTerm} in {city.name}.
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
        title={`Featured ${site.vertical?.term_businesses ?? 'Businesses'} in ${city.name}`}
        basePath={basePath}
        ctx={ctx}
        citySlug={city.slug}
      />

      {/* Business Listings */}
      <div className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Results in {city.name}
          </h2>

          {/* Category Filter Chips */}
          {ctx.categoryList.length > 0 && (
            <FilterChips
              label={`Refine by ${site.vertical?.term_category?.toLowerCase() ?? 'category'}:`}
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

          <BusinessListings
            initialBusinesses={businesses}
            initialTotal={total}
            initialHasMore={hasMore}
            initialPage={page}
            basePath={basePath}
            ctx={ctx}
            citySlug={city.slug}
            loadMoreLabel={`Load More ${businessTermSingular}s`}
            emptyMessage={`No ${businessTerm} found in ${city.name}.`}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>
    </div>
  );
}
