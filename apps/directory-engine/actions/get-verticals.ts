'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse, VerticalMinimal } from '@/lib/types';

export async function getVerticals(): Promise<
  ActionsResponse<VerticalMinimal[]>
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      error: 'You must be logged in to get verticals.',
    };
  }

  const { data, error } = await supabase
    .from('verticals')
    .select('id, name, slug')
    .order('name');

  if (error) {
    return {
      ok: false,
      error: error.message || 'Error fetching verticals.',
    };
  }

  if (!data || data.length === 0) {
    return {
      ok: false,
      error: 'No verticals found.',
    };
  }

  return { ok: true, data };
}
