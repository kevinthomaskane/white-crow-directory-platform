import {
  ReviewSource,
  type GooglePlacesSearchJobMeta,
} from '@white-crow/shared';
import { supabase } from '../lib/supabase/client';
import type { BusinessReviewInsert, GooglePlacesSearchJob } from '../lib/types';
import { markJobCompleted } from '../lib/update-job-status';

type PlaceMinimal = {
  id: string;
};
type GooglePlacesSearchResponse = {
  places: PlaceMinimal[];
  nextPageToken?: string;
};

type AddressComponent = {
  types?: string[];
  longText: string;
};

type Review = {
  name: string;
  rating: number;
  text: { text: string };
  publishTime: string;
  authorAttribution?: {
    displayName: string;
    photoUri: string;
    uri: string;
  };
};

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

const placeDetailsFieldMask = [
  'id',
  'displayName',
  'formattedAddress',
  'addressComponents',
  'location',
  'websiteUri',
  'nationalPhoneNumber',
  'editorialSummary',
  'regularOpeningHours',
  'photos',
  'rating',
  'reviews',
  'googleMapsUri',
  'userRatingCount',
];

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  attempt = 0
): Promise<Response> {
  const res = await fetch(url, options);

  if (res.ok) {
    return res;
  }

  // Retry on 5xx errors or 429 (rate limit)
  const shouldRetry = res.status >= 500 || res.status === 429;

  if (shouldRetry && attempt < MAX_RETRIES) {
    const delay = BASE_DELAY_MS * Math.pow(2, attempt); // 500ms, 1000ms, 2000ms...
    console.log(
      `  Retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})...`
    );
    await new Promise((r) => setTimeout(r, delay));
    return fetchWithRetry(url, options, attempt + 1);
  }

  return res;
}

