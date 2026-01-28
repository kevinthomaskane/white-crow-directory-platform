import {
  ReviewSource,
  type RefreshSiteBusinessesJobMeta,
  placeDetailsFieldMask,
  parseAddressComponents,
  type Review,
} from '@white-crow/shared';
import { supabase } from '../lib/supabase/client';
import type {
  BusinessReviewInsert,
  RefreshSiteBusinessesJob,
} from '../lib/types';
import { markJobCompleted } from '../lib/update-job-status';
import { fetchWithRetry } from '../lib/google-places';

const PAGE_SIZE = 500; // Fetch businesses in pages
const BATCH_SIZE = 10; // Process this many API calls at a time
const BATCH_DELAY_MS = 500; // Delay between batches

/**
 * Creates a cached city lookup function that queries the database on demand
 * and caches results for the duration of the job.
 */
function createCityLookupCache() {
  const cache = new Map<string, string | null>();

  return async function lookupCityId(
    city: string,
    state: string
  ): Promise<string | null> {
    const cityName = city?.trim().toLowerCase();
    const stateName = state?.trim().toLowerCase();

    if (!cityName || !stateName) return null;

    const key = `${cityName}|${stateName}`;

    if (cache.has(key)) {
      return cache.get(key) || null;
    }

    // Query database for this city/state combination
    const { data, error } = await supabase
      .from('cities')
      .select('id, states!inner(name)')
      .ilike('name', cityName)
      .ilike('states.name', stateName)
      .limit(1)
      .single();

    if (error || !data) {
      cache.set(key, null);
      return null;
    }

    cache.set(key, data.id);
    return data.id;
  };
}

