import {
  Search,
  BadgeCheck,
  Crown,
  Send,
  ClipboardCheck,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SiteConfig } from '@/lib/types';
import Link from 'next/link';

interface BusinessOwnersSectionProps {
  site: SiteConfig;
  className?: string;
}

export function BusinessOwnersSection({
  site,
  className,
}: BusinessOwnersSectionProps) {
  const businessTerm = site.vertical?.term_business ?? 'business';
  const businessTermLower = businessTerm.toLowerCase();

  return (
    <section className={cn('w-full py-16 bg-muted/90', className)}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            How It Works for Business Owners
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Claim your listing to take control of your online presence and
            unlock powerful features.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Already on the site */}
          <div className="p-8 rounded-xl bg-card border border-border">
            <h3 className="text-xl font-semibold mb-2">
              Already have a {businessTermLower} on the site?
            </h3>
            <p className="text-muted-foreground mb-6">
              Claim your free listing in three easy steps.
            </p>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute -top-1 -left-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs">
                      1
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Search className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">
                    Search for your {businessTermLower}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Use the search bar to find your listing in our directory.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute -top-1 -left-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs">
                      2
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <BadgeCheck className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">
                    Claim your free listing
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Verify ownership to update your business information and add
                    a &quot;claimed&quot; badge to your listing.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute -top-1 -left-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs">
                      3
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">
                    Unlock premium features
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Upgrade to a premium subscription for enhanced visibility,
                    photos, and more.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Not on the site */}
          <div className="p-8 rounded-xl bg-card border border-border">
            <h3 className="text-xl font-semibold mb-2">
              Your {businessTermLower} isn&apos;t on the site?
            </h3>
            <p className="text-muted-foreground mb-6">
              Submit your business and get listed in our directory.
            </p>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute -top-1 -left-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs">
                      1
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Send className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">
                    Submit your {businessTermLower}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Go to our{' '}
                    <Link
                      href="/submit-business"
                      className="underline"
                      aria-label="submit business"
                    >
                      submit page
                    </Link>{' '}
                    and provide your business details.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute -top-1 -left-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs">
                      2
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <ClipboardCheck className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">
                    We verify your business
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your submission and verify your
                    business information.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute -top-1 -left-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs">
                      3
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bell className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Get notified</h4>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll notify you when your business is live and ready
                    to claim.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
