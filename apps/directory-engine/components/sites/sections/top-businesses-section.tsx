import { Suspense } from 'react';
import { cn, slugify } from '@/lib/utils';
import { getTopBusinesses } from '@/lib/data/site';
import { BusinessCard } from '@/components/sites/business-card';
import type { BusinessCardData, RouteContext } from '@/lib/types';

interface TopBusinessesSectionProps {
  siteId: string;
  basePath: string;
  ctx: RouteContext;
  title?: string;
  description?: string;
  limit?: number;
  className?: string;
}

export function TopBusinessesSection(props: TopBusinessesSectionProps) {
  return (
    <Suspense fallback={<BusinessesSkeleton title={props.title} />}>
      <BusinessesContent {...props} />
    </Suspense>
  );
}

async function BusinessesContent({
  siteId,
  basePath,
  ctx,
  title = 'Top Rated',
  description,
  limit = 10,
  className,
}: TopBusinessesSectionProps) {
  const businesses = await getTopBusinesses(siteId, limit);

  if (businesses.length === 0) {
    return null;
  }

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

        <div className="flex flex-col gap-4">
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              href={buildBusinessUrl(business, basePath, ctx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function buildBusinessUrl(
  business: BusinessCardData,
  basePath: string,
  ctx: RouteContext
): string {
  const singleCity = ctx.cityList.length === 1;
  const singleCategory = ctx.categoryList.length === 1;

  const parts = [basePath];

  const categorySlug = business.category?.slug || ctx.categoryList[0]?.slug;
  if (categorySlug && !singleCategory) {
    parts.push(categorySlug);
  }

  const citySlug = business.city
    ? slugify(business.city)
    : ctx.cityList[0]?.slug;
  if (citySlug && !singleCity) {
    parts.push(citySlug);
  }

  parts.push(business.id);

  return '/' + parts.join('/');
}

function BusinessesSkeleton({ title = 'Top Rated' }: { title?: string }) {
  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex w-full gap-4 rounded-lg border border-border bg-card p-4 sm:gap-6"
            >
              <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-muted animate-pulse sm:h-32 sm:w-32" />
              <div className="flex flex-1 flex-col">
                <div className="h-6 w-1/3 rounded bg-muted animate-pulse" />
                <div className="mt-2 h-4 w-1/4 rounded bg-muted animate-pulse" />
                <div className="mt-2 h-4 w-1/2 rounded bg-muted animate-pulse" />
                <div className="mt-3 h-4 w-3/4 rounded bg-muted animate-pulse hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
