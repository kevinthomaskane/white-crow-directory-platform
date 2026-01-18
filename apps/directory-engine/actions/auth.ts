'use server';

import { createServiceRoleClient } from '@white-crow/shared';
import type { ActionsResponse } from '@/lib/types';

type ProfileExists = { exists: boolean };

/**
 * Check if a user has a profile for a specific site.
 * Used during login to verify the user is registered on this site.
 */
export async function checkUserProfile(
  email: string,
  siteId: string
): Promise<ActionsResponse<ProfileExists>> {
  if (!email || !siteId) {
    return { ok: false, error: 'Email and site ID are required.' };
  }

  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .eq('site_id', siteId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned (expected when profile doesn't exist)
    return { ok: false, error: error.message };
  }

  return { ok: true, data: { exists: !!data } };
}

type ProfileCreated = { id: string };

/**
 * Create a profile for a user on a specific site.
 * Called after successful signup or when an existing user signs up on a new site.
 */
export async function createProfile(
  userId: string,
  siteId: string,
  displayName: string,
  email: string
): Promise<ActionsResponse<ProfileCreated>> {
  if (!userId || !siteId || !displayName || !email) {
    return { ok: false, error: 'All fields are required.' };
  }

  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      site_id: siteId,
      display_name: displayName,
      email: email,
      role: 'user',
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      // Duplicate key - profile already exists for this user/site, return success
      return { ok: true, data: { id: userId } };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, data: { id: data.id } };
}
