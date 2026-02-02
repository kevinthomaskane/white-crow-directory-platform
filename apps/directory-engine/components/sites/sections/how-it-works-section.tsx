import { MapPin, Star, Building2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SiteConfig, RouteContext } from '@/lib/types';

function MockBusinessCard() {
  return (
    <div className="w-64 rounded-lg bg-card p-3">
      <div className="flex gap-3">
        {/* Mock image */}
        <div className="h-16 w-16 flex-shrink-0 rounded-md bg-muted flex items-center justify-center">
          <Building2 className="h-6 w-6 text-muted-foreground" />
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Rating */}
          <div className="mt-1.5 flex items-center gap-1">
            <span className="text-xs font-medium">4.8</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-2.5 w-2.5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <div className="flex-shrink-0 rounded-full bg-premium p-0.5">
              <Check
                strokeWidth={4}
                className="h-2.5 w-2.5 text-premium-foreground"
              />
            </div>
          </div>
          {/* Category */}
          <div className="mt-1 h-2 w-20 bg-muted-foreground/30 rounded" />
          {/* Address */}
          <div className="mt-1.5 flex items-center gap-1">
            <div className="h-2 w-28 bg-muted-foreground/20 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FiveStars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-8 h-8 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function ColoredMapPin() {
  return (
    <div className="relative">
      <MapPin className="w-16 h-16 fill-red-500 text-red-600" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-300" />
    </div>
  );
}

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
          <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border">
            <div className="relative mb-6 flex items-center justify-center">
              <MockBusinessCard />
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
          <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border">
            <div className="relative mb-4 h-16 flex grow items-center justify-center">
              <FiveStars />
            </div>
            <h3 className="text-xl font-semibold mb-2">Compare & Review</h3>
            <p className="text-muted-foreground">
              Read reviews, check ratings, and compare {businessesTermLower} to
              make an informed decision.
            </p>
          </div>

          {/* Step 3: Connect */}
          <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border">
            <div className="relative mb-4 h-16 flex grow items-center justify-center">
              <ColoredMapPin />
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
