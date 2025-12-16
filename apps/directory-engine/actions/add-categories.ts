'use server';

import { createClient } from '@/lib/supabase/server';
import { normalizeCategoryName, slugify } from '@/lib/utils';

export async function addCategoriesToVertical(input: {
  verticalId: string;
  categories: string[];
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('User not authenticated:', userError);
    throw new Error('You must be logged in to add categories.');
  }

  const verticalId = input.verticalId;
  if (!verticalId) throw new Error('Vertical is required.');

  const cleaned = input.categories
    .map((c) => normalizeCategoryName(c))
    .map((name) => ({ name, slug: slugify(name) }))
    .filter((c) => c.name.length > 0 && c.slug.length > 0);

  // de-dupe incoming payload by slug
  const seen = new Set<string>();
  const unique = cleaned.filter((c) => {
    if (seen.has(c.slug)) return false;
    seen.add(c.slug);
    return true;
  });

  if (unique.length === 0) {
    throw new Error('No valid categories to add.');
  }

  const { data, error } = await supabase
    .from('categories')
    .insert(
      unique.map((c) => ({
        name: c.name,
        slug: c.slug,
        vertical_id: verticalId,
      }))
    )
    .select('id, name, slug, vertical_id');

  if (error) {
    console.error('Error inserting categories:', error);
    throw new Error(error.message || 'Failed to add categories.');
  }

  return { inserted: data || [] };
}
