'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addVertical } from '@/actions/add-vertical';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export function AddVerticalForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await addVertical(name);
      if (!res.ok) {
        setError(res.error || 'Failed to add vertical.');
        return;
      }

      setName('');
      router.refresh();
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="vertical-name">Vertical name</Label>
        <Input
          id="vertical-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Law Firms"
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting || !name.trim()}>
        <Plus className="mr-2 h-4 w-4" />
        {isSubmitting ? 'Adding...' : 'Add Vertical'}
      </Button>
    </form>
  );
}
