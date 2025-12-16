'use server';

import { createClient } from '@/lib/supabase/server';
import { normalizeCategoryName, slugify } from '@/lib/utils';
import type {
  ActionsResponse,
  CategoryMinimal,
  VerticalMinimal,
} from '@/lib/types';

export async function addCategoriesToVertical(
  verticalId: VerticalMinimal['id'],
  categories: Array<CategoryMinimal['name']>
): Promise<ActionsResponse<CategoryMinimal[]>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      error: 'You must be logged in to add categories.',
    };
  }

  if (!verticalId) {
    return {
      ok: false,
      error: 'Vertical ID is required.',
    };
  }

  const cleaned = categories
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
    return {
      ok: false,
      error: 'No valid categories to add.',
    };
  }

  const { data, error: insertError } = await supabase
    .from('categories')
    .insert(
      unique.map((c) => ({
        name: c.name,
        slug: c.slug,
        vertical_id: verticalId,
      }))
    )
    .select('id, name, slug, vertical_id');

  if (insertError) {
    console.error('Error inserting categories:', insertError);
    return {
      ok: false,
      error: insertError.message || 'Failed to add categories.',
    };
  }

  return { ok: true, data };
}
