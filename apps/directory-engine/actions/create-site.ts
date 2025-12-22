'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse } from '@/lib/types';

type CreateSitePayload = {
  name: string;
  verticalId: string;
  stateId: string;
  categoryIds: string[];
  cityIds: string[];
};

type SiteCreated = {
  id: string;
  name: string;
};

export async function createSite(
  payload: CreateSitePayload
): Promise<ActionsResponse<SiteCreated>> {
  const { name, verticalId, stateId, categoryIds, cityIds } = payload;

  if (!name || name.trim() === '') {
    return {
      ok: false,
      error: 'Site name is required.',
    };
  }

  if (!verticalId) {
    return {
      ok: false,
      error: 'Vertical is required.',
    };
  }

  if (!stateId) {
    return {
      ok: false,
      error: 'State is required.',
    };
  }

  if (!categoryIds || categoryIds.length === 0) {
    return {
      ok: false,
      error: 'At least one category is required.',
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
      error: 'You must be logged in to create a site.',
    };
  }

  // Insert the site
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .insert({
      name: name.trim(),
      vertical_id: verticalId,
      state_id: stateId,
    })
    .select('id, name')
    .single();

  if (siteError) {
    if (siteError.code === '23505') {
      return {
        ok: false,
        error: 'A site with this name already exists.',
      };
    }
    console.error('Error creating site:', siteError);
    return {
      ok: false,
      error: siteError.message || 'Failed to create site.',
    };
  }

  // Insert site_categories
  const siteCategoriesInsert = categoryIds.map((categoryId) => ({
    site_id: site.id,
    category_id: categoryId,
  }));

  const { error: categoriesError } = await supabase
    .from('site_categories')
    .insert(siteCategoriesInsert);

  if (categoriesError) {
    // Attempt to clean up the site if categories insert fails
    await supabase.from('sites').delete().eq('id', site.id);
    console.error('Error creating site categories:', categoriesError);
    return {
      ok: false,
      error: categoriesError.message || 'Failed to add categories to site.',
    };
  }

  // Insert site_cities
  const siteCitiesInsert = cityIds.map((cityId) => ({
    site_id: site.id,
    city_id: cityId,
  }));

  const { error: citiesError } = await supabase
    .from('site_cities')
    .insert(siteCitiesInsert);

  if (citiesError) {
    // Attempt to clean up the site if cities insert fails
    await supabase.from('sites').delete().eq('id', site.id);
    console.error('Error creating site cities:', citiesError);
    return {
      ok: false,
      error: citiesError.message || 'Failed to add cities to site.',
    };
  }

  return {
    ok: true,
    data: site,
  };
}
