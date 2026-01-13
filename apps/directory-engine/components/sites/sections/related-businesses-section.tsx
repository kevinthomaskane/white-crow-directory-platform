import { cn, slugify } from '@/lib/utils';
import { BusinessCard } from '@/components/sites/business-card';
import type { BusinessCardData } from '@/lib/types';

interface RelatedBusinessesSectionProps {
  businesses: BusinessCardData[];
  basePath: string;
  hasMultipleCategories: boolean;
  hasMultipleCities: boolean;
  title?: string;
  className?: string;
}

export function RelatedBusinessesSection({
  businesses,
  basePath,
  hasMultipleCategories,
  hasMultipleCities,
  title = 'Similar Businesses',
  className,
}: RelatedBusinessesSectionProps) {
  if (businesses.length === 0) return null;

  const buildBusinessUrl = (business: BusinessCardData) => {
    const parts = [basePath];

    if (hasMultipleCategories && business.category) {
      parts.push(business.category.slug);
    }

    if (hasMultipleCities && business.city) {
      parts.push(slugify(business.city));
    }

    parts.push(business.id);
    return '/' + parts.join('/');
  };

  return (
    <section className={cn('w-full py-12', className)}>
      <h2 className="text-2xl font-bold tracking-tight mb-6">{title}</h2>
      <div className="flex flex-col gap-4">
        {businesses.map((business) => (
          <BusinessCard
            key={business.id}
            business={business}
            href={buildBusinessUrl(business)}
          />
        ))}
      </div>
    </section>
  );
}
