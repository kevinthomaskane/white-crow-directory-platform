import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  Building2,
  Phone,
  Globe,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { cn, getBusinessImageUrl } from '@/lib/utils';
import type { BusinessCardData } from '@/lib/types';
import { ClaimBadge } from './claim-badge';
import { Button } from '../ui/button';

interface BusinessCardProps {
  business: BusinessCardData;
  href: string;
  className?: string;
  featured?: boolean;
}

export function BusinessCard({
  featured,
  business,
  href,
  className,
}: BusinessCardProps) {
  // const providerLabel = formatProvider(business.reviewSource?.provider);
  const showContactCtaRow =
    business.plan && (business.phone || business.website);

  return (
    <div
      className={cn(
        'group flex w-full gap-4 rounded-lg border bg-card p-4 transition-all sm:gap-6',
        featured
          ? 'border-primary/50 shadow-md ring-1 ring-primary/20'
          : 'border-border hover:border-primary/50 hover:shadow-md',
        className
      )}
    >
      {/* Image */}
      {business.plan && (
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:h-32 sm:w-32">
          {getBusinessImageUrl(business.main_photo_name) ? (
            <Image
              src={getBusinessImageUrl(business.main_photo_name)!}
              alt={business.name}
              fill
              sizes="(max-width: 640px) 96px, 128px"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>
      )}
      {/* Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header row: Name + Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary hover:underline transition-colors line-clamp-1">
              <Link href={href} aria-label={business.name}>
                {business.name}
              </Link>
            </h3>
            {featured && (
              <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-muted-foreground">
                Featured
              </span>
            )}
          </div>
          <ClaimBadge
            isClaimed={business.is_claimed}
            hasPlan={!!business.plan}
          />
        </div>

        {/* Rating row */}
        {business.plan && (
          <>
            {business.reviewSource?.rating && (
              <div className="mt-1 flex items-center gap-1.5 text-sm">
                <span className="font-medium">
                  {business.reviewSource.rating}
                </span>
                <RatingStars rating={business.reviewSource.rating} />
              </div>
            )}
          </>
        )}

        {/* Category and City */}
        <div className="mt-1 text-sm text-muted-foreground line-clamp-1">
          {[business.category?.name, business.city].filter(Boolean).join(' • ')}
        </div>

        {/* Contact info row */}
        <div className="mt-2 flex flex-col gap-4 text-sm text-muted-foreground">
          {business.formatted_address && (
            <div className="flex items-center gap-1 line-clamp-1">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{business.formatted_address}</span>
            </div>
          )}
          {showContactCtaRow && (
            <div className="flex flex-wrap gap-2">
              {business.phone && business.plan && (
                <a
                  href={`tel:${business.phone}`}
                  rel="noopener noreferrer"
                  aria-label="phone number"
                >
                  <Button className="inline-flex" variant="outline">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    {business.phone}
                  </Button>
                </a>
              )}
              {business.website && business.website && (
                <a
                  href={`${business.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="website"
                >
                  <Button className="inline-flex" variant="outline">
                    <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate max-w-[150px]">
                      {formatWebsiteDisplay(business.website)}
                    </span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3.5 w-3.5',
            i < fullStars
              ? 'fill-yellow-400 text-yellow-400'
              : i === fullStars && hasHalfStar
                ? 'fill-yellow-400/50 text-yellow-400'
                : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}

function formatProvider(provider: string | null | undefined): string | null {
  if (!provider) return null;

  const providerMap: Record<string, string> = {
    google_places: 'Google',
    yelp: 'Yelp',
    facebook: 'Facebook',
  };

  return providerMap[provider] || provider;
}

function formatWebsiteDisplay(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export { RatingStars, formatProvider };
