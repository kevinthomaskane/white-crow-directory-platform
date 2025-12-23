// run from apps/directory-engine folder with: node scripts/add-cityid-to-businesses.js

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const BATCH_SIZE = 100;

/**
 * Build a lookup map: (city_name_lowercase, state_name_lowercase) -> city_id
 */
async function buildCityLookupMap() {
  console.log('Building city lookup map...');

  // Fetch all cities with their state codes
  const { data: cities, error: citiesError } = await supabase
    .from('cities')
    .select('id, name, states(name)');

  if (citiesError) throw citiesError;

  const map = new Map();
  for (const city of cities || []) {
    const cityName = city.name?.trim().toLowerCase();
    const stateName = city.states?.name?.trim().toLowerCase();

    if (cityName && stateName) {
      const key = `${cityName}|${stateName}`;
      map.set(key, city.id);
    }
  }

  console.log(`Loaded ${map.size} cities into lookup map.`);
  return map;
}

/**
 * Fetch businesses that have city/state but no city_id
 */
async function fetchBusinessesWithoutCityId(offset = 0) {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, city, state')
    .is('city_id', null)
    .not('city', 'is', null)
    .not('state', 'is', null)
    .range(offset, offset + BATCH_SIZE - 1);

  if (error) throw error;
  return data || [];
}

/**
 * Update a batch of businesses with their city_id
 */
async function updateBusinessCityIds(updates) {
  if (updates.length === 0) return;

  // Supabase doesn't support batch updates with different values,
  // so we need to update one at a time or use a transaction
  for (const { id, city_id } of updates) {
    const { error } = await supabase
      .from('businesses')
      .update({ city_id, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error(`Failed to update business ${id}:`, error.message);
    }
  }
}

async function backfillCityIds() {
  const cityLookup = await buildCityLookupMap();

  let offset = 0;
  let totalProcessed = 0;
  let totalMatched = 0;
  let totalUnmatched = 0;
  const unmatchedCities = new Map(); // Track unmatched city/state combos

  console.log('Starting backfill...\n');

  while (true) {
    const businesses = await fetchBusinessesWithoutCityId(offset);

    if (businesses.length === 0) {
      break;
    }

    const updates = [];
    let batchUnmatched = 0;

    for (const business of businesses) {
      const cityName = business.city?.trim().toLowerCase();
      const stateName = business.state?.trim().toLowerCase();

      if (!cityName || !stateName) continue;

      const key = `${cityName}|${stateName}`;
      const cityId = cityLookup.get(key);

      if (cityId) {
        updates.push({ id: business.id, city_id: cityId });
        totalMatched++;
      } else {
        totalUnmatched++;
        batchUnmatched++;
        // Track unmatched for reporting
        const unmatchedKey = `${business.city}, ${business.state}`;
        unmatchedCities.set(
          unmatchedKey,
          (unmatchedCities.get(unmatchedKey) || 0) + 1
        );
      }
    }

    await updateBusinessCityIds(updates);

    totalProcessed += businesses.length;
    console.log(
      `Processed ${totalProcessed} businesses (${totalMatched} matched, ${totalUnmatched} unmatched)`
    );

    if (businesses.length < BATCH_SIZE) {
      break;
    }

    // Only increment offset by unmatched count, since matched records
    // are removed from the result set (they now have city_id set)
    offset += batchUnmatched;
  }

  console.log('\n--- Backfill Complete ---');
  console.log(`Total processed: ${totalProcessed}`);
  console.log(`Total matched: ${totalMatched}`);
  console.log(`Total unmatched: ${totalUnmatched}`);

  if (unmatchedCities.size > 0) {
    console.log('\nUnmatched cities (city, state -> count):');
    const sorted = [...unmatchedCities.entries()].sort((a, b) => b[1] - a[1]);
    for (const [city, count] of sorted.slice(0, 20)) {
      console.log(`  ${city}: ${count}`);
    }
    if (sorted.length > 20) {
      console.log(`  ... and ${sorted.length - 20} more`);
    }
  }
}

backfillCityIds().catch((err) => {
  console.error('Error during backfill:', err);
  process.exitCode = 1;
});
