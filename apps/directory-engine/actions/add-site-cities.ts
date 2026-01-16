'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse } from '@/lib/types';
import type {
  GooglePlacesSearchJobPayload,
  JobType,
  JobStatus,
} from '@white-crow/shared';

type AddSiteCitiesPayload = {
  siteId: string;
  cityIds: string[];
};

type AddSiteCitiesResult = {
  addedCount: number;
  searchJobsCreated?: number;
};

export async function addSiteCities(
  payload: AddSiteCitiesPayload
): Promise<ActionsResponse<AddSiteCitiesResult>> {
  const { siteId, cityIds } = payload;

  if (!siteId) {
    return {
      ok: false,
      error: 'Site ID is required.',
    };
  }

  if (!cityIds || cityIds.length === 0) {
    return {
      ok: false,
      error: 'At least one city is required.',
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
      error: 'You must be logged in to add cities.',
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

  // Insert site_cities (ignore duplicates)
  const siteCitiesInsert = cityIds.map((cityId) => ({
    site_id: siteId,
    city_id: cityId,
  }));

  const { error: citiesError } = await supabase
    .from('site_cities')
    .upsert(siteCitiesInsert, { onConflict: 'site_id,city_id' });

  if (citiesError) {
    console.error('Error adding site cities:', citiesError);
    return {
      ok: false,
      error: citiesError.message || 'Failed to add cities to site.',
    };
  }

  // Queue Google Places search jobs for existing category × new city combinations
  let searchJobsCreated = 0;
  const vertical = site.vertical as { name: string } | null;
  const state = site.state as { code: string } | null;

  if (vertical && state) {
    // Fetch existing categories for the site
    const { data: siteCategories } = await supabase
      .from('site_categories')
      .select('category:categories(id, name)')
      .eq('site_id', siteId);

    // Fetch the new city names
    const { data: newCities } = await supabase
      .from('cities')
      .select('id, name')
      .in('id', cityIds);

    if (siteCategories && siteCategories.length > 0 && newCities && newCities.length > 0) {
      const categories = siteCategories
        .map((sc) => sc.category as { id: string; name: string } | null)
        .filter((c): c is { id: string; name: string } => c !== null);

      // Build search job payloads
      const searchPayloads: GooglePlacesSearchJobPayload[] = [];
      for (const category of categories) {
        for (const city of newCities) {
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
      addedCount: cityIds.length,
      searchJobsCreated,
    },
  };
}
