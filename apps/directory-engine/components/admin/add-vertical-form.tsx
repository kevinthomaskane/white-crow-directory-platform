'use client';

import { useState } from 'react';
import { addVertical } from '@/actions/add-vertical';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getVerticals } from '@/actions/get-verticals';

type Vertical = { id: string; name: string; slug: string };

export function AddVerticalForm({ verticals }: { verticals: Vertical[] }) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingExisting, setIsFetchingExisting] = useState(false);
  const [existingVerticals, setExistingVerticals] =
    useState<Vertical[]>(verticals);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const { data: verticalData, error: addVerticalError } =
      await addVertical(name);
    if (!verticalData || addVerticalError) {
      setError(addVerticalError || 'Failed to add vertical.');
      setIsSubmitting(false);
      return;
    }

    setIsFetchingExisting(true);

    const { data: newVerticals, error: getVerticalsError } =
      await getVerticals();

    setIsFetchingExisting(false);
    setIsSubmitting(false);

    if (!newVerticals || getVerticalsError) {
      setError(
        getVerticalsError || 'Vertical added, but failed to fetch updated list.'
      );
      return;
    }

    setName('');
    setSuccess('Vertical added.');
    setExistingVerticals(newVerticals);
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="vertical-name">New vertical</Label>
          <Input
            id="vertical-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Law Firms"
            disabled={isSubmitting}
          />
        </div>

        <Button type="submit" disabled={isSubmitting || !name.trim()}>
          {isSubmitting ? 'Adding...' : 'Add vertical'}
        </Button>

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
      </form>

      <div className="rounded-lg border p-4">
        {isFetchingExisting ? (
          <div className="text-sm text-muted-foreground">
            Fetching verticals...
          </div>
        ) : (
          <h3 className="text-sm font-medium">Existing verticals</h3>
        )}
        <ul className="mt-3 space-y-2">
          {(existingVerticals || []).map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="truncate font-medium">{v.name}</div>
                <div className="truncate text-sm text-muted-foreground">
                  {v.slug}
                </div>
              </div>
            </li>
          ))}
          {(existingVerticals || []).length === 0 && (
            <li className="text-sm text-muted-foreground">No verticals yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
