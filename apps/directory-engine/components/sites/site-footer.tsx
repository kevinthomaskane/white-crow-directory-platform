import Link from 'next/link';
import { buildDirectoryUrl } from '@/lib/utils';
import type { SiteConfig, RouteContext } from '@/lib/types';

interface SiteFooterProps {
  siteConfig: SiteConfig;
  routeContext: RouteContext;
  basePath: string;
}

export function SiteFooter({
  siteConfig,
  routeContext,
  basePath,
}: SiteFooterProps) {
  const ctaLabel = siteConfig.vertical?.term_cta || 'Browse Directory';
  const categoriesLabel = siteConfig.vertical?.term_categories || 'Categories';
  const businessesLabel = siteConfig.vertical?.term_businesses || 'businesses';

  const displayCategories = routeContext.categoryList.slice(0, 10);
  const hasMultipleCities = routeContext.cityList.length > 1;
  const hasMultipleCategories = routeContext.categoryList.length > 1;

  return (
    <footer className="w-full border-t bg-muted/30 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              {siteConfig.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Your trusted directory for finding quality{' '}
              {businessesLabel.toLowerCase()} in your area.
            </p>
          </div>

          {/* Browse Section - Mirrors header navigation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              {ctaLabel}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${basePath}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  View All
                </Link>
              </li>
              {hasMultipleCities && (
                <li>
                  <Link
                    href={`/${basePath}#by-location`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    By Location
                  </Link>
                </li>
              )}
              {hasMultipleCategories && (
                <li>
                  <Link
                    href={`/${basePath}#by-category`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    By {categoriesLabel}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Categories Section - Only show if categories exist */}
          {displayCategories.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {categoriesLabel}
              </h3>
              <ul className="space-y-2">
                {displayCategories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/${basePath}/${category.slug}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Popular Cities Section - Only show if multiple cities */}
          {hasMultipleCities && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Popular Cities
              </h3>
              <ul className="space-y-2">
                {routeContext.cityList.slice(0, 10).map((city) => (
                  <li key={city.slug}>
                    <Link
                      href={buildDirectoryUrl({
                        basePath,
                        citySlug: city.slug,
                        singleCity: false,
                      })}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
