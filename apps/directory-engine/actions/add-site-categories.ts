'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse } from '@/lib/types';
import type {
  GooglePlacesSearchJobPayload,
  JobType,
  JobStatus,
} from '@white-crow/shared';

type AddSiteCategoriesPayload = {
  siteId: string;
  categoryIds: string[];
};

type AddSiteCategoriesResult = {
  addedCount: number;
  searchJobsCreated?: number;
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

  // Fetch site with vertical and state info
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select(
      `
      id,
      vertical_id,
      state_id,
      vertical:verticals(name),
      state:states(code)
    `
    )
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

  // Queue Google Places search jobs for new category × existing city combinations
  let searchJobsCreated = 0;
  const vertical = site.vertical as { name: string } | null;
  const state = site.state as { code: string } | null;

  if (vertical && state) {
    // Fetch existing cities for the site
    const { data: siteCities } = await supabase
      .from('site_cities')
      .select('city:cities(id, name)')
      .eq('site_id', siteId);

    // Fetch the new category names
    const { data: newCategories } = await supabase
      .from('categories')
      .select('id, name')
      .in('id', categoryIds);

    if (siteCities && siteCities.length > 0 && newCategories && newCategories.length > 0) {
      const cities = siteCities
        .map((sc) => sc.city as { id: string; name: string } | null)
        .filter((c): c is { id: string; name: string } => c !== null);

      // Build search job payloads
      const searchPayloads: GooglePlacesSearchJobPayload[] = [];
      for (const category of newCategories) {
        for (const city of cities) {
          searchPayloads.push({
            verticalId: site.vertical_id,
            categoryId: category.id,
            queryText: `${category.name} ${vertical.name} ${city.name} ${state.code}`,
            siteId,
          });
        }
      }

      if (searchPayloads.length > 0) {
        const runId = crypto.randomUUID();
        const searchJobs = searchPayloads.map((payload) => ({
          job_type: 'google_places_search' as JobType,
          payload,
          run_id: runId,
          status: 'pending' as JobStatus,
        }));

        const { error: searchJobsError } = await supabase
          .from('jobs')
          .insert(searchJobs);

        if (searchJobsError) {
          console.error('Error creating google_places_search jobs:', searchJobsError);
        } else {
          searchJobsCreated = searchPayloads.length;
        }
      }
    }
  }

  return {
    ok: true,
    data: {
      addedCount: categoryIds.length,
      searchJobsCreated,
    },
  };
}
