'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse } from '@/lib/types';
import type {
  AssociateSiteBusinessesJobPayload,
  JobType,
} from '@white-crow/shared';

type AddSiteCitiesPayload = {
  siteId: string;
  cityIds: string[];
};

type AddSiteCitiesResult = {
  addedCount: number;
  jobCreated: boolean;
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

  // Create job to associate businesses with the site (for new cities)
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
      addedCount: cityIds.length,
      jobCreated: !jobError,
    },
  };
}
