import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPopularCities } from '@/lib/data/site';
import type { PopularCityData } from '@/lib/types';

interface PopularCitiesSectionProps {
  siteId: string;
  basePath: string;
  title?: string;
  description?: string;
  limit?: number;
  totalCities?: number;
  className?: string;
}

export function PopularCitiesSection(props: PopularCitiesSectionProps) {
  return (
    <Suspense fallback={<CitiesSkeleton title={props.title} />}>
      <CitiesContent {...props} />
    </Suspense>
  );
}

async function CitiesContent({
  siteId,
  basePath,
  title = 'Popular Cities',
  description,
  limit = 30,
  totalCities = 0,
  className,
}: PopularCitiesSectionProps) {
  const cities = await getPopularCities(siteId, limit);

  if (cities.length === 0) {
    return null;
  }

  const hasMore = totalCities > limit;

  return (
    <section id="by-location" className={cn('w-full py-16', className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            {description && (
              <p className="mt-1 text-muted-foreground">{description}</p>
            )}
          </div>
          {hasMore && (
            <Link
              href={`/${basePath}`}
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {cities.map((city) => (
            <CityCard
              key={city.slug}
              city={city}
              href={`/${basePath}/${city.slug}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface CityCardProps {
  city: PopularCityData;
  href: string;
}

function CityCard({ city, href }: CityCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center justify-center rounded-lg border border-border bg-card p-4 text-center transition-all hover:border-primary/50 hover:bg-accent hover:shadow-sm"
    >
      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
        {city.name}
      </span>
    </Link>
  );
}

function CitiesSkeleton({ title = 'Popular Cities' }: { title?: string }) {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-4"
            >
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="mt-2 h-3 w-16 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
