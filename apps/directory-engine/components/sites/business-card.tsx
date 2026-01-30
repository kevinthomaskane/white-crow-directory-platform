import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  Building2,
  Phone,
  Globe,
  MapPin,
  ExternalLink,
  Check,
} from 'lucide-react';
import { cn, getBusinessImageUrl } from '@/lib/utils';
import type { BusinessCardData } from '@/lib/types';

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

  return (
    <Link
      href={href}
      className={cn(
        'group flex w-full gap-4 rounded-lg border bg-card p-4 transition-all sm:gap-6',
        featured
          ? 'border-primary/50 shadow-md ring-1 ring-primary/20'
          : 'border-border hover:border-primary/50 hover:shadow-md',
        className
      )}
    >
      {/* Image */}
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

      {/* Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header row: Name + Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {business.name}
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
        {business.reviewSource?.rating && (
          <div className="mt-1 flex items-center gap-1.5 text-sm">
            <span className="font-medium">{business.reviewSource.rating}</span>
            <RatingStars rating={business.reviewSource.rating} />
          </div>
        )}

        {/* Category and City */}
        <div className="mt-1 text-sm text-muted-foreground line-clamp-1">
          {[business.category?.name, business.city].filter(Boolean).join(' • ')}
        </div>

        {/* Contact info row */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {business.formatted_address && (
            <div className="flex items-center gap-1 line-clamp-1">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{business.formatted_address}</span>
            </div>
          )}
          {business.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{business.phone}</span>
            </div>
          )}
          {business.website && (
            <div className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate max-w-[150px]">
                {formatWebsiteDisplay(business.website)}
              </span>
              <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-50" />
            </div>
          )}
        </div>

        {/* CTA for featured cards */}
        {featured && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
              View Profile
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </div>
        )}
      </div>
    </Link>
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

function ClaimBadge({
  isClaimed,
  hasPlan,
}: {
  isClaimed: boolean | null;
  hasPlan: boolean;
}) {
  if (hasPlan) {
    return (
      <div className="flex-shrink-0 rounded-full bg-amber-400 p-1 dark:bg-white">
        <Check
          strokeWidth={4}
          className="h-3.5 w-3.5 text-white dark:text-amber-400"
        />
      </div>
    );
  }

  if (isClaimed) {
    return (
      <div className="flex-shrink-0 rounded-full bg-green-400 p-1 dark:bg-white">
        <Check
          strokeWidth={4}
          className="h-3.5 w-3.5 text-white dark:text-green-400"
        />
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 rounded-full bg-gray-300 p-1">
      <Check strokeWidth={4} className="h-3.5 w-3.5 text-white" />
    </div>
  );
}

export { RatingStars, formatProvider };
