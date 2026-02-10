import { Fragment, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, Building2, MapPin, Loader2, Dot } from 'lucide-react';
import type { SiteConfig, RouteContext } from '@/lib/types';
import { getBusinessImageUrl, buildDirectoryUrl } from '@/lib/utils';
import { getBusinessDetails } from '@/lib/data/site';
import { RatingStars } from '@/components/sites/business-card';
import { ClaimBusinessBanner } from '@/components/sites/sections/claim-business-banner';
import { ClaimBusinessButton } from '@/components/sites/claim/claim-business-button';
import { BusinessReviewsSection } from '@/components/sites/sections/business-reviews-section';
import { BusinessContactCard } from '@/components/sites/sections/business-contact-card';
import { RelatedBusinessesSection } from '@/components/sites/sections/related-businesses-section';
import { BusinessListingsSkeleton } from '@/components/sites/business-listings-skeleton';
import { ClaimBadge } from '@/components/sites/claim-badge';
import { BusinessMediaGallery } from '@/components/sites/business-media-gallery';
import { SingleBusinessMapWrapper } from '@/components/sites/single-business-map-wrapper';
import { FeedbackForm } from '@/components/sites/profile/feedback-form';
import { getBreadcrumbListSchema, getLocalBusinessSchema } from '@/lib/schemas';

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
  const businessesTerm = site.vertical?.term_businesses ?? 'Businesses';
  const businessesTermLower = businessesTerm.toLowerCase();

  const singleCategory = ctx.categoryList.length === 1;
  const singleCity = ctx.cityList.length === 1;

  // Fetch business details (critical for page render)
  const business = await getBusinessDetails(
    site.id,
    ctx.categoryList,
    businessId
  );

  if (!business) return notFound();

  // Find category and city names for breadcrumb
  const categoryData = ctx.categoryList.find((c) => c.slug === category);

  if (!categoryData) return notFound();

  const cityData = ctx.cityList.find((c) => c.slug === city);

  if (!cityData) return notFound();

  let totalRating = 0;
  let totalReviews = 0;
  business.reviewSources.forEach((source) => {
    if (source.rating && source.review_count) {
      totalRating += source.rating * source.review_count;
      totalReviews += source.review_count;
    }
  });
  const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

  const pagePath = buildDirectoryUrl({
    basePath,
    categorySlug: category,
    citySlug: city,
    singleCity,
    singleCategory,
    businessId: business.id,
  });
  const pageUrl = `https://${site.domain}${pagePath}`;
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getLocalBusinessSchema({
              name: business.name,
              description: business.description ?? '',
              telephone: business.phone ?? '',
              address: business.formatted_address ?? '',
              aggregateRating: {
                reviewCount: totalReviews,
                ratingValue: averageRating,
              },
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbListSchema([
              {
                name: businessesTerm ?? 'Directory',
                url: `https://${site.domain}/${basePath}`,
              },
              ...(!singleCategory
                ? [
                    {
                      name: categoryData.name,
                      url: buildDirectoryUrl({
                        basePath,
                        categorySlug: category,
                        singleCity,
                        singleCategory,
                      }),
                    },
                  ]
                : []),
              ...(!singleCity
                ? [
                    {
                      name: cityData.name,
                      url: buildDirectoryUrl({
                        basePath,
                        categorySlug: category,
                        citySlug: city,
                        singleCity,
                        singleCategory,
                      }),
                    },
                  ]
                : []),
              {
                name: business.name,
                url: pageUrl,
              },
            ])
          ),
        }}
      />
      {/* Header */}
      <div className="bg-muted/30 py-12">
        <div className="mx-auto max-w-6xl px-4">
          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link
              href={buildDirectoryUrl({ basePath, singleCity, singleCategory })}
              className="hover:text-foreground"
            >
              {businessesTerm ?? 'Directory'}
            </Link>
            {!singleCategory && (
              <>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <Link
                  href={buildDirectoryUrl({
                    basePath,
                    categorySlug: category,
                    singleCity,
                    singleCategory,
                  })}
                  className="hover:text-foreground"
                >
                  {categoryData.name}
                </Link>
              </>
            )}
            {!singleCity && (
              <>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                <Link
                  href={buildDirectoryUrl({
                    basePath,
                    categorySlug: category,
                    citySlug: city,
                    singleCity,
                    singleCategory,
                  })}
                  className="hover:text-foreground"
                >
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
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {business.name}
                </h1>
                <ClaimBadge
                  isClaimed={business.is_claimed}
                  hasPlan={!!business.plan}
                />
              </div>

              {/* Rating */}
              {totalReviews > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-semibold">{averageRating}</span>
                  <RatingStars rating={averageRating} />
                  <span className="text-muted-foreground">
                    ({totalReviews} reviews)
                  </span>
                </div>
              )}

              {/* Categories */}
              {business.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {business.categories.map((cat, i, self) => {
                    return (
                      <Fragment key={cat.slug}>
                        <Link
                          key={cat.slug}
                          href={buildDirectoryUrl({
                            basePath,
                            categorySlug: cat.slug,
                            singleCity,
                            singleCategory,
                          })}
                          className="text-sm text-primary hover:underline"
                        >
                          {cat.name}
                        </Link>
                        <Dot
                          className={`h-4 w-4 self-center ${
                            i === self.length - 1 ? 'hidden' : 'block'
                          }`}
                        />
                      </Fragment>
                    );
                  })}
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="mx-auto max-w-6xl px-4">
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
                      loading="eager"
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

                {/* Media Gallery */}
                {business.media.length > 0 && (
                  <BusinessMediaGallery
                    media={business.media}
                    businessName={business.name}
                    className="mb-4"
                  />
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
                <BusinessReviewsSection
                  businessId={businessId}
                  rating={averageRating}
                  totalReviews={totalReviews}
                />
              </Suspense>

              {/* Map Section */}
              {business.latitude && business.longitude && (
                <section className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-xl font-semibold mb-4">Location</h2>
                  {process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ? (
                    <SingleBusinessMapWrapper
                      latitude={business.latitude}
                      longitude={business.longitude}
                      mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                    />
                  ) : (
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
                  )}
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
                  plan={business.plan}
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
          {!business.plan && (
            <Suspense
              fallback={
                <BusinessListingsSkeleton
                  title="Similar Businesses"
                  count={6}
                  className="py-12"
                />
              }
            >
              <RelatedBusinessesSection
                siteId={site.id}
                categoryList={ctx.categoryList}
                businessId={businessId}
                categorySlug={!singleCategory ? category : null}
                cityName={business.city}
                basePath={basePath}
                singleCategory={singleCategory}
                singleCity={singleCity}
                title={`Similar ${businessesTermLower} in ${
                  cityData?.name ?? business.city ?? 'your area'
                }`}
              />
            </Suspense>
          )}

          {/* Feedback */}
          <section className="rounded-lg border border-border bg-muted/30 p-6">
            <h2 className="text-xl font-semibold mb-2">Share Your Feedback</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your feedback helps us improve our directory.
            </p>
            <FeedbackForm
              siteName={site.name}
              placeholder="Is there any additional information you would like to see about this business?"
              tag="Business Feedback"
            />
          </section>
        </div>
      </div>
    </div>
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
