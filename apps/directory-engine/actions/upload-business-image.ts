'use server';

import { createServiceRoleClient } from '@white-crow/shared';
import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse, SiteBusinessOverrides } from '@/lib/types';

/**
 * Gets a signed upload URL for a business main image.
 * Only available for pro users with a claimed business.
 */
export async function getBusinessImageUploadUrl(
  siteBusinessId: string,
  siteDomain: string
): Promise<ActionsResponse<{ uploadUrl: string; path: string }>> {
  if (!siteBusinessId || !siteDomain) {
    return { ok: false, error: 'Missing required fields.' };
  }

  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in to upload images.' };
  }

  // Fetch site_business and verify ownership + pro plan
  const { data: siteBusiness, error: fetchError } = await supabase
    .from('site_businesses')
    .select('id, claimed_by, plan')
    .eq('id', siteBusinessId)
    .single();

  if (fetchError || !siteBusiness) {
    return { ok: false, error: 'Business not found.' };
  }

  if (siteBusiness.claimed_by !== user.id) {
    return { ok: false, error: 'You do not have permission to upload images for this business.' };
  }

  if (!siteBusiness.plan) {
    return { ok: false, error: 'A Pro subscription is required to upload custom images.' };
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
  const { data, error } = await serviceClient.storage
    .from(bucketName)
    .createSignedUploadUrl(filename);

  if (error || !data) {
    return {
      ok: false,
      error: `Failed to generate upload URL: ${error?.message}`,
    };
  }

  const path = `${bucketName}/${filename}`;

  return {
    ok: true,
    data: {
      uploadUrl: data.signedUrl,
      path,
    },
  };
}

/**
 * Saves the main image path to the site_business overrides.
 */
export async function saveBusinessMainImage(
  siteBusinessId: string,
  imagePath: string
): Promise<ActionsResponse<{ updated: true }>> {
  if (!siteBusinessId || !imagePath) {
    return { ok: false, error: 'Missing required fields.' };
  }

  const supabase = await createClient();

  // Verify user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  // Fetch site_business and verify ownership + pro plan
  const { data: siteBusiness, error: fetchError } = await supabase
    .from('site_businesses')
    .select('id, claimed_by, plan, overrides')
    .eq('id', siteBusinessId)
    .single();

  if (fetchError || !siteBusiness) {
    return { ok: false, error: 'Business not found.' };
  }

  if (siteBusiness.claimed_by !== user.id) {
    return { ok: false, error: 'You do not have permission to update this business.' };
  }

  if (!siteBusiness.plan) {
    return { ok: false, error: 'A Pro subscription is required to set a custom main image.' };
  }

  // Update overrides with new main_photo_name
  const existingOverrides = (siteBusiness.overrides as SiteBusinessOverrides) || {};
  const newOverrides: SiteBusinessOverrides = {
    ...existingOverrides,
    main_photo_name: imagePath,
  };

  const { error: updateError } = await supabase
    .from('site_businesses')
    .update({ overrides: newOverrides })
    .eq('id', siteBusinessId);

  if (updateError) {
    console.error('Error saving main image:', updateError);
    return { ok: false, error: 'Failed to save image. Please try again.' };
  }

  return { ok: true, data: { updated: true } };
}
