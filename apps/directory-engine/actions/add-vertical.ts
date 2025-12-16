'use server';

import { createClient } from '@/lib/supabase/server';
import { normalizeWhitespace, slugify } from '@/lib/utils';
import type { ActionsResponse, VerticalMinimal } from '@/lib/types';

export async function addVertical(
  vertical: VerticalMinimal['name']
): Promise<ActionsResponse<VerticalMinimal>> {
  const name = normalizeWhitespace(vertical || '');
  if (!name) {
    return {
      ok: false,
      error: 'Vertical name is required.',
    };
  }

  const slug = slugify(name);
  if (!slug) {
    return {
      error: 'Invalid vertical name.',
      ok: false,
    };
  }
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      error: 'You must be logged in to add a vertical.',
    };
  }

  const { data, error } = await supabase
    .from('verticals')
    .insert({ name, slug })
    .select('id, name, slug')
    .single();

  if (error) {
    if (error.code === '23505') {
      return {
        ok: false,
        error: 'A vertical with this name or slug already exists.',
      };
    }
    return {
      ok: false,
      error: error.message || 'Failed to add vertical.',
    };
  }

  return { data, ok: true };
}
