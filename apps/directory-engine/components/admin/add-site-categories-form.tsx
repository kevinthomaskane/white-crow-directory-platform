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
import { getCategoriesByVertical } from '@/actions/get-categories';
import { addSiteCategories } from '@/actions/add-site-categories';
import type { CategoryMinimal } from '@/lib/types';

interface AddSiteCategoriesFormProps {
  siteId: string;
  verticalId: string;
  existingCategoryIds: string[];
}

export function AddSiteCategoriesForm({
  siteId,
  verticalId,
  existingCategoryIds,
}: AddSiteCategoriesFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [allCategories, setAllCategories] = useState<CategoryMinimal[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getCategoriesByVertical(verticalId);
      if (res.ok) {
        setAllCategories(res.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, [verticalId]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  // Filter out already existing categories
  const availableCategories = useMemo(() => {
    const existingSet = new Set(existingCategoryIds);
    return allCategories.filter((c) => !existingSet.has(c.id));
  }, [allCategories, existingCategoryIds]);

  const selectedCategories = useMemo(() => {
    const map = new Map(availableCategories.map((c) => [c.id, c]));
    return selectedIds
      .map((id) => map.get(id))
      .filter(Boolean) as CategoryMinimal[];
  }, [availableCategories, selectedIds]);

  const handleToggle = (category: CategoryMinimal) => {
    setSelectedIds((prev) => {
      const isSelected = prev.includes(category.id);
      if (isSelected) return prev.filter((id) => id !== category.id);
      return [...prev, category.id];
    });
  };

  const handleRemove = (categoryId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== categoryId));
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await addSiteCategories({
        siteId,
        categoryIds: selectedIds,
      });

      if (result.ok) {
        setMessage({
          type: 'success',
          text: `Added ${result.data.addedCount} categories. ${result.data.jobCreated ? 'Business association job queued.' : ''}`,
        });
        setSelectedIds([]);
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to add categories.',
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
    if (isLoading) return 'Loading categories...';
    if (availableCategories.length === 0) return 'All categories added';
    if (selectedIds.length > 0) {
      return `${selectedIds.length} categories selected`;
    }
    return 'Select categories to add...';
  }, [isLoading, availableCategories.length, selectedIds.length]);

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
                disabled={isLoading || availableCategories.length === 0}
              >
                {buttonLabel}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search categories..." />
                <CommandList>
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup>
                    {availableCategories.map((category) => (
                      <CommandItem
                        key={category.id}
                        value={category.name}
                        onSelect={() => handleToggle(category)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedIds.includes(category.id)
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
        </div>
        <Button
          onClick={handleSubmit}
          disabled={selectedIds.length === 0 || isSubmitting}
        >
          <Plus className="h-4 w-4" />
          {isSubmitting ? 'Adding...' : 'Add'}
        </Button>
      </div>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <Badge key={category.id} variant="secondary" className="gap-1">
              {category.name}
              <button
                type="button"
                onClick={() => handleRemove(category.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
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
