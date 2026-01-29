import { slugify, buildDirectoryUrl } from '@/lib/utils';
import { BusinessCard } from '@/components/sites/business-card';
import type { BusinessCardData, RouteContext } from '@/lib/types';

interface FeaturedBusinessesSectionProps {
  businesses: BusinessCardData[];
  title: string;
  basePath: string;
  ctx: RouteContext;
  categorySlug?: string;
  citySlug?: string;
}

export function FeaturedBusinessesSection({
  businesses,
  title,
  basePath,
  ctx,
  categorySlug,
  citySlug,
}: FeaturedBusinessesSectionProps) {
  if (businesses.length === 0) {
    return null;
  }

  const singleCity = ctx.cityList.length === 1;
  const singleCategory = ctx.categoryList.length === 1;

  return (
    <div className="py-16 bg-amber-50/50 dark:bg-amber-950/10">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-bold tracking-tight mb-6">{title}</h2>
        <div className="flex flex-col gap-4">
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              href={buildDirectoryUrl({
                basePath,
                categorySlug:
                  categorySlug ||
                  business.category?.slug ||
                  ctx.categoryList[0]?.slug,
                citySlug:
                  citySlug ||
                  (business.city ? slugify(business.city) : undefined) ||
                  ctx.cityList[0]?.slug,
                businessId: business.id,
                singleCity,
                singleCategory,
              })}
              featured
            />
          ))}
        </div>
      </div>
    </div>
  );
}
