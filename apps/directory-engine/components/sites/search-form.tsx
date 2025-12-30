'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import {
  getBusinessSuggestions,
  type BusinessSuggestion,
} from '@/actions/search-suggestions';
import { slugify, cn } from '@/lib/utils';
import type { CategoryData, CityData } from '@/lib/routing';

type SearchFormProps = {
  basePath: string;
  categories: CategoryData[];
  cities: CityData[];
  className?: string;
};

export function SearchForm({
  basePath,
  categories,
  cities,
  className,
}: SearchFormProps) {
  const router = useRouter();
  const showLocationSearch = cities.length > 1;
  const showCategorySuggestions = categories.length > 1;

  // What search state
  const [whatQuery, setWhatQuery] = useState('');
  const [whatOpen, setWhatOpen] = useState(false);
  const [whatLoading, setWhatLoading] = useState(false);
  const [businessSuggestions, setBusinessSuggestions] = useState<
    BusinessSuggestion[]
  >([]);

  // Where search state
  const [whereQuery, setWhereQuery] = useState('');
  const [whereOpen, setWhereOpen] = useState(false);

  // Filter categories client-side
  const filteredCategories = showCategorySuggestions
    ? categories
        .filter((c) => c.name.toLowerCase().includes(whatQuery.toLowerCase()))
        .slice(0, 5)
    : [];

  // Filter cities client-side
  const filteredCities = cities
    .filter((c) => c.name.toLowerCase().includes(whereQuery.toLowerCase()))
    .slice(0, 10);

  // Fetch business suggestions from Typesense
  const fetchBusinessSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setBusinessSuggestions([]);
      return;
    }

    setWhatLoading(true);
    try {
      const results = await getBusinessSuggestions(query);
      setBusinessSuggestions(results);
    } catch (err) {
      console.error('Search error:', err);
      setBusinessSuggestions([]);
    } finally {
      setWhatLoading(false);
    }
  }, []);

  // Debounced business search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBusinessSuggestions(whatQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [whatQuery, fetchBusinessSuggestions]);

  // Build directory URL based on site configuration
  // Single-city sites omit city, single-category sites omit category
  const buildDirectoryUrl = (
    categorySlug?: string | null,
    citySlug?: string | null,
    businessId?: string | null
  ) => {
    const singleCity = cities.length === 1;
    const singleCategory = categories.length === 1;

    const parts = [basePath];

    // Add category if provided and not single-category site
    if (categorySlug && !singleCategory) {
      parts.push(categorySlug);
    }

    // Add city if provided and not single-city site
    if (citySlug && !singleCity) {
      parts.push(citySlug);
    }

    // Add business ID if provided
    if (businessId) {
      parts.push(businessId);
    }

    return '/' + parts.join('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const categorySlug = categories.find(
      (c) => c.name.toLowerCase() === whatQuery.toLowerCase()
    )?.slug;
    const citySlug = cities.find(
      (c) => c.name.toLowerCase() === whereQuery.toLowerCase()
    )?.slug;

    if (categorySlug || citySlug) {
      router.push(buildDirectoryUrl(categorySlug, citySlug));
    } else if (whatQuery.trim()) {
      // Free-text search
      const params = new URLSearchParams({ q: whatQuery });
      if (whereQuery.trim()) {
        params.set('city', slugify(whereQuery));
      }
      router.push(`/${basePath}?${params.toString()}`);
    } else {
      router.push(`/${basePath}`);
    }

    setWhatOpen(false);
    setWhereOpen(false);
  };

  const selectCategory = (category: CategoryData) => {
    setWhatQuery(category.name);
    setWhatOpen(false);

    // If only one city, navigate directly to results
    if (cities.length === 1) {
      router.push(buildDirectoryUrl(category.slug));
    }
  };

  const selectBusiness = (business: BusinessSuggestion) => {
    const citySlug = business.city ? slugify(business.city) : cities[0]?.slug;
    const categorySlug =
      business.categorySlug || categories[0]?.slug || 'business';

    router.push(buildDirectoryUrl(categorySlug, citySlug, business.id));
    setWhatOpen(false);
  };

  const selectCity = (city: CityData) => {
    setWhereQuery(city.name);
    setWhereOpen(false);
  };

  const hasWhatSuggestions =
    filteredCategories.length > 0 || businessSuggestions.length > 0;

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
      {/* What search */}
      <Popover open={whatOpen} onOpenChange={setWhatOpen}>
        <PopoverAnchor asChild>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={whatQuery}
              onChange={(e) => {
                setWhatQuery(e.target.value);
                setWhatOpen(true);
              }}
              onFocus={() => setWhatOpen(true)}
              onBlur={(e) => {
                // Delay close to allow clicking on popover items
                if (
                  !e.relatedTarget?.closest('[data-slot="popover-content"]')
                ) {
                  setTimeout(() => setWhatOpen(false), 150);
                }
              }}
              placeholder={
                showCategorySuggestions
                  ? 'Category or business name...'
                  : 'Search businesses...'
              }
              className="pl-10 pr-10"
            />
            {whatLoading && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
        </PopoverAnchor>
        {whatQuery.trim() && hasWhatSuggestions && (
          <PopoverContent
            className="w-[--radix-popover-anchor-width] p-0"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command>
              <CommandList>
                {filteredCategories.length > 0 && (
                  <CommandGroup heading="Categories">
                    {filteredCategories.map((cat) => (
                      <CommandItem
                        key={cat.slug}
                        value={cat.name}
                        onSelect={() => selectCategory(cat)}
                      >
                        {cat.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {businessSuggestions.length > 0 && (
                  <CommandGroup heading="Businesses">
                    {businessSuggestions.map((biz) => (
                      <CommandItem
                        key={biz.id}
                        value={biz.name}
                        onSelect={() => selectBusiness(biz)}
                        className="flex flex-col items-start"
                      >
                        <span>{biz.name}</span>
                        {biz.city && (
                          <span className="text-xs text-muted-foreground">
                            {biz.city}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {!hasWhatSuggestions && (
                  <CommandEmpty>No results found.</CommandEmpty>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>

      {/* Where search - only show if multiple cities */}
      {showLocationSearch && (
        <Popover open={whereOpen} onOpenChange={setWhereOpen}>
          <PopoverAnchor asChild>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={whereQuery}
                onChange={(e) => {
                  setWhereQuery(e.target.value);
                  setWhereOpen(true);
                }}
                onFocus={() => setWhereOpen(true)}
                onBlur={(e) => {
                  if (
                    !e.relatedTarget?.closest('[data-slot="popover-content"]')
                  ) {
                    setTimeout(() => setWhereOpen(false), 150);
                  }
                }}
                placeholder="City..."
                className="pl-10"
              />
            </div>
          </PopoverAnchor>
          {filteredCities.length > 0 && (
            <PopoverContent
              className="w-[--radix-popover-anchor-width] p-0"
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <Command>
                <CommandList>
                  <CommandGroup>
                    {filteredCities.map((city) => (
                      <CommandItem
                        key={city.slug}
                        value={city.name}
                        onSelect={() => selectCity(city)}
                      >
                        {city.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          )}
        </Popover>
      )}

      <Button type="submit" size="lg">
        Search
      </Button>
    </form>
  );
}
