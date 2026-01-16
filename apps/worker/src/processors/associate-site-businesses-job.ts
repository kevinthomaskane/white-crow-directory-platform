import { type AssociateSiteBusinessesJobMeta } from '@white-crow/shared';
import { supabase } from '../lib/supabase/client';
import type { AssociateSiteBusinessesJob } from '../lib/types';
import { markJobCompleted } from '../lib/update-job-status';

const BATCH_SIZE = 100;

export async function handleAssociateSiteBusinessesJob(
  job: AssociateSiteBusinessesJob
) {
  const { siteId } = job.payload;

  console.log(`[Job ${job.id}] Starting associate site businesses job`);
  console.log(`[Job ${job.id}] Site ID: ${siteId}`);

  // Get the site's categories
  const { data: siteCategories, error: categoriesError } = await supabase
    .from('site_categories')
    .select('category_id')
    .eq('site_id', siteId);

  if (categoriesError) {
    throw new Error(`Failed to fetch site categories: ${categoriesError.message}`);
  }

  const categoryIds = siteCategories?.map((sc) => sc.category_id) || [];
  console.log(`[Job ${job.id}] Found ${categoryIds.length} categories for site`);

  if (categoryIds.length === 0) {
    console.log(`[Job ${job.id}] No categories for site, nothing to associate`);
    await markJobCompleted(job.id, 'No categories configured for site');
    return;
  }

  // Get the site's cities
  const { data: siteCities, error: citiesError } = await supabase
    .from('site_cities')
    .select('city_id')
    .eq('site_id', siteId);

  if (citiesError) {
    throw new Error(`Failed to fetch site cities: ${citiesError.message}`);
  }

  const cityIds = siteCities?.map((sc) => sc.city_id) || [];
  console.log(`[Job ${job.id}] Found ${cityIds.length} cities for site`);

  if (cityIds.length === 0) {
    console.log(`[Job ${job.id}] No cities for site, nothing to associate`);
    await markJobCompleted(job.id, 'No cities configured for site');
    return;
  }

  // Find businesses that match both city and category criteria
  // First get business IDs that are in the site's categories
  // Paginate to handle large result sets (Supabase default limit is 1000)
  const PAGE_SIZE = 1000;
  const allBusinessCategories: { business_id: string }[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: businessCategories, error: bcError } = await supabase
      .from('business_categories')
      .select('business_id')
      .in('category_id', categoryIds)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (bcError) {
      throw new Error(`Failed to fetch business categories: ${bcError.message}`);
    }

    if (businessCategories && businessCategories.length > 0) {
      allBusinessCategories.push(...businessCategories);
      hasMore = businessCategories.length === PAGE_SIZE;
      page++;
    } else {
      hasMore = false;
    }
  }

  const businessIdsInCategories = [
    ...new Set(allBusinessCategories.map((bc) => bc.business_id)),
  ];

  console.log(
    `[Job ${job.id}] Found ${businessIdsInCategories.length} businesses in site categories`
  );

  if (businessIdsInCategories.length === 0) {
    console.log(`[Job ${job.id}] No businesses in site categories`);
    await markJobCompleted(job.id, 'No businesses found in site categories');
    return;
  }

  // Now filter to only businesses that are also in the site's cities
  // Query in batches to avoid URL length limits with large ID arrays
  const QUERY_BATCH_SIZE = 200;
  const businessIds: string[] = [];

  for (let i = 0; i < businessIdsInCategories.length; i += QUERY_BATCH_SIZE) {
    const batchIds = businessIdsInCategories.slice(i, i + QUERY_BATCH_SIZE);

    const { data: matchingBusinesses, error: businessesError } = await supabase
      .from('businesses')
      .select('id')
      .in('id', batchIds)
      .in('city_id', cityIds);

    if (businessesError) {
      throw new Error(`Failed to fetch matching businesses: ${businessesError.message}`);
    }

    if (matchingBusinesses) {
      businessIds.push(...matchingBusinesses.map((b) => b.id));
    }
  }
  console.log(
    `[Job ${job.id}] Found ${businessIds.length} businesses matching both city and category criteria`
  );

  if (businessIds.length === 0) {
    console.log(`[Job ${job.id}] No businesses match both city and category criteria`);
    await markJobCompleted(job.id, 'No matching businesses found');
    return;
  }

  const meta: AssociateSiteBusinessesJobMeta = {
    total_businesses: businessIds.length,
    associated_businesses: 0,
  };

  // Update job with initial meta
  await supabase
    .from('jobs')
    .update({ meta, updated_at: new Date().toISOString() })
    .eq('id', job.id);

  // Insert businesses in batches
  let associatedCount = 0;

  for (let i = 0; i < businessIds.length; i += BATCH_SIZE) {
    const batch = businessIds.slice(i, i + BATCH_SIZE);
    const records = batch.map((businessId) => ({
      site_id: siteId,
      business_id: businessId,
    }));

    const { error: insertError } = await supabase
      .from('site_businesses')
      .upsert(records, { onConflict: 'site_id,business_id', ignoreDuplicates: true });

    if (insertError) {
      console.error(
        `[Job ${job.id}] Failed to insert batch ${i / BATCH_SIZE + 1}:`,
        insertError
      );
      continue;
    }

    associatedCount += batch.length;
    meta.associated_businesses = associatedCount;

    const progress = Math.round((associatedCount / businessIds.length) * 100);

    await supabase
      .from('jobs')
      .update({
        meta,
        progress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    console.log(
      `[Job ${job.id}] Progress: ${associatedCount}/${businessIds.length} (${progress}%)`
    );
  }

  console.log(
    `[Job ${job.id}] Completed associating ${associatedCount} businesses with site`
  );
  await markJobCompleted(job.id, meta);
}