export async function handleRefreshSiteBusinessesJob(
  job: RefreshSiteBusinessesJob
) {
  const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  if (!PLACES_API_KEY) {
    throw new Error('GOOGLE_PLACES_API_KEY env var is required');
  }

  const { siteId } = job.payload;
  const lookupCityId = createCityLookupCache();

  console.log(`[Job ${job.id}] Starting refresh site businesses job`);
  console.log(`[Job ${job.id}] Site ID: ${siteId}`);

  // First, get the total count of businesses for this site
  const { count: totalCount, error: countError } = await supabase
    .from('site_businesses')
    .select('*', { count: 'exact', head: true })
    .eq('site_id', siteId);

  if (countError) {
    throw new Error(`Failed to count site businesses: ${countError.message}`);
  }

  if (!totalCount || totalCount === 0) {
    console.log(`[Job ${job.id}] No businesses found for site`);
    await markJobCompleted(job.id, 'No businesses to refresh');
    return;
  }

  console.log(`[Job ${job.id}] Found ${totalCount} businesses to refresh`);

  const meta: RefreshSiteBusinessesJobMeta = {
    total_businesses: totalCount,
    refreshed_businesses: 0,
    failed_business_ids: [],
  };

  // Update job with initial meta
  await supabase
    .from('jobs')
    .update({ meta, updated_at: new Date().toISOString() })
    .eq('id', job.id);

  let processedCount = 0;
  let pageOffset = 0;

  // Process businesses in pages
  while (pageOffset < totalCount) {
    console.log(
      `[Job ${job.id}] Fetching businesses page (offset: ${pageOffset}, limit: ${PAGE_SIZE})`
    );

    // Fetch a page of businesses with their place_ids and claim status
    const { data: siteBusinesses, error: fetchError } = await supabase
      .from('site_businesses')
      .select(
        `
        business_id,
        claimed_by,
        business:businesses(id, place_id, name)
      `
      )
      .eq('site_id', siteId)
      .range(pageOffset, pageOffset + PAGE_SIZE - 1);

    if (fetchError) {
      throw new Error(`Failed to fetch site businesses: ${fetchError.message}`);
    }

    if (!siteBusinesses || siteBusinesses.length === 0) {
      break;
    }

    // Filter to only businesses with place_ids, include claim status
    const businessesWithPlaceIds = siteBusinesses
      .filter((sb) => sb.business && sb.business.place_id)
      .map((sb) => ({
        id: sb.business!.id,
        place_id: sb.business!.place_id!,
        name: sb.business!.name,
        isClaimed: sb.claimed_by !== null,
      }));

    console.log(
      `[Job ${job.id}] Processing ${businessesWithPlaceIds.length} businesses with place_ids`
    );

    // Process in batches to respect rate limits
    for (let i = 0; i < businessesWithPlaceIds.length; i += BATCH_SIZE) {
      const batch = businessesWithPlaceIds.slice(i, i + BATCH_SIZE);

      // Process batch concurrently
      const results = await Promise.allSettled(
        batch.map((business) =>
          refreshBusiness(job.id, business, PLACES_API_KEY, lookupCityId)
        )
      );

      // Track results
      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        const business = batch[j];

        if (result.status === 'fulfilled' && result.value) {
          meta.refreshed_businesses++;
        } else {
          meta.failed_business_ids.push(business.id);
          if (result.status === 'rejected') {
            console.error(
              `[Job ${job.id}] Failed to refresh "${business.name}":`,
              result.reason
            );
          }
        }
      }

      processedCount += batch.length;

      // Update progress
      const progress = Math.round((processedCount / totalCount) * 100);
      await supabase
        .from('jobs')
        .update({
          meta,
          progress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      console.log(
        `[Job ${job.id}] Progress: ${processedCount}/${totalCount} (${progress}%)`
      );

      // Delay between batches to avoid rate limits
      if (i + BATCH_SIZE < businessesWithPlaceIds.length) {
        await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
      }
    }

    pageOffset += PAGE_SIZE;
  }

  console.log(
    `[Job ${job.id}] Completed refreshing ${meta.refreshed_businesses}/${totalCount} businesses`
  );
  if (meta.failed_business_ids.length > 0) {
    console.log(
      `[Job ${job.id}] Failed to refresh ${meta.failed_business_ids.length} businesses`
    );
  }

  await markJobCompleted(job.id, meta);
}

async function refreshBusiness(
  jobId: string,
  business: { id: string; place_id: string; name: string; isClaimed: boolean },
  apiKey: string,
  lookupCityId: (city: string, state: string) => Promise<string | null>
): Promise<boolean> {
  console.log(
    `[Job ${jobId}] Refreshing "${business.name}" (${business.place_id})`
  );

  const res = await fetchWithRetry(
    `https://places.googleapis.com/v1/places/${business.place_id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': placeDetailsFieldMask.join(','),
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error(
      `[Job ${jobId}] Failed to fetch place details for "${business.name}": ${res.status} ${text}`
    );
    return false;
  }

  const placeDetails = await res.json();

  // Update business record
  // For claimed businesses, only update non-user-editable fields (raw data, photo)
  // For unclaimed businesses, update everything from Google Places
  let businessUpdate;

  if (business.isClaimed) {
    businessUpdate = {
      updated_at: new Date().toISOString(),
      raw: placeDetails,
      main_photo_name: placeDetails.photos?.[0]?.name || undefined,
    };
  } else {
    const { streetAddress, city, state, postalCode } = parseAddressComponents(
      placeDetails.addressComponents || []
    );
    const cityId = await lookupCityId(city, state);

    businessUpdate = {
      name: placeDetails.displayName?.text || undefined,
      formatted_address: placeDetails.formattedAddress || undefined,
      street_address: streetAddress || undefined,
      city: city || undefined,
      state: state || undefined,
      postal_code: postalCode || undefined,
      city_id: cityId,
      website: placeDetails.websiteUri || undefined,
      phone: placeDetails.nationalPhoneNumber || undefined,
      latitude: placeDetails.location?.latitude || undefined,
      longitude: placeDetails.location?.longitude || undefined,
      updated_at: new Date().toISOString(),
      raw: placeDetails,
      hours: placeDetails.regularOpeningHours || undefined,
      main_photo_name: placeDetails.photos?.[0]?.name || undefined,
    };
  }

  const { error: updateError } = await supabase
    .from('businesses')
    .update(businessUpdate)
    .eq('id', business.id);

  if (updateError) {
    console.error(
      `[Job ${jobId}] Failed to update business "${business.name}":`,
      updateError
    );
    return false;
  }

  // Update reviews if available
  if (placeDetails.reviews?.length > 0) {
    const source: ReviewSource = 'google_places';
    const reviews: BusinessReviewInsert[] = placeDetails.reviews.map(
      (r: Review): BusinessReviewInsert => ({
        source,
        business_id: business.id,
        author_image_url: r.authorAttribution?.photoUri || null,
        author_name: r.authorAttribution?.displayName || 'Anonymous',
        author_url: r.authorAttribution?.uri || null,
        rating: r.rating,
        raw: r,
        text: r.text?.text || null,
        time: r.publishTime || null,
        review_id: r.name || crypto.randomUUID(),
      })
    );

    const { error: reviewsError } = await supabase
      .from('business_reviews')
      .upsert(reviews, { onConflict: 'source,review_id' });

    if (reviewsError) {
      console.error(
        `[Job ${jobId}] Failed to upsert reviews for "${business.name}":`,
        reviewsError
      );
    }
  }

  // Update review source with latest rating/count
  const source: ReviewSource = 'google_places';
  const { error: sourceError } = await supabase
    .from('business_review_sources')
    .upsert(
      {
        business_id: business.id,
        provider: source,
        rating: placeDetails.rating || null,
        review_count: placeDetails.userRatingCount || 0,
        url: placeDetails.googleMapsUri || null,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: 'business_id,provider' }
    );

  if (sourceError) {
    console.error(
      `[Job ${jobId}] Failed to upsert review source for "${business.name}":`,
      sourceError
    );
  }

  console.log(`[Job ${jobId}] ✓ Refreshed "${business.name}"`);
  return true;
}
