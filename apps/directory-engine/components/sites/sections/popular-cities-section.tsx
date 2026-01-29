'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn, buildDirectoryUrl } from '@/lib/utils';
import type { CityData } from '@/lib/types';

interface PopularCitiesSectionProps {
  cities: CityData[];
  basePath: string;
  singleCity?: boolean;
  title?: string;
  description?: string;
  limit?: number;
  className?: string;
}

export function PopularCitiesSection({
  cities,
  basePath,
  singleCity = false,
  title = 'Popular Cities',
  description,
  limit = 30,
  className,
}: PopularCitiesSectionProps) {
  const [showAll, setShowAll] = useState(false);

  if (cities.length === 0) {
    return null;
  }

  const hasMore = cities.length > limit;
  const displayedCities = showAll ? cities : cities.slice(0, limit);

  return (
    <section id="by-location" className={cn('w-full py-16', className)}>
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
          {hasMore && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              {showAll ? 'Show less' : 'View all'}
              {showAll ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {displayedCities.map((city) => (
            <CityCard
              key={city.slug}
              city={city}
              href={buildDirectoryUrl({
                basePath,
                citySlug: city.slug,
                singleCity,
              })}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface CityCardProps {
  city: CityData;
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
