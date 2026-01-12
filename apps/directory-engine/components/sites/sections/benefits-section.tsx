import { Search, MapPin, Star, CheckCircle2, Clock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SiteConfig, RouteContext } from '@/lib/types';

interface BenefitsSectionProps {
  site: SiteConfig;
  ctx: RouteContext;
  className?: string;
}

export function BenefitsSection({
  site,
  ctx,
  className,
}: BenefitsSectionProps) {
  const businessesTermLower =
    site.vertical?.term_businesses?.toLowerCase() ?? 'businesses';

  const hasMultipleCities = ctx.cityList.length > 1;

  return (
    <section className={cn('w-full py-16 bg-muted/30', className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
          Why Choose Our Directory
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Verified Listings */}
          <div className="flex gap-4 p-6 rounded-lg bg-card border border-border">
            <div className="flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Verified Listings</h3>
              <p className="text-sm text-muted-foreground">
                All {businessesTermLower} in our directory are verified with
                accurate, up-to-date information.
              </p>
            </div>
          </div>

          {/* Comprehensive Information */}
          <div className="flex gap-4 p-6 rounded-lg bg-card border border-border">
            <div className="flex-shrink-0">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Comprehensive Information</h3>
              <p className="text-sm text-muted-foreground">
                Get detailed profiles including contact info, hours, locations,
                and reviews.
              </p>
            </div>
          </div>

          {/* Trusted Reviews */}
          <div className="flex gap-4 p-6 rounded-lg bg-card border border-border">
            <div className="flex-shrink-0">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Trusted Reviews</h3>
              <p className="text-sm text-muted-foreground">
                Read authentic reviews from real customers to make confident
                decisions.
              </p>
            </div>
          </div>

          {/* Easy to Use */}
          <div className="flex gap-4 p-6 rounded-lg bg-card border border-border">
            <div className="flex-shrink-0">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Save Time</h3>
              <p className="text-sm text-muted-foreground">
                Find what you need quickly with our intuitive search and
                filtering options.
              </p>
            </div>
          </div>

          {/* Local Focus */}
          <div className="flex gap-4 p-6 rounded-lg bg-card border border-border">
            <div className="flex-shrink-0">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Local Focus</h3>
              <p className="text-sm text-muted-foreground">
                {hasMultipleCities
                  ? `Discover ${businessesTermLower} in your specific city and neighborhood.`
                  : `Find ${businessesTermLower} in your local area with ease.`}
              </p>
            </div>
          </div>

          {/* Always Free */}
          <div className="flex gap-4 p-6 rounded-lg bg-card border border-border">
            <div className="flex-shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Always Free</h3>
              <p className="text-sm text-muted-foreground">
                Our directory is completely free to use - no hidden fees or
                subscriptions required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
