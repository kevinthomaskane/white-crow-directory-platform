'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { BusinessCard } from '@/components/sites/business-card';
import { Button } from '@/components/ui/button';
import { fetchCategoryCityBusinesses } from '@/actions/fetch-category-city-businesses';
import type { BusinessCardData } from '@/lib/types';

interface CategoryCityBusinessListingsProps {
  initialBusinesses: BusinessCardData[];
  initialTotal: number;
  initialHasMore: boolean;
  initialPage: number;
  categorySlug: string;
  citySlug: string;
  basePath: string;
  loadMoreLabel?: string;
  emptyMessage?: string;
  itemsPerPage?: number;
}

export function CategoryCityBusinessListings({
  initialBusinesses,
  initialTotal,
  initialHasMore,
  initialPage,
  categorySlug,
  citySlug,
  basePath,
  loadMoreLabel = 'Load More',
  emptyMessage = 'No businesses found.',
  itemsPerPage = 12,
}: CategoryCityBusinessListingsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [businesses, setBusinesses] =
    useState<BusinessCardData[]>(initialBusinesses);
  const [total] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(initialPage);
  const [isPending, startTransition] = useTransition();

  const buildBusinessUrl = (businessId: string) => {
    const parts = [basePath, categorySlug, citySlug, businessId];
    return '/' + parts.join('/');
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;

    startTransition(async () => {
      const result = await fetchCategoryCityBusinesses(
        categorySlug,
        citySlug,
        nextPage,
        itemsPerPage
      );

      if (result.ok) {
        setBusinesses((prev) => [...prev, ...result.data.businesses]);
        setHasMore(result.data.hasMore);
        setPage(nextPage);

        // Update URL without navigation
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(nextPage));
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    });
  };

  if (businesses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-8 text-lg text-muted-foreground">
        Showing {businesses.length} of {total.toLocaleString()} results
      </p>

      <div className="flex flex-col gap-4">
        {businesses.map((business) => (
          <BusinessCard
            key={business.id}
            business={business}
            href={buildBusinessUrl(business.id)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            variant="outline"
            onClick={handleLoadMore}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              loadMoreLabel
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
