'use server';

import { createServiceRoleClient } from '@white-crow/shared';
import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse, SiteAssetType } from '@/lib/types';

const ASSET_TYPE_TO_COLUMN: Record<SiteAssetType, string> = {
  hero: 'hero_path',
  logo: 'logo_path',
  favicon: 'favicon_path',
};

export async function getSiteAssetUploadUrl(
  siteDomain: string,
  assetType: SiteAssetType
): Promise<ActionsResponse<{ uploadUrl: string; path: string }>> {
  if (!siteDomain) {
    return { ok: false, error: 'Site domain is required.' };
  }

  // Verify user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in to upload assets.' };
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
        error: `Failed to create bucket: ${createError.message}`,
      };
    }
  }

  // Generate unique filename with timestamp
  const timestamp = Date.now();
  const filename = `${assetType}-${timestamp}`;

  // Generate signed upload URL (valid for 5 minutes)
  const { data, error } = await serviceClient.storage
    .from(bucketName)
    .createSignedUploadUrl(filename);

  if (error || !data) {
    return {
      ok: false,
      error: `Failed to generate upload URL: ${error?.message}`,
    };
  }

  // Return the path (bucket/filename) instead of full URL
  const path = `${bucketName}/${filename}`;

  return {
    ok: true,
    data: {
      uploadUrl: data.signedUrl,
      path,
    },
  };
}

export async function saveSiteAssetPath(
  siteId: string,
  assetType: SiteAssetType,
  path: string
): Promise<ActionsResponse<null>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  const column = ASSET_TYPE_TO_COLUMN[assetType];

  const { error } = await supabase
    .from('sites')
    .update({ [column]: path })
    .eq('id', siteId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: null };
}
