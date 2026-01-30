import { cn, slugify, buildDirectoryUrl } from '@/lib/utils';
import { getRelatedBusinesses } from '@/lib/data/site';
import { BusinessCard } from '@/components/sites/business-card';
import type { CategoryData } from '@/lib/types';

interface RelatedBusinessesSectionProps {
  siteId: string;
  categoryList: CategoryData[];
  businessId: string;
  categorySlug: string | null;
  cityName: string | null;
  basePath: string;
  singleCategory: boolean;
  singleCity: boolean;
  title?: string;
  className?: string;
}

export async function RelatedBusinessesSection({
  siteId,
  categoryList,
  businessId,
  categorySlug,
  cityName,
  basePath,
  singleCategory,
  singleCity,
  title = 'Similar Businesses',
  className,
}: RelatedBusinessesSectionProps) {
  const businesses = await getRelatedBusinesses(
    siteId,
    categoryList,
    businessId,
    categorySlug,
    cityName,
    6
  );

  if (businesses.length === 0) return null;

  return (
    <section className={cn('w-full py-12', className)}>
      <h2 className="text-2xl font-bold tracking-tight mb-6">{title}</h2>
      <div className="flex flex-col gap-4">
        {businesses.map((business) => (
          <BusinessCard
            key={business.id}
            business={business}
            href={buildDirectoryUrl({
              basePath,
              categorySlug: business.category?.slug,
              citySlug: business.city ? slugify(business.city) : undefined,
              businessId: business.id,
              singleCategory,
              singleCity,
            })}
          />
        ))}
      </div>
    </section>
  );
}
