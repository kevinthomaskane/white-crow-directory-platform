import { Suspense } from 'react';
import { cn, slugify, buildDirectoryUrl } from '@/lib/utils';
import { getTopBusinesses } from '@/lib/data/site';
import { BusinessCard } from '@/components/sites/business-card';
import { BusinessListingsSkeleton } from '@/components/sites/business-listings-skeleton';
import type { RouteContext } from '@/lib/types';

interface TopBusinessesSectionProps {
  siteId: string;
  basePath: string;
  ctx: RouteContext;
  title?: string;
  description?: string;
  limit?: number;
  className?: string;
}

export function TopBusinessesSection({
  siteId,
  basePath,
  ctx,
  title = 'Top Rated',
  description,
  limit = 10,
  className,
}: TopBusinessesSectionProps) {
  return (
    <section className={cn('w-full py-16', className)}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            {description && (
              <p className="mt-2 text-lg text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>

        <Suspense fallback={<BusinessListingsSkeleton />}>
          <BusinessCards
            siteId={siteId}
            basePath={basePath}
            ctx={ctx}
            limit={limit}
          />
        </Suspense>
      </div>
    </section>
  );
}

interface BusinessCardsProps {
  siteId: string;
  basePath: string;
  ctx: RouteContext;
  limit: number;
}

async function BusinessCards({
  siteId,
  basePath,
  ctx,
  limit,
}: BusinessCardsProps) {
  const businesses = await getTopBusinesses(siteId, ctx.categoryList, limit);

  if (businesses.length === 0) {
    return null;
  }

  const singleCity = ctx.cityList.length === 1;
  const singleCategory = ctx.categoryList.length === 1;

  return (
    <div className="flex flex-col gap-4">
      {businesses.map((business) => {
        const categorySlug =
          business.category?.slug || ctx.categoryList[0]?.slug;
        const citySlug = business.city
          ? slugify(business.city)
          : ctx.cityList[0]?.slug;

        return (
          <BusinessCard
            key={business.id}
            business={business}
            href={buildDirectoryUrl({
              basePath,
              categorySlug,
              citySlug,
              businessId: business.id,
              singleCity,
              singleCategory,
            })}
          />
        );
      })}
    </div>
  );
}
