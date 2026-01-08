import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ChevronRight, Building2 } from 'lucide-react';
import { cn, slugify } from '@/lib/utils';
import { getTopBusinesses } from '@/lib/data/site';
import { Badge } from '@/components/ui/badge';
import type { TopBusinessData, RouteContext } from '@/lib/types';

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
    <section className={cn('w-full', className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            {description && (
              <p className="mt-1 text-muted-foreground">{description}</p>
            )}
          </div>
          <Link
            href={`/${basePath}`}
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              basePath={basePath}
              ctx={ctx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface BusinessCardProps {
  business: TopBusinessData;
  basePath: string;
  ctx: RouteContext;
}

function BusinessCard({ business, basePath, ctx }: BusinessCardProps) {
  const href = buildBusinessUrl(business, basePath, ctx);
  const providerLabel = formatProvider(business.reviewSource?.provider);

  return (
    <Link
      href={href}
      className="group flex gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        {business.main_photo_name ? (
          <Image
            src={`/api/places-photo?name=${encodeURIComponent(business.main_photo_name)}&maxHeight=200`}
            alt={business.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
            {business.name}
          </h3>
          <Badge
            variant={business.is_claimed ? 'default' : 'outline'}
            className="flex-shrink-0 text-xs"
          >
            {business.is_claimed ? 'Verified' : 'Unclaimed'}
          </Badge>
        </div>

        {business.reviewSource?.rating && (
          <div className="mt-1 flex items-center gap-1 text-sm">
            <RatingStars rating={business.reviewSource.rating} />
            <span className="font-medium">{business.reviewSource.rating}</span>
            {providerLabel && (
              <span className="text-muted-foreground">on {providerLabel}</span>
            )}
          </div>
        )}

        <div className="mt-1 text-sm text-muted-foreground truncate">
          {[business.category?.name, business.city].filter(Boolean).join(' • ')}
        </div>

        {business.editorial_summary && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {business.editorial_summary}
          </p>
        )}
      </div>
    </Link>
  );
}

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i < fullStars
              ? 'fill-yellow-400 text-yellow-400'
              : i === fullStars && hasHalfStar
                ? 'fill-yellow-400/50 text-yellow-400'
                : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}

function buildBusinessUrl(
  business: TopBusinessData,
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

function formatProvider(provider: string | null | undefined): string | null {
  if (!provider) return null;

  const providerMap: Record<string, string> = {
    google_places: 'Google',
    yelp: 'Yelp',
    facebook: 'Facebook',
  };

  return providerMap[provider] || provider;
}

function BusinessesSkeleton({ title = 'Top Rated' }: { title?: string }) {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-lg border border-border bg-card p-4"
            >
              <div className="h-20 w-20 flex-shrink-0 rounded-md bg-muted animate-pulse" />
              <div className="flex flex-1 flex-col">
                <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
                <div className="mt-2 h-4 w-1/2 rounded bg-muted animate-pulse" />
                <div className="mt-2 h-4 w-2/3 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
