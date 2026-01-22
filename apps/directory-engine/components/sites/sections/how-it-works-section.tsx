import { Search, MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SiteConfig, RouteContext } from '@/lib/types';

interface HowItWorksSectionProps {
  site: SiteConfig;
  ctx: RouteContext;
  className?: string;
}

export function HowItWorksSection({
  site,
  ctx,
  className,
}: HowItWorksSectionProps) {
  const businessTerm = site.vertical?.term_business ?? 'Business';
  const businessesTermLower =
    site.vertical?.term_businesses?.toLowerCase() ?? 'businesses';
  const categoriesTermLower =
    site.vertical?.term_categories?.toLowerCase() ?? 'categories';

  const hasMultipleCities = ctx.cityList.length > 1;
  const hasMultipleCategories = ctx.categoryList.length > 1;

  const businessesTermParts = businessesTermLower.split(' ');
  const businessesTermCapitalized = businessesTermParts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return (
    <section className={cn('w-full py-16', className)}>
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Find the Best {businessesTermCapitalized} in Your Area
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive directory makes it easy to discover, compare, and
            connect with trusted {businessesTermLower} near you.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1: Search */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                1
              </div>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Search & Browse</h3>
            <p className="text-muted-foreground">
              {hasMultipleCategories && hasMultipleCities
                ? `Browse by ${categoriesTermLower} or location to find ${businessesTermLower} that meet your needs.`
                : hasMultipleCategories
                  ? `Browse by ${categoriesTermLower} to find ${businessesTermLower} that meet your needs.`
                  : hasMultipleCities
                    ? `Browse by location to find ${businessesTermLower} near you.`
                    : `Search our directory to find ${businessesTermLower} that meet your needs.`}
            </p>
          </div>

          {/* Step 2: Compare */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                2
              </div>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Compare & Review</h3>
            <p className="text-muted-foreground">
              Read reviews, check ratings, and compare {businessesTermLower} to
              make an informed decision.
            </p>
          </div>

          {/* Step 3: Connect */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                3
              </div>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect & Visit</h3>
            <p className="text-muted-foreground">
              Get contact information, directions, and visit the{' '}
              {businessTerm.toLowerCase()} that's right for you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
