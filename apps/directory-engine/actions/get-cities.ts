'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse, CityMinimal, StateMinimal } from '@/lib/types';

export async function getCitiesByState(
  stateId: StateMinimal['id']
): Promise<ActionsResponse<CityMinimal[]>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      error: 'You must be logged in to get cities.',
    };
  }

  const { data, error } = await supabase
    .from('cities')
    .select('id, name, population, state_id')
    .eq('state_id', stateId)
    .order('population', { ascending: false, nullsFirst: false })
    .order('name', { ascending: true });

  if (error) {
    return {
      ok: false,
      error: error.message || 'Error fetching cities.',
    };
  }
  if (!data || data.length === 0) {
    return {
      ok: false,
      error: 'No cities found.',
    };
  }

  return { ok: true, data };
}
