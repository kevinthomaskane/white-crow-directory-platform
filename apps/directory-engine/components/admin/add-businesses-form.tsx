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
import { getCitiesByState } from '@/lib/actions/get-cities';
import { getCategoriesByVertical } from '@/lib/actions/get-categories';
import { generateCategoriesForVertical } from '@/lib/actions/generate-categories';
import { slugify } from '@/lib/normalize';

interface Vertical {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  name: string;
  slug: string;
  vertical_id: string;
}

interface State {
  id: string;
  name: string;
  code: string;
}

interface City {
  id: string;
  name: string;
  population: number | null;
  state_id: string;
}

interface AddBusinessesFormProps {
  verticals: Vertical[];
  states: State[];
}

export function AddBusinessesForm({
  verticals,
  states,
}: AddBusinessesFormProps) {
  const [verticalOpen, setVerticalOpen] = useState(false);
  const [selectedVertical, setSelectedVertical] = useState<Vertical | null>(
    null
  );
  const [customVertical, setCustomVertical] = useState('');

  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isGeneratingCategories, setIsGeneratingCategories] = useState(false);

  const [stateOpen, setStateOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<State | null>(null);

  const [citiesOpen, setCitiesOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCities, setSelectedCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const verticalName = selectedVertical?.name || customVertical;

  const stateLabel = selectedState
    ? `${selectedState.name} (${selectedState.code})`
    : '';

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

  useEffect(() => {
    if (selectedVertical) {
      void fetchCategories(selectedVertical.id);
    } else {
      setCategories([]);
    }
  }, [selectedVertical, fetchCategories]);

  useEffect(() => {
    if (selectedState) {
      void fetchCities(selectedState.id);
    } else {
      setCities([]);
    }
  }, [selectedState, fetchCities]);

  const handleVerticalSelect = (vertical: Vertical | null) => {
    setSelectedVertical(vertical);
    setCustomVertical('');
    setSelectedCategories([]);
    setVerticalOpen(false);
    setError(null);
  };

  const handleCustomVerticalChange = (value: string) => {
    setCustomVertical(value);
    setSelectedVertical(null);
    setCategories([]);
    setSelectedCategories([]);
    setError(null);
  };

  const handleCategoryToggle = (name: string) => {
    setSelectedCategories((prev) => {
      const key = slugify(name);
      const isSelected = prev.some((p) => slugify(p) === key);
      if (isSelected) return prev.filter((p) => slugify(p) !== key);
      return [...prev, name];
    });
  };

  const handleRemoveCategory = (name: string) => {
    const key = slugify(name);
    setSelectedCategories((prev) => prev.filter((p) => slugify(p) !== key));
  };

  const handleSelectAllCategories = () => {
    if (selectedVertical) {
      setSelectedCategories(categories.map((c) => c.name));
      return;
    }
    if (customVertical && categories.length > 0) {
      setSelectedCategories(categories.map((c) => c.name));
    }
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
  };

  const handleGenerateCategories = async () => {
    if (!customVertical.trim()) return;
    setIsGeneratingCategories(true);
    setError(null);
    try {
      const result = await generateCategoriesForVertical({
        vertical: customVertical.trim(),
      });
      // Store generated categories in the same shape as DB categories for UI reuse
      const generated = result.categories.map((name) => ({
        name,
        slug: slugify(name),
        vertical_id: selectedVertical?.id || '',
      }));
      setCategories(generated);
      setSelectedCategories(result.categories);
    } catch (err) {
      console.error('Error generating categories:', err);
      setError('Failed to generate categories.');
    } finally {
      setIsGeneratingCategories(false);
    }
  };

  const handleStateSelect = (state: State | null) => {
    setSelectedState(state);
    setSelectedCities([]); // reset cities when state changes
    setError(null);
    setStateOpen(false);
  };

  const handleCityToggle = (city: City) => {
    setSelectedCities((prev) => {
      const isSelected = prev.some((c) => c.id === city.id);
      if (isSelected) return prev.filter((c) => c.id !== city.id);
      return [...prev, city];
    });
  };

  const handleRemoveCity = (cityId: string) => {
    setSelectedCities((prev) => prev.filter((c) => c.id !== cityId));
  };

  const citiesButtonLabel = useMemo(() => {
    if (!selectedState) return 'Select a state first...';
    if (selectedCities.length > 0) {
      return `${selectedCities.length} cities selected`;
    }
    return 'Select cities...';
  }, [selectedState, selectedCities.length]);

  const categoriesButtonLabel = useMemo(() => {
    if (!verticalName) return 'Select a vertical first...';
    if (selectedVertical && isLoadingCategories) return 'Loading categories...';
    if (selectedCategories.length > 0) {
      return `${selectedCategories.length} categories selected`;
    }
    return 'Select categories...';
  }, [
    verticalName,
    selectedVertical,
    isLoadingCategories,
    selectedCategories.length,
  ]);

  const allCitiesSelected =
    Boolean(selectedState) &&
    cities.length > 0 &&
    selectedCities.length === cities.length;

  const handleSelectAllCities = () => {
    if (!selectedState) return;
    if (cities.length === 0) return;
    setSelectedCities(cities);
  };

  const handleClearCities = () => {
    setSelectedCities([]);
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
                {verticalName || 'Select or enter a vertical...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search or enter new vertical..."
                  value={customVertical}
                  onValueChange={handleCustomVerticalChange}
                  className="w-[300px]"
                />
                <CommandList>
                  <CommandEmpty>
                    {customVertical ? (
                      <button
                        type="button"
                        className="w-full px-2 py-1.5 text-left text-sm hover:bg-accent"
                        onClick={() => {
                          setSelectedVertical(null);
                          setVerticalOpen(false);
                        }}
                      >
                        Use &quot;{customVertical}&quot; as new vertical
                      </button>
                    ) : (
                      'No verticals found.'
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {verticals.map((vertical) => (
                      <CommandItem
                        key={vertical.id}
                        value={vertical.name}
                        onSelect={() => handleVerticalSelect(vertical)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedVertical?.id === vertical.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {vertical.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-sm text-muted-foreground">
            Select an existing vertical or type to create a new one.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-4">
            <Label>Categories</Label>
            <div className="flex items-center gap-2">
              {customVertical.trim() && !selectedVertical && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateCategories}
                  disabled={isGeneratingCategories}
                >
                  {isGeneratingCategories ? 'Generating...' : 'Generate'}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAllCategories}
                disabled={
                  (!selectedVertical && !customVertical.trim()) ||
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
                disabled={selectedCategories.length === 0}
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
                  (!selectedVertical && !customVertical.trim()) ||
                  (selectedVertical ? isLoadingCategories : false) ||
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
                    {categories.map((category, i) => (
                      <CommandItem
                        key={i}
                        value={category.name}
                        onSelect={() => handleCategoryToggle(category.name)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedCategories.some(
                              (c) => slugify(c) === slugify(category.name)
                            )
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
              {selectedCategories.map((name) => (
                <Badge
                  key={slugify(name)}
                  variant="secondary"
                  className="gap-1"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(name)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {!selectedVertical &&
          customVertical.trim() &&
          categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This is a new vertical. Click Generate to create suggested
              categories.
            </p>
          ) : selectedVertical &&
            categories.length === 0 &&
            !isLoadingCategories ? (
            <p className="text-sm text-muted-foreground">
              No categories exist for this vertical yet.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select one or more categories to use when generating Places
              queries.
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
                    {states.map((state) => (
                      <CommandItem
                        key={state.id}
                        value={`${state.name} ${state.code}`}
                        onSelect={() => handleStateSelect(state)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedState?.id === state.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {state.name} ({state.code})
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
                disabled={selectedCities.length === 0}
              >
                Clear
              </Button>
            </div>
          </div>

          {isLoadingCities ? (
            <p className="text-sm text-muted-foreground">Loading cities...</p>
          ) : (
            <Popover open={citiesOpen} onOpenChange={setCitiesOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                  disabled={!selectedState}
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
                              selectedCities.some((c) => c.id === city.id)
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
          )}

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
            {allCitiesSelected
              ? 'All cities are selected for this state.'
              : 'Select one or more cities for the selected state.'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
