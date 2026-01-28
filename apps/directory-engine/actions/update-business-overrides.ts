'use server';

import { type BusinessEditFormValues } from '@/components/sites/account-listings/business-edit-form';
import {
  createServiceRoleClient,
  createTypesenseClient,
  BUSINESSES_COLLECTION,
  type BusinessDocument,
} from '@white-crow/shared';
import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse } from '@/lib/types';

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
  originalAddress: string | null;
  /** If true, generates a signed upload URL for an image */
  hasNewImage?: boolean;
  /** Required when hasNewImage is true */
  siteDomain?: string;
}

interface UpdateBusinessResult {
  updated: true;
  /** Signed URL to upload the image to (only present when hasNewImage was true) */
  imageUploadUrl?: string;
  /** Storage path for the image (only present when hasNewImage was true) */
  imagePath?: string;
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
  payload: UpdateBusinessPayload
): Promise<ActionsResponse<UpdateBusinessResult>> {
  const { siteBusinessId, updates, originalAddress, hasNewImage, siteDomain } =
    payload;

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
      plan,
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

  const isPro = Boolean(siteBusiness.plan);

  // Build updates for the businesses table
  const businessUpdates: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    businessUpdates.name = updates.name;
  }
  if (updates.website !== undefined) {
    businessUpdates.website = updates.website;
  }
  if (updates.phone !== undefined) {
    businessUpdates.phone = updates.phone;
  }
  if (updates.hours !== undefined) {
    businessUpdates.hours = updates.hours;
  }

  // Handle address update - requires geocoding
  const addressChanged =
    updates.formatted_address !== undefined &&
    updates.formatted_address !== originalAddress;

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
  } else if (updates.formatted_address !== undefined) {
    // Address cleared or unchanged
    businessUpdates.formatted_address = updates.formatted_address;
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

  // Build updates for site_businesses table (pro enrichments)
  const siteBusinessUpdates: Record<string, unknown> = {};

  // Handle description (pro feature)
  if (updates.description !== undefined) {
    if (!isPro && updates.description) {
      return {
        ok: false,
        error:
          'A Pro subscription is required to customize your business description.',
      };
    }
    siteBusinessUpdates.description = isPro ? updates.description : null;
  }

  // Handle image upload if requested
  let imageUploadUrl: string | undefined;
  let imagePath: string | undefined;

  if (hasNewImage) {
    if (!isPro) {
      return {
        ok: false,
        error: 'A Pro subscription is required to upload custom images.',
      };
    }

    if (!siteDomain) {
      return {
        ok: false,
        error: 'Site domain is required for image upload.',
      };
    }

    // Use service role client for storage operations
    const serviceClient = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const bucketName = siteDomain;

    // Check if bucket exists, create if not
    const { data: buckets } = await serviceClient.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === bucketName);

    if (!bucketExists) {
      const { error: createError } = await serviceClient.storage.createBucket(
        bucketName,
        { public: true }
      );

      if (createError) {
        return {
          ok: false,
          error: `Failed to create storage bucket: ${createError.message}`,
        };
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `business-media/${siteBusinessId}/main-${timestamp}`;

    // Generate signed upload URL (valid for 5 minutes)
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from(bucketName)
      .createSignedUploadUrl(filename);

    if (uploadError || !uploadData) {
      return {
        ok: false,
        error: `Failed to generate upload URL: ${uploadError?.message}`,
      };
    }

    imagePath = `${bucketName}/${filename}`;
    imageUploadUrl = uploadData.signedUrl;

    // Set the image path in site_business
    siteBusinessUpdates.main_photo = imagePath;
  }

  // Update site_businesses table if there are changes
  if (Object.keys(siteBusinessUpdates).length > 0) {
    const { error: siteBusinessUpdateError } = await supabase
      .from('site_businesses')
      .update(siteBusinessUpdates)
      .eq('id', siteBusinessId);

    if (siteBusinessUpdateError) {
      console.error('Error updating site_business:', siteBusinessUpdateError);
      return {
        ok: false,
        error: 'Failed to update business. Please try again.',
      };
    }
  }

  // Sync changes to Typesense search index if searchable fields changed
  const searchableFieldsChanged =
    businessUpdates.name !== undefined ||
    businessUpdates.formatted_address !== undefined ||
    businessUpdates.city !== undefined ||
    businessUpdates.state !== undefined ||
    businessUpdates.phone !== undefined ||
    businessUpdates.website !== undefined;

  if (searchableFieldsChanged) {
    try {
      const typesense = createTypesenseClient({
        apiKey: process.env.TYPESENSE_API_KEY!,
        host: process.env.TYPESENSE_HOST!,
        port: 8108,
        protocol: process.env.NODE_ENV === 'production' ? 'https' : 'http',
      });

      // Build partial update with only the changed fields
      const typesenseUpdate: Partial<BusinessDocument> & { id: string } = {
        id: siteBusiness.business.id,
      };

      if (businessUpdates.name !== undefined) {
        typesenseUpdate.name = businessUpdates.name as string;
      }
      if (businessUpdates.formatted_address !== undefined) {
        typesenseUpdate.formatted_address =
          (businessUpdates.formatted_address as string) || undefined;
      }
      if (businessUpdates.city !== undefined) {
        typesenseUpdate.city = (businessUpdates.city as string) || undefined;
      }
      if (businessUpdates.state !== undefined) {
        typesenseUpdate.state = (businessUpdates.state as string) || undefined;
      }
      if (businessUpdates.phone !== undefined) {
        typesenseUpdate.phone = (businessUpdates.phone as string) || undefined;
      }
      if (businessUpdates.website !== undefined) {
        typesenseUpdate.website =
          (businessUpdates.website as string) || undefined;
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

      await typesense
        .collections<BusinessDocument>(BUSINESSES_COLLECTION)
        .documents(siteBusiness.business.id)
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
      ...(imageUploadUrl && { imageUploadUrl }),
      ...(imagePath && { imagePath }),
    },
  };
}
