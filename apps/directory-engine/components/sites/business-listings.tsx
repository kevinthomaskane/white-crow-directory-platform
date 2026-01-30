'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { slugify, buildDirectoryUrl } from '@/lib/utils';
import { BusinessCard } from '@/components/sites/business-card';
import { Button } from '@/components/ui/button';
import { fetchCategoryBusinesses } from '@/actions/fetch-category-businesses';
import { fetchCityBusinesses } from '@/actions/fetch-city-businesses';
import { fetchCategoryCityBusinesses } from '@/actions/fetch-category-city-businesses';
import type { BusinessCardData, RouteContext } from '@/lib/types';

type ListingType = 'category' | 'city' | 'category-city';

interface BusinessListingsProps {
  initialBusinesses: BusinessCardData[];
  initialTotal: number;
  initialHasMore: boolean;
  initialPage: number;
  basePath: string;
  ctx: RouteContext;
  categorySlug?: string;
  citySlug?: string;
  loadMoreLabel?: string;
  emptyMessage?: string;
  itemsPerPage?: number;
  featuredBusinesses: BusinessCardData[];
}

export function BusinessListings({
  initialBusinesses,
  initialTotal,
  initialHasMore,
  initialPage,
  basePath,
  ctx,
  categorySlug,
  citySlug,
  loadMoreLabel = 'Load More',
  emptyMessage = 'No businesses found.',
  itemsPerPage = 12,
  featuredBusinesses,
}: BusinessListingsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [businesses, setBusinesses] =
    useState<BusinessCardData[]>(initialBusinesses);
  const [total] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(initialPage);
  const [isPending, startTransition] = useTransition();

  const singleCity = ctx.cityList.length === 1;
  const singleCategory = ctx.categoryList.length === 1;

  // Determine listing type based on provided slugs
  const listingType: ListingType =
    categorySlug && citySlug
      ? 'category-city'
      : categorySlug
        ? 'category'
        : 'city';

  const fetchMoreBusinesses = async (nextPage: number) => {
    switch (listingType) {
      case 'category':
        return fetchCategoryBusinesses(categorySlug!, nextPage, itemsPerPage);
      case 'city':
        return fetchCityBusinesses(citySlug!, nextPage, itemsPerPage);
      case 'category-city':
        return fetchCategoryCityBusinesses(
          categorySlug!,
          citySlug!,
          nextPage,
          itemsPerPage
        );
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;

    startTransition(async () => {
      const result = await fetchMoreBusinesses(nextPage);

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
        {featuredBusinesses.map((business) => (
          <BusinessCard
            key={business.id}
            business={business}
            href={buildDirectoryUrl({
              basePath,
              categorySlug:
                categorySlug ||
                business.category?.slug ||
                ctx.categoryList[0]?.slug,
              citySlug:
                citySlug ||
                (business.city ? slugify(business.city) : undefined) ||
                ctx.cityList[0]?.slug,
              businessId: business.id,
              singleCity,
              singleCategory,
            })}
            featured
          />
        ))}
        {businesses.map((business) => (
          <BusinessCard
            key={business.id}
            business={business}
            href={buildDirectoryUrl({
              basePath,
              categorySlug:
                categorySlug ||
                business.category?.slug ||
                ctx.categoryList[0]?.slug,
              citySlug:
                citySlug ||
                (business.city ? slugify(business.city) : undefined) ||
                ctx.cityList[0]?.slug,
              businessId: business.id,
              singleCity,
              singleCategory,
            })}
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
