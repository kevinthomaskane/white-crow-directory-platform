'use server';

import { createServiceRoleClient } from '@white-crow/shared';
import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse, VerticalAssetType } from '@/lib/types';

export async function getVerticalAssetUploadUrl(
  verticalSlug: string,
  assetType: VerticalAssetType
): Promise<ActionsResponse<{ uploadUrl: string; publicUrl: string }>> {
  if (!verticalSlug) {
    return { ok: false, error: 'Vertical slug is required.' };
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

  const bucketName = verticalSlug;

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

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${filename}`;

  return {
    ok: true,
    data: {
      uploadUrl: data.signedUrl,
      publicUrl,
    },
  };
}

export async function saveVerticalHeroUrl(
  verticalId: string,
  heroUrl: string
): Promise<ActionsResponse<null>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  const { error } = await supabase
    .from('verticals')
    .update({ default_hero_url: heroUrl })
    .eq('id', verticalId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: null };
}
