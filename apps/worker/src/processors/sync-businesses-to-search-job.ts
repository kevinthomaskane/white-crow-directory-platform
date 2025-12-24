import {
  type SyncBusinessesToSearchJobMeta,
  createTypesenseClient,
  BUSINESSES_COLLECTION,
  businessesSchema,
  type BusinessDocument,
} from '@white-crow/shared';
import { supabase } from '../lib/supabase/client';
import type { SyncBusinessesToSearchJob } from '../lib/types';
import { markJobCompleted } from '../lib/update-job-status';

const BATCH_SIZE = 100;

export async function handleSyncBusinessesToSearchJob(
  job: SyncBusinessesToSearchJob
) {
  const { siteId, fullResync } = job.payload;
  const typesense = createTypesenseClient({
    apiKey: process.env.TYPESENSE_API_KEY!,
    host: process.env.TYPESENSE_HOST!,
    port: 8108,
    protocol: process.env.NODE_ENV === 'production' ? 'https' : 'http',
  });

  console.log(`[Job ${job.id}] Starting sync businesses to search job`);
  console.log(`[Job ${job.id}] Site ID: ${siteId}, Full resync: ${fullResync}`);

  // Ensure collection exists
  try {
    await typesense.collections(BUSINESSES_COLLECTION).retrieve();
    console.log(`[Job ${job.id}] Collection "${BUSINESSES_COLLECTION}" exists`);
  } catch (err) {
    if ((err as { httpStatus?: number }).httpStatus === 404) {
      console.log(
        `[Job ${job.id}] Creating collection "${BUSINESSES_COLLECTION}"`
      );
      await typesense.collections().create(businessesSchema);
    } else {
      throw err;
    }
  }

  // Get businesses for this site with their categories
  const { data: siteBusinesses, error: bizError } = await supabase
    .from('site_businesses')
    .select(
      `
      business_id,
      business:businesses(
        id,
        name,
        description,
        editorial_summary,
        formatted_address,
        city,
        state,
        phone,
        website,
        latitude,
        longitude
      )
    `
    )
    .eq('site_id', siteId);

  if (bizError) {
    throw new Error(`Failed to fetch site businesses: ${bizError.message}`);
  }

  if (!siteBusinesses || siteBusinesses.length === 0) {
    console.log(`[Job ${job.id}] No businesses found for site`);
    await markJobCompleted(job.id, 'No businesses to sync');
    return;
  }

  const businessIds = siteBusinesses.map((sb) => sb.business_id);
  console.log(`[Job ${job.id}] Found ${businessIds.length} businesses to sync`);

  // Get categories for these businesses
  const { data: businessCategories, error: catError } = await supabase
    .from('business_categories')
    .select(
      `
      business_id,
      category:categories(id, name)
    `
    )
    .in('business_id', businessIds);

  if (catError) {
    throw new Error(`Failed to fetch business categories: ${catError.message}`);
  }

  // Build category lookup
  const categoryMap = new Map<string, { ids: string[]; names: string[] }>();
  for (const bc of businessCategories || []) {
    const cat = bc.category as { id: string; name: string } | null;
    if (!cat) continue;

    const existing = categoryMap.get(bc.business_id) || { ids: [], names: [] };
    existing.ids.push(cat.id);
    existing.names.push(cat.name);
    categoryMap.set(bc.business_id, existing);
  }

  // Get all site_ids for each business (for multi-tenant filtering)
  const { data: allSiteBusinesses, error: allSitesError } = await supabase
    .from('site_businesses')
    .select('business_id, site_id')
    .in('business_id', businessIds);

  if (allSitesError) {
    throw new Error(
      `Failed to fetch all site businesses: ${allSitesError.message}`
    );
  }

  const siteIdsMap = new Map<string, string[]>();
  for (const sb of allSiteBusinesses || []) {
    const existing = siteIdsMap.get(sb.business_id) || [];
    existing.push(sb.site_id);
    siteIdsMap.set(sb.business_id, existing);
  }

  const meta: SyncBusinessesToSearchJobMeta = {
    total_businesses: siteBusinesses.length,
    synced_businesses: 0,
  };

  // Update job with initial meta
  await supabase
    .from('jobs')
    .update({ meta, updated_at: new Date().toISOString() })
    .eq('id', job.id);

  // Sync in batches
  let syncedCount = 0;

  for (let i = 0; i < siteBusinesses.length; i += BATCH_SIZE) {
    const batch = siteBusinesses.slice(i, i + BATCH_SIZE);

    const documents: BusinessDocument[] = batch
      .map((sb) => {
        const biz = sb.business as {
          id: string;
          name: string;
          description: string | null;
          editorial_summary: string | null;
          formatted_address: string | null;
          city: string | null;
          state: string | null;
          phone: string | null;
          website: string | null;
          latitude: number | null;
          longitude: number | null;
        } | null;

        if (!biz) return null;

        const categories = categoryMap.get(biz.id) || { ids: [], names: [] };
        const siteIds = siteIdsMap.get(biz.id) || [];

        // id field cannot exist in the document as Typesense uses it internally
        const doc: BusinessDocument = {
          business_id: biz.id,
          name: biz.name,
          description: biz.description || biz.editorial_summary || undefined,
          formatted_address: biz.formatted_address || undefined,
          city: biz.city || undefined,
          state: biz.state || undefined,
          phone: biz.phone || undefined,
          website: biz.website || undefined,
          site_ids: siteIds,
          category_ids: categories.ids,
          category_names: categories.names,
          review_count: 0,
        };

        if (biz.latitude && biz.longitude) {
          doc.location = [biz.latitude, biz.longitude];
        }

        return doc;
      })
      .filter((doc): doc is BusinessDocument => doc !== null);

    if (documents.length === 0) continue;

    try {
      await typesense
        .collections(BUSINESSES_COLLECTION)
        .documents()
        .import(documents, { action: 'upsert' });

      syncedCount += documents.length;
    } catch (err) {
      console.error(`[Job ${job.id}] Failed to sync batch:`, err);
      continue;
    }

    meta.synced_businesses = syncedCount;
    const progress = Math.round((syncedCount / siteBusinesses.length) * 100);

    await supabase
      .from('jobs')
      .update({
        meta,
        progress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    console.log(
      `[Job ${job.id}] Progress: ${syncedCount}/${siteBusinesses.length} (${progress}%)`
    );
  }

  console.log(
    `[Job ${job.id}] Completed syncing ${syncedCount} businesses to search`
  );
  await markJobCompleted(job.id, meta);
}
