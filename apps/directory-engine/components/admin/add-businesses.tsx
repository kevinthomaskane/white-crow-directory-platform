'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getCategoriesByVertical } from '@/actions/get-categories';
import { getCitiesByState } from '@/actions/get-cities';
import { submitGooglePlacesSearchJob } from '@/actions/submit-job';
import {
  GooglePlacesSearchJobPayloadSchema,
  type GooglePlacesSearchJobPayload,
  type PlacesSearchQuery,
} from '@white-crow/shared';

type Vertical = { id: string; name: string; slug: string };
type Category = { id: string; name: string; slug: string; vertical_id: string };
type State = { id: string; name: string; code: string };
type City = {
  id: string;
  name: string;
  population: number | null;
  state_id: string;
};

export function AddBusinessesForm({
  verticals,
  states,
}: {
  verticals: Vertical[];
  states: State[];
}) {
  // vertical -> categories
  const [verticalOpen, setVerticalOpen] = useState(false);
  const [selectedVertical, setSelectedVertical] = useState<Vertical | null>(
    null
  );
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // state -> cities
  const [stateOpen, setStateOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [citiesOpen, setCitiesOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // submit + preview
  const [removedQueries, setRemovedQueries] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCategories = useCallback(async (verticalId: string) => {
    setIsLoadingCategories(true);
    try {
      const result = await getCategoriesByVertical(verticalId);
      setCategories(result.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
      setError('Failed to fetch categories for this vertical.');
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  const fetchCities = useCallback(async (stateId: string) => {
    setIsLoadingCities(true);
    try {
      const result = await getCitiesByState(stateId);
      setCities(result.cities);
    } catch (err) {
      console.error('Error fetching cities:', err);
      setCities([]);
      setError('Failed to fetch cities for this state.');
    } finally {
      setIsLoadingCities(false);
    }
  }, []);

  useEffect(() => {
    setCategories([]);
    setSelectedCategoryIds([]);
    setCategoriesOpen(false);
    if (selectedVertical) void fetchCategories(selectedVertical.id);
  }, [selectedVertical, fetchCategories]);

  useEffect(() => {
    setCities([]);
    setSelectedCityIds([]);
    setCitiesOpen(false);
    if (selectedState) void fetchCities(selectedState.id);
  }, [selectedState, fetchCities]);

  // Clear preview removals when inputs change
  useEffect(() => {
    setRemovedQueries(new Set());
  }, [
    selectedVertical?.id,
    selectedState?.id,
    selectedCategoryIds,
    selectedCityIds,
  ]);

  const stateLabel = selectedState
    ? `${selectedState.name} (${selectedState.code})`
    : '';

  const categoriesButtonLabel = useMemo(() => {
    if (!selectedVertical) return 'Select a vertical first...';
    if (isLoadingCategories) return 'Loading categories...';
    if (selectedCategoryIds.length > 0) {
      return `${selectedCategoryIds.length} categories selected`;
    }
    return 'Select categories...';
  }, [selectedVertical, isLoadingCategories, selectedCategoryIds.length]);

  const citiesButtonLabel = useMemo(() => {
    if (!selectedState) return 'Select a state first...';
    if (isLoadingCities) return 'Loading cities...';
    if (selectedCityIds.length > 0) {
      return `${selectedCityIds.length} cities selected`;
    }
    return 'Select cities...';
  }, [selectedState, isLoadingCities, selectedCityIds.length]);

  const selectedCategories = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c]));
    return selectedCategoryIds
      .map((id) => map.get(id))
      .filter(Boolean) as Category[];
  }, [categories, selectedCategoryIds]);

  const selectedCities = useMemo(() => {
    const map = new Map(cities.map((c) => [c.id, c]));
    return selectedCityIds.map((id) => map.get(id)).filter(Boolean) as City[];
  }, [cities, selectedCityIds]);

  const previewQueries = useMemo(() => {
    if (!selectedVertical || !selectedState) return [];
    if (selectedCategories.length === 0 || selectedCities.length === 0)
      return [];

    const queries: string[] = [];
    for (const category of selectedCategories) {
      for (const city of selectedCities) {
        queries.push(
          `${category.name} ${selectedVertical.name} ${city.name} ${selectedState.code}`
        );
      }
    }
    return queries;
  }, [selectedVertical, selectedState, selectedCategories, selectedCities]);

  const activeQueries = useMemo(() => {
    return previewQueries.filter((q) => !removedQueries.has(q));
  }, [previewQueries, removedQueries]);

  const handleRemoveQuery = (query: string) => {
    setRemovedQueries((prev) => new Set(prev).add(query));
  };

  const handleVerticalSelect = (v: Vertical | null) => {
    setSelectedVertical(v);
    setVerticalOpen(false);
    setError(null);
    setSuccess(null);
  };

  const handleCategoryToggle = (category: Category) => {
    setSelectedCategoryIds((prev) => {
      const isSelected = prev.includes(category.id);
      if (isSelected) return prev.filter((id) => id !== category.id);
      return [...prev, category.id];
    });
  };

  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) => prev.filter((id) => id !== categoryId));
  };

  const handleSelectAllCategories = () => {
    if (!selectedVertical) return;
    if (categories.length === 0) return;
    setSelectedCategoryIds(categories.map((c) => c.id));
  };

  const handleClearCategories = () => setSelectedCategoryIds([]);

  const handleStateSelect = (s: State | null) => {
    setSelectedState(s);
    setStateOpen(false);
    setError(null);
    setSuccess(null);
  };

  const handleCityToggle = (city: City) => {
    setSelectedCityIds((prev) => {
      const isSelected = prev.includes(city.id);
      if (isSelected) return prev.filter((id) => id !== city.id);
      return [...prev, city.id];
    });
  };

  const handleRemoveCity = (cityId: string) => {
    setSelectedCityIds((prev) => prev.filter((id) => id !== cityId));
  };

  const handleSelectAllCities = () => {
    if (!selectedState) return;
    if (cities.length === 0) return;
    setSelectedCityIds(cities.map((c) => c.id));
  };

  const handleClearCities = () => setSelectedCityIds([]);

  const constructJobPayload = (): GooglePlacesSearchJobPayload => {
    if (!selectedVertical || !selectedState)
      throw new Error('Missing required fields.');
    if (selectedCategories.length === 0)
      throw new Error('Select at least one category.');
    if (selectedCities.length === 0)
      throw new Error('Select at least one city.');

    // Rebuild PlacesSearchQuery list from selected IDs so we can include category IDs
    const payloadQueries: PlacesSearchQuery[] = [];
    for (const category of selectedCategories) {
      for (const city of selectedCities) {
        const q = `${category.name} ${selectedVertical.name} ${city.name} ${selectedState.code}`;
        if (removedQueries.has(q)) continue;
        payloadQueries.push({
          query: q,
          category: category.id,
        });
      }
    }

    return {
      jobType: 'google-places-search',
      vertical: selectedVertical.id,
      queries: payloadQueries,
    };
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    try {
      const payload = constructJobPayload();
      const validated = GooglePlacesSearchJobPayloadSchema.parse(payload);
      setIsSubmitting(true);
      await submitGooglePlacesSearchJob(validated);

      // reset
      setSelectedVertical(null);
      setSelectedCategoryIds([]);
      setSelectedState(null);
      setSelectedCityIds([]);
      setRemovedQueries(new Set());
      setSuccess('Submitted job successfully.');
    } catch (err) {
      console.error('Error submitting job:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {/* Vertical */}
        <div className="space-y-2">
          <Label>Vertical</Label>
          <Popover open={verticalOpen} onOpenChange={setVerticalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={verticalOpen}
                className="w-full justify-between"
              >
                {selectedVertical?.name || 'Select a vertical...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search verticals..." />
                <CommandList>
                  <CommandEmpty>No verticals found.</CommandEmpty>
                  <CommandGroup>
                    {verticals.map((v) => (
                      <CommandItem
                        key={v.id}
                        value={v.name}
                        onSelect={() => handleVerticalSelect(v)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedVertical?.id === v.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {v.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-sm text-muted-foreground">
            Select a vertical to load categories.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-4">
            <Label>Categories</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAllCategories}
                disabled={
                  !selectedVertical ||
                  isLoadingCategories ||
                  categories.length === 0
                }
              >
                Select all
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearCategories}
                disabled={selectedCategoryIds.length === 0}
              >
                Clear
              </Button>
            </div>
          </div>

          <Popover open={categoriesOpen} onOpenChange={setCategoriesOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
                disabled={
                  !selectedVertical ||
                  isLoadingCategories ||
                  categories.length === 0
                }
              >
                {categoriesButtonLabel}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search categories..." />
                <CommandList>
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup>
                    {categories.map((category) => (
                      <CommandItem
                        key={category.id}
                        value={category.name}
                        onSelect={() => handleCategoryToggle(category)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedCategoryIds.includes(category.id)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {category.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <Badge key={category.id} variant="secondary" className="gap-1">
                  {category.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(category.id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {selectedVertical &&
          categories.length === 0 &&
          !isLoadingCategories ? (
            <p className="text-sm text-muted-foreground">
              No categories exist for this vertical yet.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select one or more categories to generate Places queries.
            </p>
          )}
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label>State</Label>
          <Popover open={stateOpen} onOpenChange={setStateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={stateOpen}
                className="w-full justify-between"
              >
                {stateLabel || 'Select a state...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search states..." />
                <CommandList>
                  <CommandEmpty>No states found.</CommandEmpty>
                  <CommandGroup>
                    {states.map((s) => (
                      <CommandItem
                        key={s.id}
                        value={`${s.name} ${s.code}`}
                        onSelect={() => handleStateSelect(s)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedState?.id === s.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {s.name} ({s.code})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-sm text-muted-foreground">
            Select the state to load cities.
          </p>
        </div>

        {/* Cities */}
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-4">
            <Label>Cities</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAllCities}
                disabled={
                  !selectedState || isLoadingCities || cities.length === 0
                }
              >
                Select all
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearCities}
                disabled={selectedCityIds.length === 0}
              >
                Clear
              </Button>
            </div>
          </div>

          <Popover open={citiesOpen} onOpenChange={setCitiesOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
                disabled={
                  !selectedState || isLoadingCities || cities.length === 0
                }
              >
                {citiesButtonLabel}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search cities..." />
                <CommandList>
                  <CommandEmpty>No cities found.</CommandEmpty>
                  <CommandGroup>
                    {cities.map((city) => (
                      <CommandItem
                        key={city.id}
                        value={city.name}
                        onSelect={() => handleCityToggle(city)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedCityIds.includes(city.id)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {city.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedCities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCities.map((city) => (
                <Badge key={city.id} variant="secondary" className="gap-1">
                  {city.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveCity(city.id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Select one or more cities for the selected state.
          </p>
        </div>

        {/* Query Preview */}
        {previewQueries.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Preview Queries ({activeQueries.length} of{' '}
                {previewQueries.length})
              </Label>
              {removedQueries.size > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRemovedQueries(new Set())}
                >
                  Restore all
                </Button>
              )}
            </div>
            {activeQueries.length > 0 ? (
              <div className="max-h-64 overflow-y-auto rounded-lg border bg-muted/50 p-4">
                <div className="flex flex-wrap gap-2">
                  {activeQueries.map((query, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="gap-1 font-mono text-xs"
                    >
                      {query}
                      <button
                        type="button"
                        onClick={() => handleRemoveQuery(query)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                All queries have been removed. Click &quot;Restore all&quot; to
                restore them.
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Format: [category] [vertical] [city] [state]. Remove any queries
              you don&apos;t want to submit.
            </p>
          </div>
        )}

        {/* Submit */}
        {activeQueries.length > 0 && (
          <div className="pt-4">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || activeQueries.length === 0}
              className="w-full"
              size="lg"
            >
              {isSubmitting
                ? 'Submitting...'
                : `Submit ${activeQueries.length} queries`}
            </Button>
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-700/20 bg-green-700/10 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
