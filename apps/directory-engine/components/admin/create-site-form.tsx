'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { createSite } from '@/actions/create-site';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type {
  CategoryMinimal,
  CityMinimal,
  StateMinimal,
  VerticalMinimal,
} from '@/lib/types';

type CreateSiteFormProps = {
  verticals: VerticalMinimal[];
  states: StateMinimal[];
};

export function CreateSiteForm({ verticals, states }: CreateSiteFormProps) {
  const router = useRouter();

  // site name
  const [siteName, setSiteName] = useState('');

  // vertical -> categories
  const [verticalOpen, setVerticalOpen] = useState(false);
  const [selectedVertical, setSelectedVertical] =
    useState<VerticalMinimal | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryMinimal[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<
    Array<CategoryMinimal['id']>
  >([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // state -> cities
  const [stateOpen, setStateOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<StateMinimal | null>(null);
  const [citiesOpen, setCitiesOpen] = useState(false);
  const [cities, setCities] = useState<CityMinimal[]>([]);
  const [selectedCityIds, setSelectedCityIds] = useState<
    Array<CityMinimal['id']>
  >([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = useCallback(async (verticalId: string) => {
    setIsLoadingCategories(true);
    try {
      const res = await getCategoriesByVertical(verticalId);
      if (!res.ok) {
        setCategories([]);
        setError(res.error || 'Failed to fetch categories for this vertical.');
        return;
      }
      setCategories(res.data);
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
      const res = await getCitiesByState(stateId);
      if (!res.ok) {
        setCities([]);
        setError(res.error || 'Failed to fetch cities for this state.');
        return;
      }
      setCities(res.data);
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
      .filter(Boolean) as CategoryMinimal[];
  }, [categories, selectedCategoryIds]);

  const selectedCities = useMemo(() => {
    const map = new Map(cities.map((c) => [c.id, c]));
    return selectedCityIds
      .map((id) => map.get(id))
      .filter(Boolean) as CityMinimal[];
  }, [cities, selectedCityIds]);

  const handleVerticalSelect = (v: VerticalMinimal) => {
    setSelectedVertical(v);
    setVerticalOpen(false);
    setError(null);
  };

  const handleCategoryToggle = (category: CategoryMinimal) => {
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

  const handleStateSelect = (s: StateMinimal) => {
    setSelectedState(s);
    setStateOpen(false);
    setError(null);
  };

  const handleCityToggle = (city: CityMinimal) => {
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

  const isFormValid =
    siteName.trim() !== '' &&
    selectedVertical !== null &&
    selectedState !== null &&
    selectedCategoryIds.length > 0 &&
    selectedCityIds.length > 0;

  const handleSubmit = async () => {
    if (!selectedVertical || !selectedState) return;

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await createSite({
        name: siteName,
        verticalId: selectedVertical.id,
        stateId: selectedState.id,
        categoryIds: selectedCategoryIds,
        cityIds: selectedCityIds,
      });

      if (!res.ok) {
        setError(res.error || 'Failed to create site.');
        return;
      }

      setSuccess(`Site "${res.data.name}" created successfully. Redirecting...`);
      setTimeout(() => {
        router.push('/admin/sites');
      }, 1500);
    } catch (err) {
      console.error('Error creating site:', err);
      setError(err instanceof Error ? err.message : 'Failed to create site.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {/* Site Name */}
        <div className="space-y-2">
          <Label htmlFor="site-name">Site Name (Domain)</Label>
          <Input
            id="site-name"
            type="text"
            placeholder="e.g., chicagolawyers.com"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Enter the domain name for this directory site.
          </p>
        </div>

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
              Select the categories of businesses to include in this directory.
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
            Select the cities this directory will cover.
          </p>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? 'Creating...' : 'Create Site'}
          </Button>
        </div>

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
