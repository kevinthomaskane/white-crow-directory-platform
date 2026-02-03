'use server';

import { createServiceRoleClient } from '@white-crow/shared';
import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse } from '@/lib/types';

interface UpdateBusinessPremiumFieldsPayload {
  siteBusinessId: string;
  description: string | null;
  hasNewImage?: boolean;
  siteDomain?: string;
}

interface UpdateBusinessPremiumFieldsResult {
  updated: true;
  imageUploadUrl?: string;
  imagePath?: string;
}

export async function updateBusinessPremiumFields(
  payload: UpdateBusinessPremiumFieldsPayload
): Promise<ActionsResponse<UpdateBusinessPremiumFieldsResult>> {
  const { siteBusinessId, description, hasNewImage, siteDomain } = payload;

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

  // Fetch site_business and verify ownership + premium status
  const { data: siteBusiness, error: fetchError } = await supabase
    .from('site_businesses')
    .select('id, claimed_by, plan')
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

  const isPremium = Boolean(siteBusiness.plan);

  if (!isPremium) {
    return {
      ok: false,
      error: 'A Pro subscription is required to access these features.',
    };
  }

  // Build updates for site_businesses table
  const siteBusinessUpdates: Record<string, unknown> = {};

  if (description !== undefined) {
    siteBusinessUpdates.description = description;
  }

  // Handle image upload if requested
  let imageUploadUrl: string | undefined;
  let imagePath: string | undefined;

  if (hasNewImage) {
    if (!siteDomain) {
      return {
        ok: false,
        error: 'Site domain is required for image upload.',
      };
    }

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

    // Generate signed upload URL
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

    siteBusinessUpdates.main_photo = imagePath;
  }

  // Update site_businesses table
  if (Object.keys(siteBusinessUpdates).length > 0) {
    const { error: updateError } = await supabase
      .from('site_businesses')
      .update(siteBusinessUpdates)
      .eq('id', siteBusinessId);

    if (updateError) {
      console.error('Error updating site_business:', updateError);
      return {
        ok: false,
        error: 'Failed to update business. Please try again.',
      };
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
