'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { getCitiesByState } from '@/actions/get-cities';
import { addSiteCities } from '@/actions/add-site-cities';
import type { CityMinimal } from '@/lib/types';

interface AddSiteCitiesFormProps {
  siteId: string;
  stateId: string;
  existingCityIds: string[];
}

export function AddSiteCitiesForm({
  siteId,
  stateId,
  existingCityIds,
}: AddSiteCitiesFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [allCities, setAllCities] = useState<CityMinimal[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fetchCities = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getCitiesByState(stateId);
      if (res.ok) {
        setAllCities(res.data);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
    } finally {
      setIsLoading(false);
    }
  }, [stateId]);

  useEffect(() => {
    void fetchCities();
  }, [fetchCities]);

  // Filter out already existing cities
  const availableCities = useMemo(() => {
    const existingSet = new Set(existingCityIds);
    return allCities.filter((c) => !existingSet.has(c.id));
  }, [allCities, existingCityIds]);

  const selectedCities = useMemo(() => {
    const map = new Map(availableCities.map((c) => [c.id, c]));
    return selectedIds
      .map((id) => map.get(id))
      .filter(Boolean) as CityMinimal[];
  }, [availableCities, selectedIds]);

  const handleToggle = (city: CityMinimal) => {
    setSelectedIds((prev) => {
      const isSelected = prev.includes(city.id);
      if (isSelected) return prev.filter((id) => id !== city.id);
      return [...prev, city.id];
    });
  };

  const handleRemove = (cityId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== cityId));
  };

  const handleSelectAll = () => {
    if (availableCities.length === 0) return;
    setSelectedIds(availableCities.map((c) => c.id));
  };

  const handleClear = () => setSelectedIds([]);

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await addSiteCities({
        siteId,
        cityIds: selectedIds,
      });

      if (result.ok) {
        const searchMsg = result.data.searchJobsCreated
          ? `${result.data.searchJobsCreated} search jobs queued.`
          : '';
        setMessage({
          type: 'success',
          text: `Added ${result.data.addedCount} cities. ${searchMsg}`,
        });
        setSelectedIds([]);
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to add cities.',
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonLabel = useMemo(() => {
    if (isLoading) return 'Loading cities...';
    if (availableCities.length === 0) return 'All cities added';
    if (selectedIds.length > 0) {
      return `${selectedIds.length} cities selected`;
    }
    return 'Select cities to add...';
  }, [isLoading, availableCities.length, selectedIds.length]);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
                disabled={isLoading || availableCities.length === 0}
              >
                {buttonLabel}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search cities..." />
                <CommandList>
                  <CommandEmpty>No cities found.</CommandEmpty>
                  <CommandGroup>
                    {availableCities.map((city) => (
                      <CommandItem
                        key={city.id}
                        value={city.name}
                        onSelect={() => handleToggle(city)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedIds.includes(city.id)
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
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={isLoading || availableCities.length === 0}
          >
            Select all
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={selectedIds.length === 0}
          >
            Clear
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedIds.length === 0 || isSubmitting}
          >
            <Plus className="h-4 w-4" />
            {isSubmitting ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </div>

      {selectedCities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCities.slice(0, 20).map((city) => (
            <Badge key={city.id} variant="secondary" className="gap-1">
              {city.name}
              <button
                type="button"
                onClick={() => handleRemove(city.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedCities.length > 20 && (
            <Badge variant="outline">+{selectedCities.length - 20} more</Badge>
          )}
        </div>
      )}

      {message && (
        <p
          className={`text-sm ${
            message.type === 'success' ? 'text-green-600' : 'text-destructive'
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
