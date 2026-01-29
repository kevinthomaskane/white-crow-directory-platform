'use server';

import { type BusinessEditFormValues } from '@/components/sites/account-listings/business-edit-form';
import {
  createTypesenseClient,
  BUSINESSES_COLLECTION,
  type BusinessDocument,
} from '@white-crow/shared';
import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse, BusinessHours } from '@/lib/types';

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

interface UpdateBusinessPayload {
  siteBusinessId: string;
  updates: BusinessEditFormValues;
  original: {
    name: string;
    website: string | null;
    phone: string | null;
    formatted_address: string | null;
    hours: BusinessHours | null;
  };
}

interface UpdateBusinessResult {
  updated: true;
}

async function geocodeAddress(address: string): Promise<{
  latitude: number;
  longitude: number;
  city: string | null;
  state: string | null;
  street_address: string | null;
  postal_code: string | null;
} | null> {
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;

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
  payload: UpdateBusinessPayload,
): Promise<ActionsResponse<UpdateBusinessResult>> {
  const { siteBusinessId, updates, original } = payload;

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
      business:businesses!inner(
        id,
        formatted_address
      )
    `,
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

  // Build updates for the businesses table - only include changed fields
  const businessUpdates: Record<string, unknown> = {};

  if (updates.name !== original.name) {
    businessUpdates.name = updates.name;
  }
  if (updates.website !== original.website) {
    businessUpdates.website = updates.website;
  }
  if (updates.phone !== original.phone) {
    businessUpdates.phone = updates.phone;
  }
  // Compare hours arrays
  const hoursChanged =
    JSON.stringify(updates.hours) !== JSON.stringify(original.hours);
  if (hoursChanged) {
    businessUpdates.hours = updates.hours;
  }

  // Handle address update - requires geocoding
  const addressChanged =
    updates.formatted_address !== original.formatted_address;

  if (addressChanged && updates.formatted_address) {
    const geocodeResult = await geocodeAddress(updates.formatted_address);

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

    // Verify the city exists in site_cities and get the city_id
    let cityId: string | null = null;

    if (geocodeResult.city) {
      const { data: siteCity } = await supabase
        .from('site_cities')
        .select('city:cities!inner(id, name, state_id)')
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

      cityId = siteCity.city.id;
    } else {
      return {
        ok: false,
        error:
          'Could not determine the city from the address. Please enter a complete address.',
      };
    }

    // Add address fields to business updates
    businessUpdates.formatted_address = updates.formatted_address;
    businessUpdates.street_address = geocodeResult.street_address;
    businessUpdates.city = geocodeResult.city;
    businessUpdates.state = geocodeResult.state;
    businessUpdates.postal_code = geocodeResult.postal_code;
    businessUpdates.latitude = geocodeResult.latitude;
    businessUpdates.longitude = geocodeResult.longitude;
    businessUpdates.city_id = cityId;
  }

  // Update businesses table if there are changes
  if (Object.keys(businessUpdates).length > 0) {
    const { error: businessUpdateError } = await supabase
      .from('businesses')
      .update(businessUpdates)
      .eq('id', siteBusiness.business.id);

    if (businessUpdateError) {
      console.error('Error updating business:', businessUpdateError);
      return {
        ok: false,
        error: 'Failed to update business. Please try again.',
      };
    }
  }

  // Sync changes to Typesense search index if searchable fields changed
  const searchableFields = [
    'name',
    'formatted_address',
    'city',
    'state',
    'phone',
    'website',
  ] as const;

  const typesenseUpdate: Partial<BusinessDocument> = {};

  for (const field of searchableFields) {
    if (businessUpdates[field] !== undefined) {
      typesenseUpdate[field] = (businessUpdates[field] as string) || undefined;
    }
  }

  // Update location if coordinates changed
  if (
    businessUpdates.latitude !== undefined &&
    businessUpdates.longitude !== undefined
  ) {
    typesenseUpdate.location = [
      businessUpdates.latitude as number,
      businessUpdates.longitude as number,
    ];
  }

  if (Object.keys(typesenseUpdate).length > 0) {
    try {
      const typesense = createTypesenseClient({
        apiKey: process.env.TYPESENSE_API_KEY!,
        host: process.env.TYPESENSE_HOST!,
        port: 8108,
        protocol: process.env.NODE_ENV === 'production' ? 'https' : 'http',
      });

      // Typesense document IDs are UUIDs without dashes
      await typesense
        .collections<BusinessDocument>(BUSINESSES_COLLECTION)
        .documents(siteBusiness.business.id.replace(/-/g, ''))
        .update(typesenseUpdate);
    } catch (typesenseError) {
      // Log error but don't fail the request - Supabase is the source of truth
      console.error('Failed to sync business to Typesense:', typesenseError);
    }
  }

  return {
    ok: true,
    data: {
      updated: true,
    },
  };
}
