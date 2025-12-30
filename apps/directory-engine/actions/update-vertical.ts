'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse } from '@/lib/types';

type UpdateVerticalData = {
  term_category?: string;
  term_categories?: string;
  term_business?: string;
  term_businesses?: string;
  term_cta?: string;
};

export async function updateVertical(
  id: string,
  data: UpdateVerticalData
): Promise<ActionsResponse<{ id: string }>> {
  if (!id) {
    return {
      ok: false,
      error: 'Vertical ID is required.',
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
      error: 'You must be logged in to update a vertical.',
    };
  }

  // Clean empty strings to null
  const cleanedData: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(data)) {
    cleanedData[key] = value?.trim() || null;
  }

  const { error } = await supabase
    .from('verticals')
    .update(cleanedData)
    .eq('id', id);

  if (error) {
    return {
      ok: false,
      error: error.message || 'Failed to update vertical.',
    };
  }

  return { data: { id }, ok: true };
}
