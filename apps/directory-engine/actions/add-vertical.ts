'use server';

import { createClient } from '@/lib/supabase/server';
import { normalizeWhitespace, slugify } from '@/lib/utils';

export async function addVertical(vertical: string) {
  const name = normalizeWhitespace(vertical || '');
  if (!name) {
    return {
      data: null,
      error: 'Vertical name is required.',
    };
  }

  const slug = slugify(name);
  if (!slug) {
    return {
      error: 'Invalid vertical name.',
      data: null,
    };
  }
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
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
        data: null,
        error: 'A vertical with this name or slug already exists.',
      };
    }
    return {
      data: null,
      error: error.message || 'Failed to add vertical.',
    };
  }

  return { data, error: null };
}
