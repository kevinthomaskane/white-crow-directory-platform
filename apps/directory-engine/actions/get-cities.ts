'use server';

import { createClient } from '@/lib/supabase/server';

export async function getCitiesByState(stateId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('User not authenticated:', userError);
    throw new Error('You must be logged in to get cities.');
  }

  const { data, error } = await supabase
    .from('cities')
    .select('id, name, population, state_id')
    .eq('state_id', stateId)
    .order('population', { ascending: false, nullsFirst: false })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching cities:', error);
    throw new Error('Error fetching cities.');
  }

  return { cities: data || [] };
}
