'use server';

import { createClient } from '@/lib/supabase/server';

export async function getCategoriesByVertical(verticalId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: 'You must be logged in to get categories.',
      data: null,
    };
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, vertical_id')
    .eq('vertical_id', verticalId)
    .order('name');

  if (error) {
    return {
      error: error.message || 'Error fetching categories.',
      data: null,
    };
  }

  return { data, error: null };
}
