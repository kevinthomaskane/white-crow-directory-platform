/*
  Categories manager UI:
  - select vertical
  - load existing categories via server action
  - add pending categories manually or generate suggestions
  - save pending categories via server action
*/
'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
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
import { generateCategoriesForVertical } from '@/actions/generate-categories';
import { addCategoriesToVertical } from '@/actions/add-categories';
import { normalizeCategoryName, slugify } from '@/lib/utils';
import { CategoryMinimal, VerticalMinimal } from '@/lib/types';

export function AddCategories({ verticals }: { verticals: VerticalMinimal[] }) {
  const [verticalOpen, setVerticalOpen] = useState(false);
  const [selectedVertical, setSelectedVertical] =
    useState<VerticalMinimal | null>(null);

  const [existingCategories, setExistingCategories] = useState<
    CategoryMinimal[]
  >([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [pendingCategories, setPendingCategories] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const existingSlugs = useMemo(() => {
    return new Set(existingCategories.map((c) => c.slug));
  }, [existingCategories]);

  const pendingSlugs = useMemo(() => {
    return new Set(pendingCategories.map((c) => slugify(c)));
  }, [pendingCategories]);

  async function loadExisting(verticalId: string) {
    setIsLoadingExisting(true);

    try {
      const res = await getCategoriesByVertical(verticalId);
      if (!res.ok) {
        setError(res.error || 'Failed to load categories.');
        return;
      }
      setExistingCategories(res.data);
    } catch (err) {
      setExistingCategories([]);
      setError(
        err instanceof Error ? err.message : 'Failed to load categories.'
      );
    } finally {
      setIsLoadingExisting(false);
    }
  }

  const handleVerticalSelect = (v: VerticalMinimal) => {
    setSelectedVertical(v);
    setVerticalOpen(false);
    setExistingCategories([]);
    setPendingCategories([]);
    setNewCategoryInput('');
    setError(null);
    setSuccess(null);
    if (v) void loadExisting(v.id);
  };

  const addPendingCategory = (raw: string) => {
    const name = normalizeCategoryName(raw);
    const slug = slugify(name);
    if (!name || !slug) return;
    if (existingSlugs.has(slug)) return;
    if (pendingSlugs.has(slug)) return;
    setPendingCategories((prev) => [...prev, name]);
  };

  const handleAddPending = () => {
    addPendingCategory(newCategoryInput);
    setNewCategoryInput('');
  };

  const handleRemovePending = (name: string) => {
    const key = slugify(name);
    setPendingCategories((prev) => prev.filter((p) => slugify(p) !== key));
  };

  const handleGenerate = async () => {
    if (!selectedVertical) return;
    setIsGenerating(true);
    setError(null);

    try {
      const res = await generateCategoriesForVertical(selectedVertical.name);
      if (!res.ok) {
        setError(res.error || 'Failed to generate categories.');
        return;
      }
      const generatedCategories = res.data;
      generatedCategories.forEach((c) => addPendingCategory(c));
    } catch (err) {
      console.error('Error generating categories:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate categories.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedVertical) return;
    if (pendingCategories.length === 0) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await addCategoriesToVertical(
        selectedVertical.id,
        pendingCategories
      );

      if (!res.ok) {
        setError(res.error || 'Failed to save categories.');
        return;
      }

      setPendingCategories([]);
      setExistingCategories([]);
      setSuccess(
        `Added ${res.data.length} categories to ${selectedVertical.name}.`
      );
      setSelectedVertical(null);
    } catch (err) {
      console.error('Error saving categories:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to save categories.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left: controls */}
      <div className="space-y-6">
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
            Select a vertical to add categories.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Add categories</Label>
          <div className="flex gap-2">
            <Input
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              placeholder="e.g. Family Law"
              disabled={!selectedVertical || isGenerating || isSaving}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPending();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddPending}
              disabled={
                !selectedVertical ||
                !newCategoryInput.trim() ||
                isGenerating ||
                isSaving
              }
            >
              Add
            </Button>
          </div>
          {pendingCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pendingCategories.map((name) => (
                <Badge
                  key={slugify(name)}
                  variant="secondary"
                  className="gap-1"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => handleRemovePending(name)}
                    className="ml-1 hover:text-destructive"
                    aria-label="Remove category"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerate}
              disabled={!selectedVertical || isGenerating || isSaving}
            >
              {isGenerating ? 'Generating...' : 'Generate With AI'}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={
                !selectedVertical || pendingCategories.length === 0 || isSaving
              }
            >
              {isSaving
                ? 'Saving...'
                : `Save ${pendingCategories.length} categor${
                    pendingCategories.length === 1 ? 'y' : 'ies'
                  }`}
            </Button>
          </div>

          {success && (
            <div className="rounded-lg border border-green-700/20 bg-green-700/10 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Right: existing list */}
      <div className="rounded-lg border p-4 max-h-[500px] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Existing categories</h3>
          {selectedVertical && (
            <span className="text-sm text-muted-foreground">
              {isLoadingExisting
                ? 'Loading...'
                : `${existingCategories.length}`}
            </span>
          )}
        </div>

        {!selectedVertical ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Select a vertical to load categories.
          </p>
        ) : isLoadingExisting ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
        ) : existingCategories.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No categories yet for this vertical.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {existingCategories.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{c.name}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    {c.slug}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