export async function handleGooglePlacesSearchJob(job: GooglePlacesSearchJob) {
  const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  if (!PLACES_API_KEY) {
    throw new Error('GOOGLE_PLACES_API_KEY env var is required');
  }

  const { queryText, categoryId, siteId } = job.payload;
  const lookupCityId = createCityLookupCache();

  console.log(`[Job ${job.id}] Starting Google Places search job`);
  console.log(`[Job ${job.id}] Query: "${queryText}"`);
  console.log(`[Job ${job.id}] Category ID: ${categoryId}`);
  if (siteId) {
    console.log(`[Job ${job.id}] Site ID: ${siteId}`);
  }

  const places = await runSearchQueries({
    apiKey: PLACES_API_KEY,
    query: queryText,
  });

  // No places found - this is a valid "completed" state
  if (!places || places.length === 0) {
    console.log(`[Job ${job.id}] No places found for query`);
    await markJobCompleted(job.id, 'No places found for query');
    return;
  }

  console.log(`[Job ${job.id}] Found ${places.length} place(s) to process`);

  const meta: GooglePlacesSearchJobMeta = {
    place_ids: places.map((place) => place.id),
    processed_place_ids: [],
    total_places: places.length,
    processed_places: 0,
  };

  const { error } = await supabase
    .from('jobs')
    .update({
      updated_at: new Date().toISOString(),
      meta,
    })
    .eq('id', job.id);

  if (error) {
    console.error(`[Job ${job.id}] Failed to update job meta:`, error);
  }

  for (let i = 0; i < places.length; i += 1) {
    const place = places[i];
    const placeNumber = i + 1;
    console.log(
      `\n\n\n\n\n[Job ${job.id}] Processing place ${placeNumber}/${places.length} (${place.id})`
    );

    const res = await fetchWithRetry(
      `https://places.googleapis.com/v1/places/${place.id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': PLACES_API_KEY,
          'X-Goog-FieldMask': placeDetailsFieldMask.join(','),
        },
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error(
        `[Job ${job.id}] Failed to fetch place details for ${place.id}: ${res.status} ${text}`
      );
      continue;
    }
    const placeDetails = await res.json();
    const businessName = placeDetails.displayName?.text || 'Unknown';
    console.log(
      `[Job ${job.id}] Fetched details for: "${businessName}" (${place.id})`
    );
    const { state, city, postalCode, streetAddress } = parseAddressComponents(
      placeDetails.addressComponents || []
    );

    // Look up city_id from city and state
    const cityId = await lookupCityId(city, state);

    // Upsert business into the database
    const { data: businessData, error: businessInsertError } = await supabase
      .from('businesses')
      .upsert(
        {
          place_id: placeDetails.id,
          name: placeDetails.displayName?.text || null,
          formatted_address: placeDetails.formattedAddress || null,
          website: placeDetails.websiteUri || null,
          phone: placeDetails.nationalPhoneNumber || null,
          latitude: placeDetails.location?.latitude || null,
          longitude: placeDetails.location?.longitude || null,
          updated_at: new Date().toISOString(),
          raw: placeDetails,
          editorial_summary: placeDetails.editorialSummary?.text || null,
          city,
          state,
          city_id: cityId,
          hours: placeDetails.regularOpeningHours || null,
          main_photo_name: placeDetails.photos?.[0]?.name || null,
          postal_code: postalCode,
          street_address: streetAddress,
        },
        { onConflict: 'place_id' }
      )
      .select('id')
      .single();

    if (businessInsertError) {
      console.error(
        `[Job ${job.id}] Failed to upsert business "${businessName}" (${placeDetails.id}):`,
        businessInsertError
      );
      continue;
    }

    console.log(
      `[Job ${job.id}] ✅  Upserted business "${businessName}" (ID: ${businessData.id})`
    );

    // Add new record to business_categories joining table
    const { error: businessCategoryError } = await supabase
      .from('business_categories')
      .upsert(
        {
          business_id: businessData.id,
          category_id: categoryId,
        },
        { onConflict: 'business_id,category_id' }
      );

    if (businessCategoryError) {
      console.error(
        `[Job ${job.id}] Failed to insert business category for "${businessName}" (${businessData.id}):`,
        businessCategoryError
      );
      continue;
    }

    console.log(
      `[Job ${job.id}] ✅ Associated category ${categoryId} with business "${businessName}"`
    );

    // Associate business with site if siteId is provided
    if (siteId) {
      const { error: siteBusinessError } = await supabase
        .from('site_businesses')
        .upsert(
          {
            site_id: siteId,
            business_id: businessData.id,
          },
          { onConflict: 'site_id,business_id' }
        );

      if (siteBusinessError) {
        console.error(
          `[Job ${job.id}] Failed to associate business "${businessName}" with site ${siteId}:`,
          siteBusinessError
        );
      } else {
        console.log(
          `[Job ${job.id}] ✅ Associated business "${businessName}" with site ${siteId}`
        );
      }
    }

    if (placeDetails.reviews?.length > 0) {
      const source: ReviewSource = 'google_places';
      const reviewCount = placeDetails.reviews.length;
      console.log(
        `[Job ${job.id}] Inserting ${reviewCount} review(s) for "${businessName}"`
      );

      const reviews: BusinessReviewInsert[] = placeDetails.reviews.map(
        (r: Review): BusinessReviewInsert => ({
          source,
          business_id: businessData.id,
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
      const { error: businessReviewsInsertError } = await supabase
        .from('business_reviews')
        .upsert(reviews, { onConflict: 'source,review_id' });

      if (businessReviewsInsertError) {
        console.error(
          `[Job ${job.id}] Failed to insert reviews for "${businessName}" (${businessData.id}):`,
          businessReviewsInsertError
        );
      } else {
        const { error: reviewSourceError } = await supabase
          .from('business_review_sources')
          .upsert(
            {
              business_id: businessData.id,
              provider: source,
              rating: placeDetails.rating,
              review_count: placeDetails.userRatingCount || 0,
              url: placeDetails.googleMapsUri || null,
              last_synced_at: new Date().toISOString(),
            },
            { onConflict: 'business_id,provider' }
          );
        if (reviewSourceError) {
          console.error(
            `[Job ${job.id}] Failed to upsert review source for "${businessName}":`,
            reviewSourceError
          );
        }
        console.log(
          `[Job ${job.id}] ✓ Inserted ${reviewCount} review(s) for "${businessName}"`
        );
      }
    } else {
      console.log(`[Job ${job.id}] No reviews found for "${businessName}"`);
    }

    meta.processed_places = meta.processed_places + 1;
    meta.processed_place_ids.push(places[i].id);
    const progress = Math.round(((i + 1) / places.length) * 100);
    const { error: jobUpdateError } = await supabase
      .from('jobs')
      .update({
        updated_at: new Date().toISOString(),
        progress,
        meta,
      })
      .eq('id', job.id);

    if (jobUpdateError) {
      console.error(
        `[Job ${job.id}] Failed to update job progress:`,
        jobUpdateError
      );
    } else {
      console.log(
        `[Job ${job.id}] Progress: ${placeNumber}/${places.length} (${progress}%) - "${businessName}" completed`
      );
    }
  }

  console.log(
    `[Job ${job.id}] ✓ Completed processing ${meta.processed_places}/${places.length} place(s)`
  );
  await markJobCompleted(job.id, meta);
}

function parseAddressComponents(components: AddressComponent[]) {
  const result = {
    streetNumber: '',
    route: '',
    city: '',
    state: '',
    postalCode: '',
  };

  const typeMap: Record<string, keyof typeof result> = {
    street_number: 'streetNumber',
    route: 'route',
    locality: 'city',
    administrative_area_level_1: 'state',
    postal_code: 'postalCode',
  };

  for (const component of components) {
    for (const type of component.types ?? []) {
      const key = typeMap[type];
      if (!key) continue;
      if (result[key]) continue;

      result[key] = component.longText;
      break; // stop once we matched a relevant type
    }
  }

  return {
    streetAddress: [result.streetNumber, result.route]
      .filter(Boolean)
      .join(' '),
    city: result.city,
    state: result.state,
    postalCode: result.postalCode,
  };
}

async function runSearchQueries(params: { apiKey: string; query: string }) {
  const { apiKey, query } = params;

  const allPlaces: PlaceMinimal[] = [];
  let pageToken: string | undefined;
  let pageNumber = 0;

  do {
    pageNumber += 1;
    console.log(
      `Searching for "${query}" - Page ${pageNumber}${
        pageToken ? ' (pagination)' : ''
      }`
    );

    const res = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,nextPageToken',
        },
        body: JSON.stringify({
          textQuery: query,
          ...(pageToken ? { pageToken } : {}),
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Google Places API error: ${res.status} ${text}`);
    }

    const data: GooglePlacesSearchResponse = await res.json();

    if (data.places?.length) {
      allPlaces.push(...data.places);
      console.log(
        `  Found ${data.places.length} place(s) on page ${pageNumber} (total: ${allPlaces.length})`
      );
    } else {
      console.log(`  No places found on page ${pageNumber}`);
    }

    pageToken = data.nextPageToken;

    // REQUIRED delay before next page
    if (pageToken) {
      console.log(`  Waiting 1.5s before fetching next page...`);
      await new Promise((r) => setTimeout(r, 1500));
    }
  } while (pageToken);

  return allPlaces;
}
