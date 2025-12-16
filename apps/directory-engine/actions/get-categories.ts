'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  ActionsResponse,
  CategoryMinimal,
  VerticalMinimal,
} from '@/lib/types';

export async function getCategoriesByVertical(
  verticalId: VerticalMinimal['id']
): Promise<ActionsResponse<CategoryMinimal[]>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: 'You must be logged in to get categories.',
      ok: false,
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
      ok: false,
    };
  }

  return { data, ok: true };
}
