'use server';

import { type BusinessEditFormValues } from '@/components/sites/account-listings/business-edit-form';
import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse, SiteBusinessOverrides } from '@/lib/types';

interface MapboxFeature {
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
  properties?: {
    address?: string;
  };
  address?: string;
  text?: string;
}

interface MapboxGeocodeResponse {
  features: MapboxFeature[];
}

interface UpdateBusinessOverridesPayload {
  siteBusinessId: string;
  overrides: BusinessEditFormValues;
  originalAddress: string | null;
}

async function geocodeAddress(address: string): Promise<{
  latitude: number;
  longitude: number;
  city: string | null;
  state: string | null;
  street_address: string | null;
  postal_code: string | null;
} | null> {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    console.error('Mapbox access token not configured');
    return null;
  }

  const encodedAddress = encodeURIComponent(address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&country=US&types=address&limit=1`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Mapbox geocode failed:', response.status);
      return null;
    }

    const data: MapboxGeocodeResponse = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const [longitude, latitude] = feature.center;

    // Parse context for city, state, postal code
    let city: string | null = null;
    let state: string | null = null;
    let postal_code: string | null = null;

    if (feature.context) {
      for (const ctx of feature.context) {
        if (ctx.id.startsWith('place.')) {
          city = ctx.text;
        } else if (ctx.id.startsWith('region.')) {
          state = ctx.short_code?.replace('US-', '') || ctx.text;
        } else if (ctx.id.startsWith('postcode.')) {
          postal_code = ctx.text;
        }
      }
    }

    // Build street address from feature properties
    const streetNumber = feature.address || '';
    const streetName = feature.text || '';
    const street_address =
      streetNumber && streetName
        ? `${streetNumber} ${streetName}`
        : streetNumber || streetName || null;

    return {
      latitude,
      longitude,
      city,
      state,
      street_address,
      postal_code,
    };
  } catch (error) {
    console.error('Geocode error:', error);
    return null;
  }
}

export async function updateBusinessOverrides(
  payload: UpdateBusinessOverridesPayload
): Promise<ActionsResponse<{ updated: true }>> {
  const { siteBusinessId, overrides, originalAddress } = payload;

  if (!siteBusinessId) {
    return { ok: false, error: 'Missing site business ID.' };
  }

  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      error: 'You must be logged in to update your business.',
    };
  }

  // Fetch site_business and verify ownership
  const { data: siteBusiness, error: fetchError } = await supabase
    .from('site_businesses')
    .select(
      `
      id,
      site_id,
      claimed_by,
      overrides,
      business:businesses!inner(
        id,
        formatted_address
      )
    `
    )
    .eq('id', siteBusinessId)
    .single();

  if (fetchError || !siteBusiness) {
    return { ok: false, error: 'Business not found.' };
  }

  if (siteBusiness.claimed_by !== user.id) {
    return {
      ok: false,
      error: 'You do not have permission to edit this business.',
    };
  }

  // Build the new overrides object
  const existingOverrides =
    (siteBusiness.overrides as SiteBusinessOverrides) || {};
  const newOverrides: SiteBusinessOverrides = { ...existingOverrides };

  // Update simple fields
  if (overrides.name !== undefined) {
    newOverrides.name = overrides.name;
  }
  if (overrides.website !== undefined) {
    newOverrides.website = overrides.website;
  }
  if (overrides.phone !== undefined) {
    newOverrides.phone = overrides.phone;
  }
  if (overrides.hours !== undefined) {
    newOverrides.hours = overrides.hours;
  }

  // Handle address update - requires geocoding
  const addressChanged =
    overrides.formatted_address !== undefined &&
    overrides.formatted_address !== originalAddress;

  if (addressChanged && overrides.formatted_address) {
    const geocodeResult = await geocodeAddress(overrides.formatted_address);

    if (!geocodeResult) {
      return {
        ok: false,
        error:
          'Could not verify the address. Please check the address and try again.',
      };
    }

    // Verify the state matches the site's state
    const { data: site } = await supabase
      .from('sites')
      .select('state:states!inner(code, name)')
      .eq('id', siteBusiness.site_id)
      .single();

    const siteState = site?.state as { code: string; name: string } | null;

    if (siteState && geocodeResult.state !== siteState.code) {
      return {
        ok: false,
        error: `This directory only covers ${siteState.name}. Please enter an address in ${siteState.name}.`,
      };
    }

    // Verify the city exists in site_cities (required for the business to have a valid listing page)
    if (geocodeResult.city) {
      const { data: siteCity } = await supabase
        .from('site_cities')
        .select('city:cities!inner(name, state_id)')
        .eq('site_id', siteBusiness.site_id)
        .ilike('city.name', geocodeResult.city)
        .limit(1)
        .single();

      if (!siteCity) {
        return {
          ok: false,
          error: `The city "${geocodeResult.city}" is not available for this directory. Please use an address within a supported city.`,
        };
      }
    } else {
      return {
        ok: false,
        error: 'Could not determine the city from the address. Please enter a complete address.',
      };
    }

    // Update address-related overrides
    newOverrides.formatted_address = overrides.formatted_address;
    newOverrides.street_address = geocodeResult.street_address;
    newOverrides.city = geocodeResult.city;
    newOverrides.state = geocodeResult.state;
    newOverrides.postal_code = geocodeResult.postal_code;
  } else if (overrides.formatted_address !== undefined) {
    // Address cleared or unchanged
    newOverrides.formatted_address = overrides.formatted_address;
  }

  // Update site_businesses with new overrides
  const { error: updateError } = await supabase
    .from('site_businesses')
    .update({
      overrides: Object.keys(newOverrides).length > 0 ? newOverrides : null,
    })
    .eq('id', siteBusinessId);

  if (updateError) {
    console.error('Error updating business overrides:', updateError);
    return { ok: false, error: 'Failed to update business. Please try again.' };
  }

  return { ok: true, data: { updated: true } };
}
