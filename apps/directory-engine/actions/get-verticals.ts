'use server';

import { createClient } from '@/lib/supabase/server';

export async function getVerticals() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error: 'You must be logged in to get verticals.',
    };
  }

  const { data, error } = await supabase
    .from('verticals')
    .select('id, name, slug')
    .order('name');

  if (error) {
    return {
      data: null,
      error: error.message || 'Error fetching verticals.',
    };
  }

  return { data, error: null };
}
