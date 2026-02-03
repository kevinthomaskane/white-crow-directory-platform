import Image from 'next/image';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBusinessReviews } from '@/lib/data/site';
import { RatingStars, formatProvider } from '@/components/sites/business-card';
import type { BusinessReviewData } from '@/lib/types';

interface BusinessReviewsSectionProps {
  businessId: string;
  rating: number;
  totalReviews: number;
  className?: string;
}

export async function BusinessReviewsSection({
  businessId,
  totalReviews,
  rating,
  className,
}: BusinessReviewsSectionProps) {
  const reviews = await getBusinessReviews(businessId);

  return (
    <section
      className={cn('rounded-lg border border-border bg-card p-6', className)}
    >
      <h2 className="text-xl font-semibold mb-4">Reviews</h2>

      {/* Review Summary */}
      {totalReviews > 0 && (
        <div className="pb-6 border-b border-border mb-6">
          <div className="flex gap-2 items-center">
            <span className="font-bold">{rating}</span>
            <RatingStars rating={rating} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Total of {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
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
