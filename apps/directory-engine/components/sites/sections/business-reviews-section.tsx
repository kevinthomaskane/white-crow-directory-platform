import Image from 'next/image';
import { Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RatingStars, formatProvider } from '@/components/sites/business-card';
import type { BusinessReviewData } from '@/lib/types';

interface BusinessReviewsSectionProps {
  reviews: BusinessReviewData[];
  reviewSources: {
    rating: number | null;
    provider: string;
    review_count: number | null;
    url: string | null;
  }[];
  className?: string;
}

export function BusinessReviewsSection({
  reviews,
  reviewSources,
  className,
}: BusinessReviewsSectionProps) {
  const primarySource = reviewSources[0];
  const totalReviews = reviewSources.reduce(
    (sum, source) => sum + (source.review_count ?? 0),
    0
  );

  return (
    <section
      className={cn('rounded-lg border border-border bg-card p-6', className)}
    >
      <h2 className="text-xl font-semibold mb-4">Reviews</h2>

      {/* Review Summary */}
      {primarySource?.rating && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-border mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold">{primarySource.rating}</span>
            <div>
              <RatingStars rating={primarySource.rating} />
              <p className="text-sm text-muted-foreground mt-1">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>

          {/* Source breakdown */}
          {reviewSources.length > 0 && (
            <div className="flex flex-wrap gap-3 sm:ml-auto">
              {reviewSources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>
                    {source.rating} on {formatProvider(source.provider)}
                  </span>
                  {source.review_count && (
                    <span className="text-muted-foreground/70">
                      ({source.review_count})
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Individual Reviews */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">
          No reviews yet. Be the first to leave a review!
        </p>
      )}
    </section>
  );
}

function ReviewCard({ review }: { review: BusinessReviewData }) {
  const formattedDate = review.time
    ? new Date(review.time).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="border-b border-border pb-6 last:border-0 last:pb-0">
      <div className="flex items-start gap-3">
        {/* Author Avatar */}
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-muted">
          {review.author_image_url ? (
            <Image
              src={review.author_image_url}
              alt={review.author_name ?? 'Reviewer'}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Author name and date */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-medium">
              {review.author_name ?? 'Anonymous'}
            </span>
            {formattedDate && (
              <span className="text-sm text-muted-foreground">
                {formattedDate}
              </span>
            )}
          </div>

          {/* Rating */}
          {review.rating && (
            <div className="mt-1">
              <RatingStars rating={review.rating} />
            </div>
          )}

          {/* Review text */}
          {review.text && (
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
              {review.text}
            </p>
          )}

          {/* Source badge */}
          <div className="mt-2">
            <span className="text-xs text-muted-foreground/70">
              via {formatProvider(review.source)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
