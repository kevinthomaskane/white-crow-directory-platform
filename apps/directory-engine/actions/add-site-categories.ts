'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse } from '@/lib/types';
import type {
  AssociateSiteBusinessesJobPayload,
  JobType,
} from '@white-crow/shared';

type AddSiteCategoriesPayload = {
  siteId: string;
  categoryIds: string[];
};

type AddSiteCategoriesResult = {
  addedCount: number;
  jobCreated: boolean;
};

export async function addSiteCategories(
  payload: AddSiteCategoriesPayload
): Promise<ActionsResponse<AddSiteCategoriesResult>> {
  const { siteId, categoryIds } = payload;

  if (!siteId) {
    return {
      ok: false,
      error: 'Site ID is required.',
    };
  }

  if (!categoryIds || categoryIds.length === 0) {
    return {
      ok: false,
      error: 'At least one category is required.',
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
      error: 'You must be logged in to add categories.',
    };
  }

  // Verify site exists
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('id')
    .eq('id', siteId)
    .single();

  if (siteError || !site) {
    return {
      ok: false,
      error: 'Site not found.',
    };
  }

  // Insert site_categories (ignore duplicates)
  const siteCategoriesInsert = categoryIds.map((categoryId) => ({
    site_id: siteId,
    category_id: categoryId,
  }));

  const { error: categoriesError } = await supabase
    .from('site_categories')
    .upsert(siteCategoriesInsert, { onConflict: 'site_id,category_id' });

  if (categoriesError) {
    console.error('Error adding site categories:', categoriesError);
    return {
      ok: false,
      error: categoriesError.message || 'Failed to add categories to site.',
    };
  }

  // Create job to associate businesses with the site (for new categories)
  const jobPayload: AssociateSiteBusinessesJobPayload = {
    siteId,
  };

  const jobType: JobType = 'associate_site_businesses';
  const { error: jobError } = await supabase.from('jobs').insert({
    job_type: jobType,
    payload: jobPayload,
    status: 'pending',
  });

  if (jobError) {
    console.error('Error creating associate_site_businesses job:', jobError);
  }

  return {
    ok: true,
    data: {
      addedCount: categoryIds.length,
      jobCreated: !jobError,
    },
  };
}
