'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateVertical } from '@/actions/update-vertical';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { EditVertical } from '@/lib/types';

interface EditVerticalFormProps {
  vertical: EditVertical;
}

export function EditVerticalForm({ vertical }: EditVerticalFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    term_category: vertical.term_category || '',
    term_categories: vertical.term_categories || '',
    term_business: vertical.term_business || '',
    term_businesses: vertical.term_businesses || '',
    term_cta: vertical.term_cta || '',
  });

  function handleChange(field: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const res = await updateVertical(vertical.id, formData);
      if (!res.ok) {
        setError(res.error || 'Failed to update vertical.');
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="term_category">Category (singular)</Label>
          <Input
            id="term_category"
            value={formData.term_category}
            onChange={(e) => handleChange('term_category', e.target.value)}
            placeholder="e.g. Practice Area"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="term_categories">Category (plural)</Label>
          <Input
            id="term_categories"
            value={formData.term_categories}
            onChange={(e) => handleChange('term_categories', e.target.value)}
            placeholder="e.g. Practice Areas"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="term_business">Business (singular)</Label>
          <Input
            id="term_business"
            value={formData.term_business}
            onChange={(e) => handleChange('term_business', e.target.value)}
            placeholder="e.g. Law Firm"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="term_businesses">Business (plural)</Label>
          <Input
            id="term_businesses"
            value={formData.term_businesses}
            onChange={(e) => handleChange('term_businesses', e.target.value)}
            placeholder="e.g. Law Firms"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="term_cta">Call to Action</Label>
        <Input
          id="term_cta"
          value={formData.term_cta}
          onChange={(e) => handleChange('term_cta', e.target.value)}
          placeholder="e.g. Find a Lawyer"
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-700">
          Vertical updated successfully.
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        <Save className="mr-2 h-4 w-4" />
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
