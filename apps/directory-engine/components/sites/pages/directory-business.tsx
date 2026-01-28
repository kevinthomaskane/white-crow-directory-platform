import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, Building2, MapPin, Loader2 } from 'lucide-react';
import type { SiteConfig, RouteContext, BusinessDetailData } from '@/lib/types';
import { getBusinessImageUrl } from '@/lib/utils';
import {
  getBusinessDetails,
  getBusinessReviews,
  getRelatedBusinesses,
} from '@/lib/data/site';
import { Badge } from '@/components/ui/badge';
import { RatingStars, formatProvider } from '@/components/sites/business-card';
import { ClaimBusinessBanner } from '@/components/sites/sections/claim-business-banner';
import { ClaimBusinessButton } from '@/components/sites/claim/claim-business-button';
import { BusinessReviewsSection } from '@/components/sites/sections/business-reviews-section';
import { BusinessContactCard } from '@/components/sites/sections/business-contact-card';
import { RelatedBusinessesSection } from '@/components/sites/sections/related-businesses-section';

interface DirectoryBusinessPageProps {
  site: SiteConfig;
  ctx: RouteContext;
  category: string;
  city: string;
  businessId: string;
}

export async function DirectoryBusinessPage({
  site,
  ctx,
  category,
  city,
  businessId,
}: DirectoryBusinessPageProps) {
  const basePath = site.vertical?.slug ?? '';
  const businessTerm = site.vertical?.term_business ?? 'Business';
  const businessTermPlural =
    site.vertical?.term_businesses?.toLowerCase() ?? 'businesses';

  const hasMultipleCategories = ctx.categoryList.length > 1;
  const hasMultipleCities = ctx.cityList.length > 1;

  // Fetch business details (critical for page render)
  const business = await getBusinessDetails(site.id, businessId);

  if (!business) return notFound();

  // Find category and city names for breadcrumb
  const categoryData = ctx.categoryList.find((c) => c.slug === category);
  const cityData = ctx.cityList.find((c) => c.slug === city);
  const primaryReviewSource = business.reviewSources[0];

  // Build breadcrumb links
  const buildCategoryUrl = () => `/${basePath}/${category}`;
  const buildCityUrl = () => {
    if (hasMultipleCategories) {
      return `/${basePath}/${category}/${city}`;
    }
    return `/${basePath}/${city}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-muted/30 py-12 px-4">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href={`/${basePath}`} className="hover:text-foreground">
              {site.vertical?.term_businesses ?? 'Directory'}
            </Link>
            {categoryData && (
              <>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <Link
                  href={buildCategoryUrl()}
                  className="hover:text-foreground"
                >
                  {categoryData.name}
                </Link>
              </>
            )}
            {cityData && (
              <>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <Link href={buildCityUrl()} className="hover:text-foreground">
                  {cityData.name}, {site.state?.code ?? ''}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
            <span className="text-foreground line-clamp-1">
              {business.name}
            </span>
          </nav>

          {/* Business Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              {/* Title + Badge */}
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {business.name}
                </h1>
                <Badge
                  variant={business.is_claimed ? 'default' : 'outline'}
                  className="flex-shrink-0"
                >
                  {business.is_claimed ? 'Verified' : 'Unclaimed'}
                </Badge>
              </div>

              {/* Rating */}
              {primaryReviewSource?.rating && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-semibold">
                    {primaryReviewSource.rating}
                  </span>
                  <RatingStars rating={primaryReviewSource.rating} />
                  <span className="text-muted-foreground">
                    ({primaryReviewSource.review_count ?? 0} reviews on{' '}
                    {formatProvider(primaryReviewSource.provider)})
                  </span>
                </div>
              )}

              {/* Categories */}
              {business.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {business.categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/${basePath}/${cat.slug}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Location */}
              {business.formatted_address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{business.formatted_address}</span>
                </div>
              )}
            </div>

            {/* Claim CTA - Header */}
            {!business.is_claimed && (
              <div className="flex-shrink-0">
                <ClaimBusinessButton
                  size="lg"
                  siteBusinessId={business.site_business_id}
                  businessName={business.name}
                  businessWebsite={business.website}
                >
                  Claim This {businessTerm}
                </ClaimBusinessButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 px-4">
        <div className="mx-auto max-w-6xl">
          {/* Claim Banner - Prominent */}
          {!business.is_claimed && (
            <ClaimBusinessBanner
              className="mb-8"
              siteBusinessId={business.site_business_id}
              businessName={business.name}
              businessWebsite={business.website}
            />
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <section className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-xl font-semibold mb-4">
                  About {business.name}
                </h2>

                {/* Business Photo */}
                {getBusinessImageUrl(business.main_photo_name) ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted mb-4">
                    <Image
                      src={
                        getBusinessImageUrl(business.main_photo_name, {
                          width: 1200,
                        })!
                      }
                      alt={business.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 66vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted mb-4 flex items-center justify-center">
                    <Building2 className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}

                {business.description ? (
                  <p className="text-muted-foreground leading-relaxed">
                    {business.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">
                    No description available for this{' '}
                    {businessTerm.toLowerCase()}.
                  </p>
                )}
              </section>

              {/* Reviews Section - Suspense */}
              <Suspense fallback={<ReviewsSkeleton />}>
                <AsyncReviewsSection
                  businessId={businessId}
                  reviewSources={business.reviewSources}
                />
              </Suspense>

              {/* Map Section */}
              {business.latitude && business.longitude && (
                <section className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">Location</h2>
                  <div className="aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      <MapPin className="h-5 w-5" />
                      View on Google Maps
                    </a>
                  </div>
                  {business.formatted_address && (
                    <p className="mt-4 text-muted-foreground">
                      {business.formatted_address}
                    </p>
                  )}
                </section>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              <div className="lg:sticky lg:top-20">
                <BusinessContactCard
                  phone={business.phone}
                  website={business.website}
                  formattedAddress={business.formatted_address}
                  latitude={business.latitude}
                  longitude={business.longitude}
                  hours={business.hours}
                />

                {/* Secondary Claim CTA */}
                {!business.is_claimed && (
                  <div className="mt-6 rounded-lg border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Is this your business? Claim your listing to manage it.
                    </p>
                    <ClaimBusinessButton
                      variant="outline"
                      size="sm"
                      className="w-full"
                      siteBusinessId={business.site_business_id}
                      businessName={business.name}
                      businessWebsite={business.website}
                    >
                      Claim Listing
                    </ClaimBusinessButton>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Businesses - Suspense */}
          <Suspense fallback={<RelatedBusinessesSkeleton />}>
            <AsyncRelatedBusinesses
              siteId={site.id}
              businessId={businessId}
              businessCity={business.city}
              categorySlug={hasMultipleCategories ? category : null}
              basePath={basePath}
              hasMultipleCategories={hasMultipleCategories}
              hasMultipleCities={hasMultipleCities}
              title={`Similar ${businessTermPlural} in ${
                cityData?.name ?? business.city ?? 'your area'
              }`}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Async component for reviews
async function AsyncReviewsSection({
  businessId,
  reviewSources,
}: {
  businessId: string;
  reviewSources: BusinessDetailData['reviewSources'];
}) {
  const reviews = await getBusinessReviews(businessId);

  return (
    <BusinessReviewsSection reviews={reviews} reviewSources={reviewSources} />
  );
}

// Async component for related businesses
async function AsyncRelatedBusinesses({
  siteId,
  businessId,
  businessCity,
  categorySlug,
  basePath,
  hasMultipleCategories,
  hasMultipleCities,
  title,
}: {
  siteId: string;
  businessId: string;
  businessCity: string | null;
  categorySlug: string | null;
  basePath: string;
  hasMultipleCategories: boolean;
  hasMultipleCities: boolean;
  title: string;
}) {
  const relatedBusinesses = await getRelatedBusinesses(
    siteId,
    businessId,
    categorySlug,
    businessCity,
    6
  );

  return (
    <RelatedBusinessesSection
      businesses={relatedBusinesses}
      basePath={basePath}
      hasMultipleCategories={hasMultipleCategories}
      hasMultipleCities={hasMultipleCities}
      title={title}
    />
  );
}

// Skeleton components
function ReviewsSkeleton() {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-xl font-semibold mb-4">Reviews</h2>
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    </section>
  );
}

function RelatedBusinessesSkeleton() {
  return (
    <section className="w-full py-12">
      <h2 className="text-2xl font-bold tracking-tight mb-6">
        Similar Businesses
      </h2>
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    </section>
  );
}
