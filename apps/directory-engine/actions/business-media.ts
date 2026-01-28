'use server';

import { createServiceRoleClient } from '@white-crow/shared';
import { createClient } from '@/lib/supabase/server';
import type { ActionsResponse } from '@/lib/types';

export interface BusinessMediaItem {
  id: string;
  file_path: string;
  alt_text: string | null;
  sort_order: number;
}

export interface BusinessVideoItem {
  id: string;
  embed_url: string;
}

type VideoProvider = 'youtube' | 'vimeo';

interface ParsedVideo {
  provider: VideoProvider;
  videoId: string;
}

/**
 * Parses a YouTube or Vimeo URL and extracts the video ID.
 */
function parseVideoUrl(url: string): ParsedVideo | null {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return { provider: 'youtube', videoId: match[1] };
    }
  }

  // Vimeo patterns
  const vimeoPatterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of vimeoPatterns) {
    const match = url.match(pattern);
    if (match) {
      return { provider: 'vimeo', videoId: match[1] };
    }
  }

  return null;
}

/**
 * Gets a signed upload URL for a new business media image.
 * Does not create the database record - call saveBusinessMedia after successful upload.
 */
export async function getBusinessMediaUploadUrl(
  siteBusinessId: string,
  siteDomain: string
): Promise<ActionsResponse<{ uploadUrl: string; path: string }>> {
  if (!siteBusinessId || !siteDomain) {
    return { ok: false, error: 'Missing required fields.' };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  // Verify ownership and pro plan
  const { data: siteBusiness } = await supabase
    .from('site_businesses')
    .select('id, claimed_by, plan')
    .eq('id', siteBusinessId)
    .single();

  if (!siteBusiness) {
    return { ok: false, error: 'Business not found.' };
  }

  if (siteBusiness.claimed_by !== user.id) {
    return { ok: false, error: 'You do not have permission to upload media for this business.' };
  }

  if (!siteBusiness.plan) {
    return { ok: false, error: 'A Pro subscription is required to upload additional images.' };
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
  const filename = `business-media/${siteBusinessId}/gallery-${timestamp}`;

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

  const path = `${bucketName}/${filename}`;

  return {
    ok: true,
    data: {
      uploadUrl: uploadData.signedUrl,
      path,
    },
  };
}

/**
 * Saves a business media record after successful upload.
 */
export async function saveBusinessMedia(
  siteBusinessId: string,
  filePath: string
): Promise<ActionsResponse<{ mediaId: string }>> {
  if (!siteBusinessId || !filePath) {
    return { ok: false, error: 'Missing required fields.' };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  // Verify ownership and pro plan
  const { data: siteBusiness } = await supabase
    .from('site_businesses')
    .select('id, claimed_by, plan')
    .eq('id', siteBusinessId)
    .single();

  if (!siteBusiness) {
    return { ok: false, error: 'Business not found.' };
  }

  if (siteBusiness.claimed_by !== user.id) {
    return { ok: false, error: 'You do not have permission to add media to this business.' };
  }

  if (!siteBusiness.plan) {
    return { ok: false, error: 'A Pro subscription is required to add additional images.' };
  }

  // Get current max sort_order
  const { data: existingMedia } = await supabase
    .from('site_business_media')
    .select('sort_order')
    .eq('site_business_id', siteBusinessId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSortOrder = (existingMedia?.[0]?.sort_order ?? -1) + 1;

  // Create the media record
  const { data: mediaRecord, error: insertError } = await supabase
    .from('site_business_media')
    .insert({
      site_business_id: siteBusinessId,
      type: 'image',
      file_path: filePath,
      sort_order: nextSortOrder,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (insertError || !mediaRecord) {
    console.error('Error creating media record:', insertError);
    return { ok: false, error: 'Failed to save media record.' };
  }

  return {
    ok: true,
    data: { mediaId: mediaRecord.id },
  };
}

/**
 * Deletes a business media image.
 */
export async function deleteBusinessMedia(
  mediaId: string,
  siteBusinessId: string
): Promise<ActionsResponse<{ deleted: true }>> {
  if (!mediaId || !siteBusinessId) {
    return { ok: false, error: 'Missing required fields.' };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  // Verify ownership
  const { data: siteBusiness } = await supabase
    .from('site_businesses')
    .select('id, claimed_by')
    .eq('id', siteBusinessId)
    .single();

  if (!siteBusiness || siteBusiness.claimed_by !== user.id) {
    return { ok: false, error: 'Business not found or access denied.' };
  }

  // Get the media record to get the file path
  const { data: media } = await supabase
    .from('site_business_media')
    .select('id, file_path')
    .eq('id', mediaId)
    .eq('site_business_id', siteBusinessId)
    .single();

  if (!media) {
    return { ok: false, error: 'Media not found.' };
  }

  // Delete from database
  const { error: deleteError } = await supabase
    .from('site_business_media')
    .delete()
    .eq('id', mediaId);

  if (deleteError) {
    console.error('Error deleting media:', deleteError);
    return { ok: false, error: 'Failed to delete media.' };
  }

  // Delete from storage (if file_path exists)
  if (media.file_path) {
    const serviceClient = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    // Parse bucket and path from file_path (format: "bucket/path/to/file")
    const [bucket, ...pathParts] = media.file_path.split('/');
    const filePath = pathParts.join('/');

    if (bucket && filePath) {
      await serviceClient.storage.from(bucket).remove([filePath]);
    }
  }

  return { ok: true, data: { deleted: true } };
}

/**
 * Saves a video embed URL. Replaces any existing video.
 */
export async function saveBusinessVideo(
  siteBusinessId: string,
  embedUrl: string
): Promise<ActionsResponse<{ videoId: string; provider: VideoProvider; videoId_parsed: string }>> {
  if (!siteBusinessId || !embedUrl) {
    return { ok: false, error: 'Missing required fields.' };
  }

  const parsed = parseVideoUrl(embedUrl);
  if (!parsed) {
    return { ok: false, error: 'Invalid URL. Please enter a valid YouTube or Vimeo URL.' };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  // Verify ownership and pro plan
  const { data: siteBusiness } = await supabase
    .from('site_businesses')
    .select('id, claimed_by, plan')
    .eq('id', siteBusinessId)
    .single();

  if (!siteBusiness) {
    return { ok: false, error: 'Business not found.' };
  }

  if (siteBusiness.claimed_by !== user.id) {
    return { ok: false, error: 'You do not have permission to add videos to this business.' };
  }

  if (!siteBusiness.plan) {
    return { ok: false, error: 'A Pro subscription is required to add video embeds.' };
  }

  // Delete any existing video first (only allow one)
  await supabase
    .from('site_business_media')
    .delete()
    .eq('site_business_id', siteBusinessId)
    .eq('type', 'video');

  // Create the video record
  const { data: videoRecord, error: insertError } = await supabase
    .from('site_business_media')
    .insert({
      site_business_id: siteBusinessId,
      type: 'video',
      embed_url: embedUrl,
      sort_order: 0,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (insertError || !videoRecord) {
    console.error('Error creating video record:', insertError);
    return { ok: false, error: 'Failed to save video. Please try again.' };
  }

  return {
    ok: true,
    data: {
      videoId: videoRecord.id,
      provider: parsed.provider,
      videoId_parsed: parsed.videoId,
    },
  };
}

/**
 * Deletes the video embed for a business.
 */
export async function deleteBusinessVideo(
  siteBusinessId: string
): Promise<ActionsResponse<{ deleted: true }>> {
  if (!siteBusinessId) {
    return { ok: false, error: 'Missing required fields.' };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  // Verify ownership
  const { data: siteBusiness } = await supabase
    .from('site_businesses')
    .select('id, claimed_by')
    .eq('id', siteBusinessId)
    .single();

  if (!siteBusiness || siteBusiness.claimed_by !== user.id) {
    return { ok: false, error: 'Business not found or access denied.' };
  }

  // Delete the video
  const { error: deleteError } = await supabase
    .from('site_business_media')
    .delete()
    .eq('site_business_id', siteBusinessId)
    .eq('type', 'video');

  if (deleteError) {
    console.error('Error deleting video:', deleteError);
    return { ok: false, error: 'Failed to delete video.' };
  }

  return { ok: true, data: { deleted: true } };
}
